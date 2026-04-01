import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const allowed = await checkPermission(auth.userId, 'campaigns', 'view');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const entityType = new URL(request.url).searchParams.get('entityType');

    const segments = await prisma.segment.findMany({
      where: {
        organizationId: auth.organizationId,
        isActive: true,
        ...(entityType ? { entityType } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: segments });
  } catch (error) {
    console.error('Error fetching segments:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const allowed = await checkPermission(auth.userId, 'campaigns', 'create');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { name, entityType, description, rulesJson } = body;

    if (!name || !entityType || !rulesJson) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const created = await prisma.segment.create({
      data: {
        organizationId: auth.organizationId,
        ownerId: auth.userId,
        name,
        entityType,
        description: description || null,
        rulesJson,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating segment:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
