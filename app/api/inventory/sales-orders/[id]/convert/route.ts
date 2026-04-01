import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { checkPermission } from '@/lib/permissions';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id } = await context.params;
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'invoices', 'create');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const order = await prisma.salesOrder.findFirst({
            where: { id, organizationId, deletedAt: null },
            include: { lineItems: true }
        });

        if (!order) return NextResponse.json({ success: false, error: 'Sales Order not found' }, { status: 404 });

        const count = await prisma.invoice.count({ where: { organizationId } });
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

        const result = await prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.create({
                data: {
                    organizationId,
                    ownerId: userId,
                    invoiceNumber,
                    subject: order.subject,
                    status: 'draft',
                    salesOrderId: order.id,
                    purchaseOrder: order.purchaseOrder,
                    invoiceDate: new Date(),
                    dueDate: order.dueDate || null,
                    accountId: order.accountId,
                    contactId: order.contactId,
                    dealId: order.dealId,
                    billingAddress: order.billingAddress as any,
                    shippingAddress: order.shippingAddress as any,
                    subTotal: order.subTotal,
                    discount: order.discount,
                    tax: order.tax,
                    adjustment: order.adjustment,
                    grandTotal: order.grandTotal,
                    termsAndConditions: order.termsAndConditions,
                    description: order.description,
                }
            });

            if (order.lineItems.length > 0) {
                await tx.invoiceLineItem.createMany({
                    data: order.lineItems.map((item) => ({
                        invoiceId: invoice.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        listPrice: item.listPrice,
                        discount: item.discount,
                        tax: item.tax,
                        amount: item.amount,
                        total: item.total,
                        description: item.description,
                        sequence: item.sequence,
                    }))
                });
            }

            return invoice;
        });

        return NextResponse.json({ success: true, data: result }, { status: 201 });
    } catch (error) {
        console.error('Convert Sales Order Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
