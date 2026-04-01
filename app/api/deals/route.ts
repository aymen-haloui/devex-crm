import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';
import { serialize } from '@/lib/api-helpers';


export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { userId, organizationId } = auth;

    const hasPermission = await checkPermission(userId, 'deals', 'view');
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const stage = searchParams.get('stage');
    const accountId = searchParams.get('accountId');
    const ownerId = searchParams.get('ownerId');
    const minValue = searchParams.get('minValue');
    const maxValue = searchParams.get('maxValue');
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (id) {
      where.id = id;
    }

    if (stage) {
      where.stage = stage;
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (minValue || maxValue) {
      where.value = {};
      if (minValue) where.value.gte = BigInt(minValue);
      if (maxValue) where.value.lte = BigInt(maxValue);
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          account: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.deal.count({ where }),
    ]);

    // Calculate pipeline values
    const allDeals = await prisma.deal.findMany({
      where,
      select: { value: true },
    });

    const pipelineValue = deals.reduce((sum: number, d: { value: bigint }) => sum + Number(d.value), 0);
    const totalValue = allDeals.reduce((sum: number, d: { value: bigint }) => sum + Number(d.value), 0);

    return NextResponse.json(
      {
        success: true,
        data: serialize(deals),

        meta: {
          page,
          limit,
          total,
          hasMore: page * limit < total,
          pipelineValue,
          totalValue,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { userId, organizationId } = auth;

    const hasPermission = await checkPermission(userId, 'deals', 'create');
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name, type, value, probability, stage, source, nextStep,
      expectedCloseDate, actualCloseDate, lostReason, closedWon,
      accountId, contactId, description
    } = body;

    if (!name || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Deal name and value are required' },
        { status: 400 }
      );
    }

    const deal = await prisma.deal.create({
      data: {
        organizationId,
        name,
        type,
        value: BigInt(value),
        probability: probability || 50,
        stage: stage || 'prospecting',
        source,
        nextStep,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        actualCloseDate: actualCloseDate ? new Date(actualCloseDate) : null,
        lostReason,
        closedWon: !!closedWon,
        accountId,
        contactId,
        description,
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        account: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: serialize(deal),

      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
