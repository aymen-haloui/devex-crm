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

        const { organizationId } = auth;

        const order = await (prisma.purchaseOrder as any).findFirst({
            where: { id, organizationId, deletedAt: null },
            include: {
                owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                vendor: true,
                contact: true,
                lineItems: { include: { product: true }, orderBy: { sequence: 'asc' } },
            },
        });

        if (!order) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

        const serialized = JSON.parse(JSON.stringify(order, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: serialized });
    } catch (error) {
        console.error('Get PO Error:', error);
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

        const { organizationId } = auth;
        const body = await request.json();
        const { lineItems, ...orderData } = body;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Delete existing line items
            await (tx as any).purchaseOrderLineItem.deleteMany({ where: { purchaseOrderId: id } });

            // 2. Update PO header and recreate line items
            return await (tx.purchaseOrder as any).update({
                where: { id, organizationId },
                data: {
                    ...orderData,
                    poDate: orderData.poDate ? new Date(orderData.poDate) : null,
                    dueDate: orderData.dueDate ? new Date(orderData.dueDate) : null,
                    subTotal: BigInt(orderData.subTotal || 0),
                    discount: BigInt(orderData.discount || 0),
                    tax: BigInt(orderData.tax || 0),
                    adjustment: BigInt(orderData.adjustment || 0),
                    grandTotal: BigInt(orderData.grandTotal || 0),
                    lineItems: {
                        create: (lineItems || []).map((item: any, idx: number) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            listPrice: BigInt(item.listPrice || 0),
                            discount: BigInt(item.discount || 0),
                            tax: BigInt(item.tax || 0),
                            amount: BigInt(item.amount || 0),
                            total: BigInt(item.total || 0),
                            description: item.description,
                            sequence: idx,
                        })),
                    },
                },
                include: { lineItems: true },
            });
        });

        const serialized = JSON.parse(JSON.stringify(result, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: serialized });
    } catch (error) {
        console.error('Update PO Error:', error);
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

        await (prisma.purchaseOrder as any).update({
            where: { id, organizationId: auth.organizationId },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (error) {
        console.error('Delete PO Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
