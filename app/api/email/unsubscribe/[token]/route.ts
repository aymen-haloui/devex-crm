import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function performUnsubscribe(token: string, reason?: string) {
  const log = await prisma.emailLog.findFirst({
    where: { unsubscribeToken: token },
    include: { campaign: true },
  });

  if (!log) return { ok: false, message: 'Invalid unsubscribe link' };

  await prisma.emailBlacklist.upsert({
    where: {
      organizationId_email: {
        organizationId: log.organizationId,
        email: log.recipientEmail,
      },
    },
    create: {
      organizationId: log.organizationId,
      email: log.recipientEmail,
      reason: reason || 'User unsubscribed',
      source: 'unsubscribe_link',
    },
    update: {
      reason: reason || 'User unsubscribed',
      source: 'unsubscribe_link',
    },
  });

  await prisma.unsubscribeEvent.create({
    data: {
      organizationId: log.organizationId,
      email: log.recipientEmail,
      emailLogId: log.id,
      reason: reason || null,
      token,
    },
  });

  await prisma.emailLog.update({
    where: { id: log.id },
    data: {
      unsubscribedAt: new Date(),
      status: 'unsubscribed',
    },
  });

  if (log.campaignId) {
    await prisma.campaign.update({
      where: { id: log.campaignId },
      data: { unsubscribeCount: { increment: 1 } },
    });
  }

  return { ok: true, message: 'You have been unsubscribed successfully.' };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token } = await params;
  const result = await performUnsubscribe(token);

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 32px; max-width: 640px; margin: auto;">
        <h2>${result.ok ? 'Unsubscribed' : 'Error'}</h2>
        <p>${result.message}</p>
      </body>
    </html>
  `;

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token } = await params;
  const body = await request.json().catch(() => ({}));
  const result = await performUnsubscribe(token, body?.reason);

  return NextResponse.json({ success: result.ok, message: result.message }, { status: result.ok ? 200 : 400 });
}
