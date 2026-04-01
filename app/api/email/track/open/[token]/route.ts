import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PIXEL = Buffer.from('R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  try {
    const { token } = await params;

    const log = await prisma.emailLog.findFirst({ where: { trackingToken: token } });
    if (log) {
      await prisma.emailLog.update({
        where: { id: log.id },
        data: {
          openedAt: log.openedAt ?? new Date(),
          openCount: { increment: 1 },
          lastOpenedIp: request.headers.get('x-forwarded-for') || null,
          lastOpenedUserAgent: request.headers.get('user-agent') || null,
          status: log.status === 'sent' ? 'opened' : log.status,
        },
      });

      if (log.campaignId) {
        await prisma.campaign.update({
          where: { id: log.campaignId },
          data: { openCount: { increment: 1 } },
        });
      }
    }

    return new NextResponse(PIXEL, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch {
    return new NextResponse(PIXEL, { headers: { 'Content-Type': 'image/gif' } });
  }
}
