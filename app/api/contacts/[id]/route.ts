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

    const hasPermission = await checkPermission(auth.userId, 'contacts', 'view');
    if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const contact = await prisma.contact.findFirst({
      where: { id, organizationId: auth.organizationId, deletedAt: null },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!contact) return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: contact }, { status: 200 });
  } catch (error) {
    console.error('Error fetching contact:', error);
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

    const hasPermission = await checkPermission(auth.userId, 'contacts', 'edit');
    if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.contact.findFirst({
      where: { id, organizationId: auth.organizationId, deletedAt: null },
    });
    if (!existing) return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });

    const body = await request.json();

    const updated = await prisma.contact.update({
      where: { id },
      data: {
        firstName: body.firstName ?? existing.firstName,
        lastName: body.lastName ?? existing.lastName,
        email: body.email ?? existing.email,
        phone: body.phone ?? existing.phone,
        title: body.title ?? existing.title,
        accountId: body.accountId ?? existing.accountId,
        status: body.status ?? existing.status,
        source: body.source ?? existing.source,
        tags: body.tags ?? existing.tags,
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating contact:', error);
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

    const hasPermission = await checkPermission(auth.userId, 'contacts', 'delete');
    if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.contact.findFirst({
      where: { id, organizationId: auth.organizationId, deletedAt: null },
    });
    if (!existing) return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });

    await prisma.contact.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({ success: true, data: { id } }, { status: 200 });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

