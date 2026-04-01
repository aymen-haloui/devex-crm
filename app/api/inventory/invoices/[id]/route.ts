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
        const allowed = await checkPermission(userId, 'invoices', 'read');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const invoice = await (prisma.invoice as any).findFirst({
            where: { id, organizationId, deletedAt: null },
            include: {
                owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                account: { select: { id: true, name: true, phone: true } },
                contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
                deal: { select: { id: true, name: true, value: true, stage: true } },
                lineItems: {
                    include: { product: { select: { id: true, name: true, sku: true, unitPrice: true } } },
                    orderBy: { sequence: 'asc' }
                }
            }
        });

        if (!invoice) return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });

        const serialized = JSON.parse(JSON.stringify(invoice, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: serialized });
    } catch (error) {
        console.error('Get Invoice Error:', error);
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
        const allowed = await checkPermission(userId, 'invoices', 'update');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const existing = await (prisma.invoice as any).findFirst({ where: { id, organizationId, deletedAt: null } });
        if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

        const body = await request.json();

        const result = await prisma.$transaction(async (tx) => {
            await (tx as any).invoiceLineItem.deleteMany({ where: { invoiceId: id } });

            await (tx as any).invoice.update({
                where: { id },
                data: {
                    ownerId: body.ownerId ?? existing.ownerId,
                    customerNo: body.customerNo !== undefined ? body.customerNo : existing.customerNo,
                    subject: body.subject ?? existing.subject,
                    status: body.status ?? existing.status,
                    salesOrderId: body.salesOrderId !== undefined ? body.salesOrderId : existing.salesOrderId,
                    purchaseOrder: body.purchaseOrder !== undefined ? body.purchaseOrder : existing.purchaseOrder,
                    exciseDuty: body.exciseDuty !== undefined ? body.exciseDuty : existing.exciseDuty,
                    salesCommission: body.salesCommission !== undefined ? parseFloat(body.salesCommission) : existing.salesCommission,
                    invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : existing.invoiceDate,
                    dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : existing.dueDate,
                    accountId: body.accountId !== undefined ? body.accountId : existing.accountId,
                    contactId: body.contactId !== undefined ? body.contactId : existing.contactId,
                    dealId: body.dealId !== undefined ? body.dealId : existing.dealId,
                    billingAddress: body.billingAddress !== undefined ? body.billingAddress : existing.billingAddress,
                    shippingAddress: body.shippingAddress !== undefined ? body.shippingAddress : existing.shippingAddress,
                    subTotal: body.subTotal !== undefined ? BigInt(body.subTotal) : existing.subTotal,
                    discount: body.discount !== undefined ? BigInt(body.discount) : existing.discount,
                    tax: body.tax !== undefined ? BigInt(body.tax) : existing.tax,
                    adjustment: body.adjustment !== undefined ? BigInt(body.adjustment) : existing.adjustment,
                    grandTotal: body.grandTotal !== undefined ? BigInt(body.grandTotal) : existing.grandTotal,
                    termsAndConditions: body.termsAndConditions !== undefined ? body.termsAndConditions : existing.termsAndConditions,
                    description: body.description !== undefined ? body.description : existing.description,
                },
            });

            if (body.lineItems && body.lineItems.length > 0) {
                await (tx as any).invoiceLineItem.createMany({
                    data: body.lineItems.map((item: any, index: number) => ({
                        invoiceId: id,
                        productId: item.productId,
                        quantity: item.quantity || 1,
                        listPrice: item.listPrice ? BigInt(item.listPrice) : BigInt(0),
                        discount: item.discount ? BigInt(item.discount) : BigInt(0),
                        tax: item.tax || 0,
                        amount: item.amount ? BigInt(item.amount) : BigInt(0),
                        total: item.total ? BigInt(item.total) : BigInt(0),
                        description: item.description,
                        sequence: index,
                    }))
                });
            }

            return await (tx as any).invoice.findUnique({
                where: { id },
                include: {
                    owner: { select: { id: true, firstName: true, lastName: true } },
                    lineItems: {
                        include: { product: { select: { id: true, name: true, sku: true } } },
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
        console.error('Update Invoice Error:', error);
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
        const allowed = await checkPermission(userId, 'invoices', 'delete');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        await (prisma.invoice as any).update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ success: true, message: 'Invoice deleted' });
    } catch (error) {
        console.error('Delete Invoice Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
