import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

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

    const hasPermission = await checkPermission(userId, 'activities', 'view');
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const relatedToId = searchParams.get('relatedToId');
    const relatedToType = searchParams.get('relatedToType');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }
    if (relatedToId) {
      where.relatedToId = relatedToId;
    }
    if (relatedToType) {
      where.relatedToType = relatedToType;
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
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
      prisma.activity.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: activities,
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
    console.error('Error fetching activities:', error);
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

    const hasPermission = await checkPermission(userId, 'activities', 'create');
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      type, title, description, subject, dueDate, scheduledDate,
      relatedToId, relatedToType, status, priority, remindAt, repeat,
      location, venue, allDay, participants,
      duration, callType, callPurpose, callAgenda, callResult
    } = body;

    if (!title || !type) {
      return NextResponse.json(
        { success: false, error: 'Title and type are required' },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        organizationId,
        type,
        title,
        description,
        subject,
        dueDate: dueDate ? new Date(dueDate) : null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        ownerId: userId,
        relatedToId,
        relatedToType,
        status: status || 'open',
        priority: priority || 'normal',
        remindAt: remindAt ? new Date(remindAt) : null,
        repeat: repeat || null,
        location,
        venue,
        allDay: allDay || false,
        participants: participants || null,
        duration: duration || null,
        callType: callType || null,
        callPurpose: callPurpose || null,
        callAgenda: callAgenda || null,
        callResult: callResult || null,
      } as any,
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: activity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating activity:', error);
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
