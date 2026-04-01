import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';
import { serialize } from '@/lib/api-helpers';


export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { userId, organizationId } = auth;
    const allowed = await checkPermission(userId, 'campaigns', 'view');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const channel = searchParams.get('channel');
    const status = searchParams.get('status');
    const ownerId = searchParams.get('ownerId');
    const id = searchParams.get('id');

    const where: any = { organizationId, deletedAt: null };

    if (id) {
      where.id = id;
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (channel) {
      where.channel = channel;
    }

    if (status) {
      where.status = status;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        template: { select: { id: true, name: true, subject: true } },
        segment: { select: { id: true, name: true, entityType: true } },
        owner: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totals = campaigns.reduce(
      (acc, campaign) => {
        acc.spent += Number(campaign.spent || 0);
        acc.budget += Number(campaign.budget || 0);
        acc.revenue += Number(campaign.revenue || 0);
        acc.leads += campaign.leadsGenerated;
        return acc;
      },
      { spent: 0, budget: 0, revenue: 0, leads: 0 }
    );

    return NextResponse.json({
      success: true,
      data: serialize(campaigns),
      meta: {
        total: campaigns.length,
        totals: serialize(totals),
      },
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { userId, organizationId } = auth;
    const allowed = await checkPermission(userId, 'campaigns', 'create');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const {
      name,
      channel,
      budget,
      startDate,
      endDate,
      status,
      timezone,
      scheduledAt,
      emailsPerMinute,
      templateId,
      segmentId,
    } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Campaign name is required' }, { status: 400 });
    }

    const created = await prisma.campaign.create({
      data: {
        organizationId,
        name,
        channel: channel || 'email',
        budget: budget ? BigInt(budget) : null,
        spent: BigInt(0),
        revenue: BigInt(0),
        leadsGenerated: 0,
        emailsPerMinute: emailsPerMinute ? Number(emailsPerMinute) : 60,
        timezone: timezone || 'UTC',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'draft',
        templateId: templateId || null,
        segmentId: segmentId || null,
        ownerId: userId,
      },
      include: {
        template: { select: { id: true, name: true, subject: true } },
        segment: { select: { id: true, name: true, entityType: true } },
      },
    });

    return NextResponse.json({ success: true, data: serialize(created) }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
