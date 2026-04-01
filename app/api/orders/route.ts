import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';
import { serialize } from '@/lib/api-helpers';


export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { userId, organizationId } = auth;
    const hasPermission = await checkPermission(userId, 'orders', 'view');
    if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const records = await (prisma.salesOrder as any).findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: serialize(records) }, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { userId, organizationId } = auth;
    const hasPermission = await checkPermission(userId, 'orders', 'create');
    if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { subject, grandTotal, status } = body;

    if (!subject) {
      return NextResponse.json({ success: false, error: 'Subject is required' }, { status: 400 });
    }

    const count = await (prisma.salesOrder as any).count({ where: { organizationId } });
    const orderNumber = `SO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const created = await (prisma.salesOrder as any).create({
      data: {
        organizationId,
        orderNumber,
        subject,
        grandTotal: grandTotal ? BigInt(grandTotal) : BigInt(0),
        status: status || 'created',
        ownerId: userId,
      },
    });

    return NextResponse.json({ success: true, data: serialize(created) }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
