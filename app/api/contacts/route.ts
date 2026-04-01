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

    const hasPermission = await checkPermission(userId, 'contacts', 'view');
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const ownerId = searchParams.get('ownerId');
    const accountId = searchParams.get('accountId');
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

    if (status) {
      where.status = status;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
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
      prisma.contact.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: serialize(contacts),

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
    console.error('Error fetching contacts:', error);
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

    const hasPermission = await checkPermission(userId, 'contacts', 'create');
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      firstName, lastName, email, phone, mobile, homePhone, otherPhone,
      assistant, asstPhone, title, department, dob, fax, skypeId,
      twitter, secondaryEmail, emailOptOut, source, reportingTo,
      accountId, vendorName, mailingStreet, mailingCity, mailingState,
      mailingZip, mailingCountry, otherStreet, otherCity, otherState,
      otherZip, otherCountry, description, status, tags
    } = body;

    if (!firstName || !email) {
      return NextResponse.json(
        { success: false, error: 'First name and email are required' },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        organizationId,
        firstName,
        lastName: lastName || '',
        email,
        phone,
        mobile,
        homePhone,
        otherPhone,
        assistant,
        asstPhone,
        title,
        department,
        dob: dob ? new Date(dob) : null,
        fax,
        skypeId,
        twitter,
        secondaryEmail,
        emailOptOut: !!emailOptOut,
        source,
        reportingTo,
        accountId,
        vendorName,
        mailingStreet,
        mailingCity,
        mailingState,
        mailingZip,
        mailingCountry,
        otherStreet,
        otherCity,
        otherState,
        otherZip,
        otherCountry,
        description,
        ownerId: userId,
        status: status || 'active',
        tags: tags || [],
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
        data: serialize(contact),

      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts - Bulk delete or single delete
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
    const hasPermission = await checkPermission(userId, 'contacts', 'delete');
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
        { success: false, error: 'Contact IDs are required' },
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
    await prisma.contact.updateMany({
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
        message: `${ids.length} contacts deleted successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting contacts:', error);
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
