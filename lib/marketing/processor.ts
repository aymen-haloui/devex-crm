import { PrismaClient } from '../generated-prisma';
import { Resend } from 'resend';
import { buildRecipientVariables, renderTemplate, withTracking } from './template';
import { matchSegment, safeParseSegmentRules } from './segments';

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'paused' | 'completed' | 'cancelled';

const PAGE_SIZE = 500;
const LOCK_MS = 45_000;
const MAX_RETRIES = 3;

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
}

function getSender(organization: { senderEmail: string | null; senderName: string | null }): string {
  const fallback = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  if (!organization.senderEmail) return fallback;
  if (organization.senderName) return `${organization.senderName} <${organization.senderEmail}>`;
  return organization.senderEmail;
}

function getRetryBackoffMs(nextRetryCount: number): number {
  const baseMs = 60_000;
  return baseMs * Math.pow(2, Math.max(0, nextRetryCount - 1));
}

async function getHistoryForEmails(
  prisma: PrismaClient,
  organizationId: string,
  emails: string[]
): Promise<Map<string, { sentCount: number; openCount: number; clickCount: number }>> {
  const map = new Map<string, { sentCount: number; openCount: number; clickCount: number }>();
  if (!emails.length) return map;

  const rows = await prisma.emailLog.groupBy({
    by: ['recipientEmail', 'status'],
    where: {
      organizationId,
      recipientEmail: { in: emails },
    },
    _count: true,
  });

  for (const row of rows) {
    const existing = map.get(row.recipientEmail) || { sentCount: 0, openCount: 0, clickCount: 0 };
    if (['sent', 'opened', 'clicked'].includes(row.status)) existing.sentCount += row._count;
    if (['opened', 'clicked'].includes(row.status)) existing.openCount += row._count;
    if (row.status === 'clicked') existing.clickCount += row._count;
    map.set(row.recipientEmail, existing);
  }

  return map;
}

export async function resolveRecipientsForCampaign(
  prisma: PrismaClient,
  campaignId: string,
  organizationId: string,
  segmentId?: string | null
): Promise<number> {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, organizationId, deletedAt: null },
    include: { segment: true },
  });
  if (!campaign) return 0;

  const selectedSegmentId = segmentId ?? campaign.segmentId;
  if (!selectedSegmentId) return 0;

  const segment = await prisma.segment.findFirst({
    where: { id: selectedSegmentId, organizationId, isActive: true },
  });
  if (!segment) return 0;

  const rules = safeParseSegmentRules(segment.rulesJson);
  const needsCampaignHistory = rules.conditions.some((c) => c.source === 'campaign');

  let cursorId: string | undefined;

  for (;;) {
    const page =
      segment.entityType === 'contact'
        ? await prisma.contact.findMany({
            where: { organizationId, deletedAt: null },
            select: { id: true, email: true, firstName: true, lastName: true, customFields: true },
            orderBy: { id: 'asc' },
            cursor: cursorId ? { id: cursorId } : undefined,
            skip: cursorId ? 1 : 0,
            take: PAGE_SIZE,
          })
        : await prisma.lead.findMany({
            where: { organizationId, deletedAt: null },
            select: { id: true, email: true, firstName: true, lastName: true, company: true, customFields: true },
            orderBy: { id: 'asc' },
            cursor: cursorId ? { id: cursorId } : undefined,
            skip: cursorId ? 1 : 0,
            take: PAGE_SIZE,
          });

    if (!page.length) break;

    const historyMap = needsCampaignHistory
      ? await getHistoryForEmails(prisma, organizationId, page.map((p) => p.email))
      : new Map<string, { sentCount: number; openCount: number; clickCount: number }>();

    const rows = page
      .filter((entity) => {
        const customFields = entity.customFields && typeof entity.customFields === 'object' && !Array.isArray(entity.customFields)
          ? (entity.customFields as Record<string, unknown>)
          : {};

        const metrics = historyMap.get(entity.email) || { sentCount: 0, openCount: 0, clickCount: 0 };

        return matchSegment(entity as unknown as Record<string, unknown>, customFields, rules, metrics);
      })
      .map((entity) => {
        const customFields = entity.customFields && typeof entity.customFields === 'object' && !Array.isArray(entity.customFields)
          ? entity.customFields
          : undefined;
        const company =
          'company' in entity
            ? ((entity as { company?: string | null }).company ?? null)
            : null;

        return {
          organizationId,
          campaignId,
          recipientType: segment.entityType,
          recipientId: entity.id,
          email: entity.email,
          firstName: entity.firstName,
          lastName: entity.lastName,
          company,
          customFields,
          status: 'pending' as const,
        };
      });

    if (rows.length) {
      await prisma.campaignRecipient.createMany({
        data: rows,
        skipDuplicates: true,
      });
    }

    cursorId = page[page.length - 1].id;
  }

  const totalRecipients = await prisma.campaignRecipient.count({ where: { campaignId } });
  await prisma.campaign.update({ where: { id: campaignId }, data: { totalRecipients } });
  return totalRecipients;
}

export async function processCampaignBatch(
  prisma: PrismaClient,
  campaignId: string,
  organizationId: string,
  actorId?: string
): Promise<{ processed: number; sent: number; failed: number; status: CampaignStatus }> {
  const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  const now = new Date();
  const lockUntil = new Date(now.getTime() + LOCK_MS);

  const lock = await prisma.campaign.updateMany({
    where: {
      id: campaignId,
      organizationId,
      deletedAt: null,
      status: { in: ['scheduled', 'sending'] },
      AND: [
        { OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }] },
        { OR: [{ processingLockUntil: null }, { processingLockUntil: { lt: now } }] },
      ],
    },
    data: {
      status: 'sending',
      processingLockUntil: lockUntil,
      startedAt: now,
    },
  });

  if (lock.count === 0) {
    return { processed: 0, sent: 0, failed: 0, status: 'scheduled' };
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, organizationId, deletedAt: null },
    include: { template: true, organization: true },
  });

  if (!campaign) {
    return { processed: 0, sent: 0, failed: 0, status: 'draft' };
  }

  const emailsPerMinute = Math.max(1, campaign.emailsPerMinute || 60);
  const elapsedMs = campaign.lastProcessedAt ? now.getTime() - campaign.lastProcessedAt.getTime() : 60_000;
  const throttleQuota = Math.floor((elapsedMs / 60_000) * emailsPerMinute);

  if (throttleQuota <= 0) {
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { processingLockUntil: null },
    });
    return { processed: 0, sent: 0, failed: 0, status: 'sending' };
  }

  const recipients = await prisma.campaignRecipient.findMany({
    where: {
      campaignId: campaign.id,
      sentAt: null,
      retryCount: { lt: MAX_RETRIES },
      OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
    },
    orderBy: [{ nextAttemptAt: 'asc' }, { createdAt: 'asc' }],
    take: throttleQuota,
  });

  if (!recipients.length) {
    const remainingRetryable = await prisma.campaignRecipient.count({
      where: { campaignId: campaign.id, sentAt: null, retryCount: { lt: MAX_RETRIES } },
    });

    const nextStatus: CampaignStatus = remainingRetryable === 0 ? 'completed' : 'sending';
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: nextStatus,
        completedAt: nextStatus === 'completed' ? now : null,
        processingLockUntil: null,
        lastProcessedAt: now,
      },
    });

    return { processed: 0, sent: 0, failed: 0, status: nextStatus };
  }

  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const blacklisted = await prisma.emailBlacklist.findFirst({
      where: { organizationId, email: recipient.email },
    });

    if (blacklisted) {
      await prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: {
          status: 'blocked',
          retryCount: MAX_RETRIES,
          lastError: 'Email blacklisted',
          error: 'Email blacklisted',
          processedAt: now,
          nextAttemptAt: null,
        },
      });
      continue;
    }

    const trackingToken = `${campaign.id}_${recipient.id}_${Date.now()}`;
    const unsubscribeToken = `${campaign.id}_${recipient.id}_unsub_${Date.now()}`;

    const variables = buildRecipientVariables({
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      email: recipient.email,
      company: recipient.company,
      customFields:
        recipient.customFields && typeof recipient.customFields === 'object' && !Array.isArray(recipient.customFields)
          ? (recipient.customFields as Record<string, unknown>)
          : {},
    });

    const subject = renderTemplate(campaign.template?.subject || campaign.name, variables);
    const previewText = renderTemplate(campaign.template?.previewText || '', variables);
    const htmlBody = renderTemplate(campaign.template?.htmlContent || `<p>${campaign.name}</p>`, variables);
    const html = withTracking(htmlBody, {
      appBaseUrl: getBaseUrl(),
      trackingToken,
      unsubscribeToken,
    });

    let sendStatus: 'sent' | 'failed' = 'sent';
    let messageId: string | null = null;
    let sendError: string | null = null;

    try {
      if (!resendClient) {
        throw new Error('RESEND_API_KEY is not configured');
      }

      const response = await resendClient.emails.send({
        from: getSender(campaign.organization),
        to: recipient.email,
        subject,
        html,
      });

      if (response.error) {
        sendStatus = 'failed';
        sendError = response.error.message;
      } else {
        messageId = response.data?.id || null;
      }
    } catch (error) {
      sendStatus = 'failed';
      sendError = error instanceof Error ? error.message : 'Unknown send error';
    }

    await prisma.emailLog.create({
      data: {
        organizationId,
        campaignId: campaign.id,
        templateId: campaign.templateId,
        recipientEmail: recipient.email,
        recipientName: [recipient.firstName, recipient.lastName].filter(Boolean).join(' ') || null,
        recipientType: recipient.recipientType,
        recipientId: recipient.recipientId,
        subject,
        previewText,
        status: sendStatus,
        messageId,
        error: sendError,
        sentAt: sendStatus === 'sent' ? now : null,
        trackingToken,
        unsubscribeToken,
      },
    });

    if (sendStatus === 'sent') {
      sent += 1;
      await prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: {
          status: 'sent',
          sentAt: now,
          processedAt: now,
          nextAttemptAt: null,
          error: null,
          lastError: null,
        },
      });
    } else {
      const nextRetryCount = recipient.retryCount + 1;
      const terminalFailure = nextRetryCount >= MAX_RETRIES;
      if (terminalFailure) failed += 1;

      await prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: {
          status: terminalFailure ? 'failed' : 'pending',
          retryCount: nextRetryCount,
          error: sendError,
          lastError: sendError,
          processedAt: now,
          nextAttemptAt: terminalFailure ? null : new Date(now.getTime() + getRetryBackoffMs(nextRetryCount)),
        },
      });
    }
  }

  const remainingRetryable = await prisma.campaignRecipient.count({
    where: { campaignId: campaign.id, sentAt: null, retryCount: { lt: MAX_RETRIES } },
  });

  const nextStatus: CampaignStatus = remainingRetryable === 0 ? 'completed' : 'sending';

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      sentCount: { increment: sent },
      failedCount: { increment: failed },
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? now : null,
      processingLockUntil: null,
      lastProcessedAt: now,
    },
  });

  if (actorId) {
    await prisma.activity.create({
      data: {
        organizationId,
        type: 'email',
        title: `Campaign batch processed: ${campaign.name}`,
        description: `Processed ${recipients.length}, sent ${sent}, failed ${failed}`,
        ownerId: actorId,
        status: 'completed',
      },
    });
  }

  return { processed: recipients.length, sent, failed, status: nextStatus };
}
