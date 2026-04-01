import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const allowed = await checkPermission(auth.userId, 'settings', 'edit');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.customFieldDefinition.findFirst({
      where: { id, organizationId: auth.organizationId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Field not found' }, { status: 404 });
    }

    const body = await request.json();

    const updated = await prisma.customFieldDefinition.update({
      where: { id: existing.id },
      data: {
        label: body.label ?? existing.label,
        fieldType: body.fieldType ?? existing.fieldType,
        options: body.options ?? existing.options,
        isRequired: typeof body.isRequired === 'boolean' ? body.isRequired : existing.isRequired,
        isActive: typeof body.isActive === 'boolean' ? body.isActive : existing.isActive,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating custom field:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const allowed = await checkPermission(auth.userId, 'settings', 'edit');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.customFieldDefinition.findFirst({
      where: { id, organizationId: auth.organizationId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Field not found' }, { status: 404 });
    }

    await prisma.customFieldDefinition.update({
      where: { id: existing.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, data: { id: existing.id } });
  } catch (error) {
    console.error('Error deleting custom field:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
