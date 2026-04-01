import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { checkPermission } from '@/lib/permissions';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id } = await context.params;
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'sales_orders', 'read');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const order = await prisma.salesOrder.findFirst({
            where: { id, organizationId, deletedAt: null },
            include: {
                owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                account: { select: { id: true, name: true, phone: true, website: true } },
                contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
                deal: { select: { id: true, name: true, value: true, stage: true } },
                lineItems: {
                    include: {
                        product: { select: { id: true, name: true, sku: true, unitPrice: true } }
                    },
                    orderBy: { sequence: 'asc' }
                }
            }
        });

        if (!order) return NextResponse.json({ success: false, error: 'Sales Order not found' }, { status: 404 });

        const serialized = JSON.parse(JSON.stringify(order, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: serialized });
    } catch (error) {
        console.error('Get Sales Order Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id } = await context.params;
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'sales_orders', 'update');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const existing = await prisma.salesOrder.findFirst({ where: { id, organizationId, deletedAt: null } });
        if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

        const body = await request.json();

        const subTotal = body.subTotal !== undefined ? BigInt(body.subTotal) : existing.subTotal;
        const discount = body.discount !== undefined ? BigInt(body.discount) : existing.discount;
        const tax = body.tax !== undefined ? BigInt(body.tax) : existing.tax;
        const adjustment = body.adjustment !== undefined ? BigInt(body.adjustment) : existing.adjustment;
        const grandTotal = body.grandTotal !== undefined ? BigInt(body.grandTotal) : existing.grandTotal;

        const result = await prisma.$transaction(async (tx) => {
            await tx.salesOrderLineItem.deleteMany({ where: { salesOrderId: id } });

            await tx.salesOrder.update({
                where: { id },
                data: {
                    ownerId: body.ownerId !== undefined ? body.ownerId : existing.ownerId,
                    subject: body.subject !== undefined ? body.subject : existing.subject,
                    status: body.status !== undefined ? body.status : existing.status,
                    carrier: body.carrier !== undefined ? body.carrier : existing.carrier,
                    exciseDuty: body.exciseDuty !== undefined ? body.exciseDuty : existing.exciseDuty,
                    pendingBilling: body.pendingBilling !== undefined ? body.pendingBilling : existing.pendingBilling,
                    trackingNumber: body.trackingNumber !== undefined ? body.trackingNumber : existing.trackingNumber,
                    purchaseOrder: body.purchaseOrder !== undefined ? body.purchaseOrder : existing.purchaseOrder,
                    customerNo: body.customerNo !== undefined ? body.customerNo : existing.customerNo,
                    salesCommission: body.salesCommission !== undefined ? body.salesCommission : existing.salesCommission,
                    validUntil: body.validUntil !== undefined ? (body.validUntil ? new Date(body.validUntil) : null) : existing.validUntil,
                    dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : existing.dueDate,
                    accountId: body.accountId !== undefined ? body.accountId : existing.accountId,
                    contactId: body.contactId !== undefined ? body.contactId : existing.contactId,
                    dealId: body.dealId !== undefined ? body.dealId : existing.dealId,
                    quoteId: body.quoteId !== undefined ? body.quoteId : existing.quoteId,
                    billingAddress: body.billingAddress !== undefined ? body.billingAddress : existing.billingAddress,
                    shippingAddress: body.shippingAddress !== undefined ? body.shippingAddress : existing.shippingAddress,
                    subTotal,
                    discount,
                    tax,
                    adjustment,
                    grandTotal,
                    termsAndConditions: body.termsAndConditions !== undefined ? body.termsAndConditions : existing.termsAndConditions,
                    description: body.description !== undefined ? body.description : existing.description,
                },
            });

            if (body.lineItems && body.lineItems.length > 0) {
                await tx.salesOrderLineItem.createMany({
                    data: body.lineItems.map((item: any, index: number) => ({
                        salesOrderId: id,
                        productId: item.productId,
                        quantity: item.quantity || 1,
                        listPrice: item.listPrice ? BigInt(item.listPrice) : BigInt(0),
                        discount: item.discount ? BigInt(item.discount) : BigInt(0),
                        tax: item.tax ? BigInt(item.tax) : BigInt(0),
                        amount: item.amount ? BigInt(item.amount) : BigInt(0),
                        total: item.total ? BigInt(item.total) : BigInt(0),
                        description: item.description,
                        sequence: index,
                    }))
                });
            }

            return await tx.salesOrder.findUnique({
                where: { id },
                include: {
                    owner: { select: { id: true, firstName: true, lastName: true } },
                    lineItems: {
                        include: {
                            product: { select: { id: true, name: true, sku: true, unitPrice: true } }
                        },
                        orderBy: { sequence: 'asc' }
                    }
                }
            });
        });

        const serialized = JSON.parse(JSON.stringify(result, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: serialized });
    } catch (error) {
        console.error('Update Sales Order Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id } = await context.params;
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'sales_orders', 'delete');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        await prisma.salesOrder.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ success: true, message: 'Sales order deleted' });
    } catch (error) {
        console.error('Delete Sales Order Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
