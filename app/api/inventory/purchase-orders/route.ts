import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { checkPermission } from '@/lib/permissions';

export async function GET(request: NextRequest) {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'purchaseOrders', 'read');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const where: any = {
            organizationId,
            deletedAt: null,
            ...(status && { status }),
            ...(search && {
                OR: [
                    { subject: { contains: search, mode: 'insensitive' } },
                    { orderNumber: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [orders, total] = await Promise.all([
            (prisma.purchaseOrder as any).findMany({
                where,
                include: {
                    owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                    vendor: { select: { id: true, name: true } },
                    contact: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
            }),
            (prisma.purchaseOrder as any).count({ where }),
        ]);

        const serialized = JSON.parse(JSON.stringify(orders, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({
            success: true,
            data: serialized,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('List PO Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'purchaseOrders', 'create');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { lineItems, ...orderData } = body;

        if (!orderData.subject) {
            return NextResponse.json({ success: false, error: 'Subject is required' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const count = await (tx.purchaseOrder as any).count({ where: { organizationId } });
            const orderNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

            return await (tx.purchaseOrder as any).create({
                data: {
                    ...orderData,
                    organizationId,
                    orderNumber,
                    ownerId: body.ownerId || userId,
                    vendorId: (orderData.vendorId && orderData.vendorId !== 'none') ? orderData.vendorId : null,
                    contactId: (orderData.contactId && orderData.contactId !== 'none') ? orderData.contactId : null,
                    salesOrderId: (orderData.salesOrderId && orderData.salesOrderId !== 'none') ? orderData.salesOrderId : null,
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

        return NextResponse.json({ success: true, data: serialized }, { status: 201 });
    } catch (error) {
        console.error('Create PO Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
