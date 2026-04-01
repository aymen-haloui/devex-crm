import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { checkPermission } from '@/lib/permissions';

export async function GET(request: NextRequest) {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'orders', 'view');
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
            prisma.salesOrder.findMany({
                where,
                include: {
                    owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                    account: { select: { id: true, name: true } },
                    contact: { select: { id: true, firstName: true, lastName: true, email: true } },
                    deal: { select: { id: true, name: true, value: true, stage: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.salesOrder.count({ where }),
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
        console.error('List Sales Orders Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'sales_orders', 'create');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const body = await request.json();

        if (!body.subject) {
            return NextResponse.json({ success: false, error: 'Subject is required' }, { status: 400 });
        }

        const count = await prisma.salesOrder.count({ where: { organizationId } });
        const orderNumber = `SO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

        const subTotal = body.subTotal ? BigInt(body.subTotal) : BigInt(0);
        const discount = body.discount ? BigInt(body.discount) : BigInt(0);
        const tax = body.tax ? BigInt(body.tax) : BigInt(0);
        const adjustment = body.adjustment ? BigInt(body.adjustment) : BigInt(0);
        const grandTotal = body.grandTotal ? BigInt(body.grandTotal) : BigInt(0);

        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.salesOrder.create({
                data: {
                    organizationId,
                    orderNumber,
                    ownerId: body.ownerId || userId,
                    subject: body.subject,
                    status: body.status || 'created',
                    carrier: body.carrier,
                    exciseDuty: body.exciseDuty,
                    pendingBilling: body.pendingBilling,
                    trackingNumber: body.trackingNumber,
                    purchaseOrder: body.purchaseOrder,
                    customerNo: body.customerNo,
                    salesCommission: body.salesCommission || 0,
                    validUntil: body.validUntil ? new Date(body.validUntil) : null,
                    dueDate: body.dueDate ? new Date(body.dueDate) : null,
                    accountId: (body.accountId && body.accountId !== 'none') ? body.accountId : null,
                    contactId: (body.contactId && body.contactId !== 'none') ? body.contactId : null,
                    dealId: (body.dealId && body.dealId !== 'none') ? body.dealId : null,
                    quoteId: (body.quoteId && body.quoteId !== 'none') ? body.quoteId : null,
                    billingAddress: body.billingAddress || null,
                    shippingAddress: body.shippingAddress || null,
                    subTotal,
                    discount,
                    tax,
                    adjustment,
                    grandTotal,
                    termsAndConditions: body.termsAndConditions,
                    description: body.description,
                },
            });

            if (body.lineItems && body.lineItems.length > 0) {
                await tx.salesOrderLineItem.createMany({
                    data: body.lineItems.map((item: any, index: number) => ({
                        salesOrderId: order.id,
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
                where: { id: order.id },
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

        return NextResponse.json({ success: true, data: serialized }, { status: 201 });
    } catch (error) {
        console.error('Create Sales Order Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
