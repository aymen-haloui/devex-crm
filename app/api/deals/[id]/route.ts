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

    const hasPermission = await checkPermission(auth.userId, 'deals', 'view');
    if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const deal = await prisma.deal.findFirst({
      where: { id, organizationId: auth.organizationId, deletedAt: null },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        account: { select: { id: true, name: true } },
      },
    });

    if (!deal) return NextResponse.json({ success: false, error: 'Deal not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: deal }, { status: 200 });
  } catch (error) {
    console.error('Error fetching deal:', error);
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

    const hasPermission = await checkPermission(auth.userId, 'deals', 'edit');
    if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.deal.findFirst({
      where: { id, organizationId: auth.organizationId, deletedAt: null },
    });
    if (!existing) return NextResponse.json({ success: false, error: 'Deal not found' }, { status: 404 });

    const body = await request.json();

    const updated = await prisma.deal.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        value: body.value !== undefined ? BigInt(body.value) : existing.value,
        probability: body.probability ?? existing.probability,
        stage: body.stage ?? existing.stage,
        accountId: body.accountId ?? existing.accountId,
        expectedCloseDate: body.expectedCloseDate !== undefined ? (body.expectedCloseDate ? new Date(body.expectedCloseDate) : null) : existing.expectedCloseDate,
        actualCloseDate: body.actualCloseDate !== undefined ? (body.actualCloseDate ? new Date(body.actualCloseDate) : null) : existing.actualCloseDate,
        lostReason: body.lostReason ?? existing.lostReason,
        closedWon: body.closedWon ?? existing.closedWon,
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        account: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating deal:', error);
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

    const hasPermission = await checkPermission(auth.userId, 'deals', 'delete');
    if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.deal.findFirst({
      where: { id, organizationId: auth.organizationId, deletedAt: null },
    });
    if (!existing) return NextResponse.json({ success: false, error: 'Deal not found' }, { status: 404 });

    await prisma.deal.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({ success: true, data: { id } }, { status: 200 });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

