import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processCampaignBatch } from '@/lib/marketing/processor';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const internalKey = request.headers.get('x-internal-key');
    const expected = process.env.CAMPAIGN_WORKER_KEY;

    if (expected && internalKey !== expected) {
      return NextResponse.json({ success: false, error: 'Unauthorized worker call' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const campaignId = body?.campaignId as string | undefined;
    const organizationId = body?.organizationId as string | undefined;

    if (campaignId && organizationId) {
      const result = await processCampaignBatch(prisma, campaignId, organizationId);
      return NextResponse.json({ success: true, data: [result] });
    }

    const dueCampaigns = await prisma.campaign.findMany({
      where: {
        deletedAt: null,
        status: { in: ['scheduled', 'sending'] },
        OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
        AND: [{ OR: [{ processingLockUntil: null }, { processingLockUntil: { lt: new Date() } }] }],
      },
      select: { id: true, organizationId: true },
      take: 20,
      orderBy: { updatedAt: 'asc' },
    });

    const results = [] as Array<{ processed: number; sent: number; failed: number; status: string }>;

    for (const item of dueCampaigns) {
      const result = await processCampaignBatch(prisma, item.id, item.organizationId);
      results.push(result);
    }

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        campaignsProcessed: dueCampaigns.length,
      },
    });
  } catch (error) {
    console.error('Error processing campaigns:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
