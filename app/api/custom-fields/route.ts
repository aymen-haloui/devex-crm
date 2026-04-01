import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const entityType = new URL(request.url).searchParams.get('entityType');

    const fields = await prisma.customFieldDefinition.findMany({
      where: {
        organizationId: auth.organizationId,
        ...(entityType ? { entityType } : {}),
        isActive: true,
      },
      orderBy: [{ entityType: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({ success: true, data: fields });
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const allowed = await checkPermission(auth.userId, 'settings', 'edit');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { entityType, key, label, fieldType, options, isRequired } = body;

    if (!entityType || !key || !label || !fieldType) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const created = await prisma.customFieldDefinition.create({
      data: {
        organizationId: auth.organizationId,
        entityType,
        key,
        label,
        fieldType,
        options: options ?? null,
        isRequired: Boolean(isRequired),
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating custom field:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
