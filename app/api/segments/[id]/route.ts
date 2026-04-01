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

    const allowed = await checkPermission(auth.userId, 'campaigns', 'edit');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.segment.findFirst({
      where: { id, organizationId: auth.organizationId, isActive: true },
    });

    if (!existing) return NextResponse.json({ success: false, error: 'Segment not found' }, { status: 404 });

    const body = await request.json();

    const updated = await prisma.segment.update({
      where: { id: existing.id },
      data: {
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        entityType: body.entityType ?? existing.entityType,
        rulesJson: body.rulesJson ?? existing.rulesJson,
        isActive: typeof body.isActive === 'boolean' ? body.isActive : existing.isActive,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating segment:', error);
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

    const allowed = await checkPermission(auth.userId, 'campaigns', 'delete');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.segment.findFirst({
      where: { id, organizationId: auth.organizationId, isActive: true },
    });

    if (!existing) return NextResponse.json({ success: false, error: 'Segment not found' }, { status: 404 });

    await prisma.segment.update({
      where: { id: existing.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, data: { id: existing.id } });
  } catch (error) {
    console.error('Error deleting segment:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
