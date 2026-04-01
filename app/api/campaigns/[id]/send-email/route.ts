import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';
import { resolveRecipientsForCampaign } from '@/lib/marketing/processor';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const auth = await getRequestAuthContext(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, organizationId } = auth;
    const allowed = await checkPermission(userId, 'campaigns', 'update');
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      templateId,
      segmentId,
      scheduledAt,
      timezone,
      emailsPerMinute,
    } = body;

    // Validate campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.organizationId !== organizationId) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    if (templateId) {
      const template = await prisma.emailTemplate.findFirst({
        where: { id: templateId, organizationId, isActive: true },
      });
      if (!template) {
        return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
      }
    }

    const scheduleDate = scheduledAt ? new Date(scheduledAt) : null;
    const status = scheduleDate && scheduleDate > new Date() ? 'scheduled' : 'sending';

    const updated = await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        templateId: templateId ?? campaign.templateId,
        segmentId: segmentId ?? campaign.segmentId,
        timezone: timezone ?? campaign.timezone ?? 'UTC',
        emailsPerMinute: emailsPerMinute ? Number(emailsPerMinute) : campaign.emailsPerMinute,
        scheduledAt: scheduleDate,
        status,
        cancelledAt: null,
        completedAt: null,
      },
    });

    const recipientCount = await resolveRecipientsForCampaign(
      prisma,
      campaign.id,
      organizationId,
      segmentId ?? campaign.segmentId
    );

    if (recipientCount === 0) {
      return NextResponse.json({ success: false, error: 'No recipients matched segment' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        campaign: updated,
        totalRecipients: recipientCount,
        queued: true,
      },
    });
  } catch (error) {
    console.error('Error sending campaign emails:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
