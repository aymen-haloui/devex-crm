import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token } = await params;
  const url = request.nextUrl.searchParams.get('url') || '/';

  try {
    const decoded = decodeURIComponent(url);
    const log = await prisma.emailLog.findFirst({ where: { trackingToken: token } });

    if (log) {
      await prisma.emailLog.update({
        where: { id: log.id },
        data: {
          clickedAt: log.clickedAt ?? new Date(),
          clickCount: { increment: 1 },
          status: ['sent', 'opened'].includes(log.status) ? 'clicked' : log.status,
        },
      });

      if (log.campaignId) {
        await prisma.campaign.update({
          where: { id: log.campaignId },
          data: { clickCount: { increment: 1 } },
        });
      }
    }

    return NextResponse.redirect(decoded);
  } catch {
    return NextResponse.redirect('/');
  }
}
