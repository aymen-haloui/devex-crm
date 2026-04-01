import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = auth;
    const allowed = await checkPermission(auth.userId, 'campaigns', 'view');
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const status = searchParams.get('status');
    const recipientEmail = searchParams.get('recipientEmail');

    const where: {
      organizationId: string;
      campaignId?: string;
      status?: string;
      recipientEmail?: { contains: string; mode: 'insensitive' };
    } = { organizationId };
    if (campaignId) where.campaignId = campaignId;
    if (status) where.status = status;
    if (recipientEmail) where.recipientEmail = { contains: recipientEmail, mode: 'insensitive' };

    const logs = await prisma.emailLog.findMany({
      where,
      include: {
        campaign: true,
        template: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 250,
    });

    const summary = await prisma.emailLog.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: true,
    });

    const campaignAnalytics = campaignId
      ? await prisma.campaign.findFirst({
          where: { id: campaignId, organizationId },
          select: {
            id: true,
            name: true,
            status: true,
            totalRecipients: true,
            sentCount: true,
            failedCount: true,
            openCount: true,
            clickCount: true,
            unsubscribeCount: true,
            startedAt: true,
            completedAt: true,
          },
        })
      : null;

    return NextResponse.json({
      success: true,
      data: logs,
      summary: Object.fromEntries(
        summary.map((s) => [s.status, s._count])
      ),
      analytics: campaignAnalytics,
    });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
