import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkPermission(auth.userId, 'activities', 'view');
    if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const activity = await prisma.activity.findFirst({
      where: { id, organizationId: auth.organizationId, deletedAt: null },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!activity) return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: activity }, { status: 200 });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkPermission(auth.userId, 'activities', 'edit');
    if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.activity.findFirst({
      where: { id, organizationId: auth.organizationId, deletedAt: null },
    });
    if (!existing) return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });

    const body = await request.json();

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        type: body.type ?? existing.type,
        title: body.title ?? existing.title,
        description: body.description ?? existing.description,
        subject: body.subject ?? existing.subject,
        dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : existing.dueDate,
        scheduledDate: body.scheduledDate !== undefined ? (body.scheduledDate ? new Date(body.scheduledDate) : null) : existing.scheduledDate,
        relatedToId: body.relatedToId ?? (existing as any).relatedToId,
        relatedToType: body.relatedToType ?? (existing as any).relatedToType,
        status: body.status ?? existing.status,
        priority: body.priority ?? (existing as any).priority,
        remindAt: body.remindAt !== undefined ? (body.remindAt ? new Date(body.remindAt) : null) : (existing as any).remindAt,
        repeat: body.repeat !== undefined ? body.repeat : (existing as any).repeat,
        location: body.location !== undefined ? body.location : (existing as any).location,
        venue: body.venue !== undefined ? body.venue : (existing as any).venue,
        allDay: body.allDay !== undefined ? body.allDay : (existing as any).allDay,
        participants: body.participants !== undefined ? body.participants : (existing as any).participants,
        duration: body.duration !== undefined ? body.duration : (existing as any).duration,
        callType: body.callType !== undefined ? body.callType : (existing as any).callType,
        callPurpose: body.callPurpose !== undefined ? body.callPurpose : (existing as any).callPurpose,
        callAgenda: body.callAgenda !== undefined ? body.callAgenda : (existing as any).callAgenda,
        callResult: body.callResult !== undefined ? body.callResult : (existing as any).callResult,
      } as any,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating activity:', error);
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

    const hasPermission = await checkPermission(auth.userId, 'activities', 'delete');
    if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.activity.findFirst({
      where: { id, organizationId: auth.organizationId, deletedAt: null },
    });
    if (!existing) return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });

    await prisma.activity.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({ success: true, data: { id } }, { status: 200 });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

