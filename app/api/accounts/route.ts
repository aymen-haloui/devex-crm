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

    const hasPermission = await checkPermission(userId, 'accounts', 'view');
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const industry = searchParams.get('industry');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const ownerId = searchParams.get('ownerId');
    const id = searchParams.get('id');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (id) {
      // when id is requested we ignore other filters and just fetch that record
      where.id = id;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { website: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (industry) {
      where.industry = industry;
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.account.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: serialize(accounts),

        meta: {
          page,
          limit,
          total,
          hasMore: page * limit < total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching accounts:', error);
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

    const hasPermission = await checkPermission(userId, 'accounts', 'create');
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name, website, tickerSymbol, parentAccountId, accountNumber,
      type, industry, employees, annualRevenue, rating, phone, fax,
      ownership, sicCode, site, billingStreet, billingCity,
      billingState, billingZip, billingCountry, shippingStreet,
      shippingCity, shippingState, shippingZip, shippingCountry,
      description, status
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Account name is required' },
        { status: 400 }
      );
    }

    const account = await prisma.account.create({
      data: {
        organizationId,
        name,
        website,
        tickerSymbol,
        parentAccountId,
        accountNumber,
        type,
        industry,
        employees: employees ? Number(employees) : null,
        annualRevenue: annualRevenue ? BigInt(annualRevenue) : null,
        rating,
        phone,
        fax,
        ownership,
        sicCode,
        site,
        billingStreet,
        billingCity,
        billingState,
        billingZip,
        billingCountry,
        shippingStreet,
        shippingCity,
        shippingState,
        shippingZip,
        shippingCountry,
        description,
        ownerId: userId,
        status: status || 'active',
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: serialize(account),

      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts - Bulk delete or single delete
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { userId, organizationId } = auth;

    // Check permission
    const hasPermission = await checkPermission(userId, 'accounts', 'delete');
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const idsString = searchParams.get('ids');

    if (!idsString) {
      return NextResponse.json(
        { success: false, error: 'Account IDs are required' },
        { status: 400 }
      );
    }

    const ids = idsString.split(',').filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid IDs provided' },
        { status: 400 }
      );
    }

    // Soft delete (using deletedAt)
    await prisma.account.updateMany({
      where: {
        id: { in: ids },
        organizationId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `${ids.length} accounts deleted successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting accounts:', error);
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
