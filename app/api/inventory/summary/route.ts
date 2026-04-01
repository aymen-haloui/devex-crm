import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAnyPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { userId, organizationId } = auth;

    const canAccess = await checkAnyPermission(userId, [
      { resource: 'products', action: 'view' },
      { resource: 'quotes', action: 'view' },
      { resource: 'orders', action: 'view' },
      { resource: 'invoices', action: 'view' },
    ]);

    if (!canAccess) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const [
      productsCount,
      quotes,
      orders,
      invoices,
    ] = await Promise.all([
      prisma.product.count({ where: { organizationId, deletedAt: null } }),
      prisma.quote.findMany({ where: { organizationId, deletedAt: null }, select: { grandTotal: true, stage: true } }),
      (prisma.salesOrder as any).findMany({ where: { organizationId, deletedAt: null }, select: { grandTotal: true } }),
      (prisma.invoice as any).findMany({ where: { organizationId, deletedAt: null }, select: { grandTotal: true, status: true } }),
    ]);

    const quotesValue = quotes.reduce((sum: number, q: { grandTotal: bigint }) => sum + Number(q.grandTotal), 0);
    const ordersValue = orders.reduce((sum: number, o: { grandTotal: bigint }) => sum + Number(o.grandTotal), 0);
    const pendingInvoicesValue = invoices
      .filter((i: { status: string }) => i.status !== 'paid')
      .reduce((sum: number, i: { grandTotal: bigint }) => sum + Number(i.grandTotal), 0);

    return NextResponse.json(
      {
        success: true,
        data: {
          productsCount,
          quotesCount: quotes.length,
          ordersCount: orders.length,
          invoicesCount: invoices.length,
          quotesValue,
          ordersValue,
          pendingInvoicesValue,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
