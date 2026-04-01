import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';
import { leadCreateSchema } from '@/lib/validation/leads';
import { serialize } from '@/lib/api-helpers';


// GET /api/leads - List all leads
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');
    const ownerId = searchParams.get('ownerId');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Check permission
    const hasPermission = await checkPermission(userId, 'leads', 'view');
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Build where clause
    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (minScore || maxScore) {
      where.score = {};
      if (minScore) where.score.gte = parseInt(minScore);
      if (maxScore) where.score.lte = parseInt(maxScore);
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch leads
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
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
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: serialize(leads),
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
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create a new lead
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

    // Check permission
    const hasPermission = await checkPermission(userId, 'leads', 'create');
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = leadCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid lead payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      title,
      email,
      secondaryEmail,
      phone,
      mobile,
      fax,
      company,
      website,
      status,
      source,
      industry,
      employees,
      annualRevenue,
      rating,
      emailOptOut,
      skypeId,
      twitter,
      street,
      city,
      state,
      zip,
      country,
      description,
      image,
      score,
      customFields
    } = parsed.data;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        organizationId,
        ownerId: userId,
        firstName,
        lastName,
        title: title || null,
        email,
        secondaryEmail: secondaryEmail || null,
        phone: phone || null,
        mobile: mobile || null,
        fax: fax || null,
        company: company || null,
        website: website || null,
        status: status || 'new',
        source: source || null,
        industry: industry || null,
        employees: employees ? parseInt(employees.toString()) : null,
        annualRevenue: annualRevenue ? BigInt(annualRevenue) : null,
        rating: rating || null,
        emailOptOut: !!emailOptOut,
        skypeId: skypeId || null,
        twitter: twitter || null,
        street: street || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        country: country || null,
        description: description || null,
        image: image || null,
        score: score || 0,
        customFields: (customFields as any) || {},
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
        data: serialize(lead),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/leads - Bulk delete or single delete
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
    const hasPermission = await checkPermission(userId, 'leads', 'delete');
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
        { success: false, error: 'Lead IDs are required' },
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
    await prisma.lead.updateMany({
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
        message: `${ids.length} leads deleted successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting leads:', error);
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
