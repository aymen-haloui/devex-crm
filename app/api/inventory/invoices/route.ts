import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { checkPermission } from '@/lib/permissions';

export async function GET(request: NextRequest) {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'invoices', 'read');
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
                    { invoiceNumber: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [invoices, total] = await Promise.all([
            (prisma.invoice as any).findMany({
                where,
                include: {
                    owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                    account: { select: { id: true, name: true } },
                    contact: { select: { id: true, firstName: true, lastName: true, email: true } },
                    deal: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            (prisma.invoice as any).count({ where }),
        ]);

        const serialized = JSON.parse(JSON.stringify(invoices, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({
            success: true,
            data: serialized,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('List Invoices Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'invoices', 'create');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const body = await request.json();

        if (!body.subject) {
            return NextResponse.json({ success: false, error: 'Subject is required' }, { status: 400 });
        }

        const count = await (prisma.invoice as any).count({ where: { organizationId } });
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

        const result = await prisma.$transaction(async (tx) => {
            const invoice = await (tx as any).invoice.create({
                data: {
                    organizationId,
                    invoiceNumber,
                    customerNo: body.customerNo || null,
                    ownerId: body.ownerId || userId,
                    subject: body.subject,
                    status: body.status || 'draft',
                    salesOrderId: body.salesOrderId || null,
                    purchaseOrder: body.purchaseOrder,
                    exciseDuty: body.exciseDuty || null,
                    salesCommission: body.salesCommission ? parseFloat(body.salesCommission) : 0,
                    invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : new Date(),
                    dueDate: body.dueDate ? new Date(body.dueDate) : null,
                    accountId: (body.accountId && body.accountId !== 'none') ? body.accountId : null,
                    contactId: (body.contactId && body.contactId !== 'none') ? body.contactId : null,
                    dealId: (body.dealId && body.dealId !== 'none') ? body.dealId : null,
                    billingAddress: body.billingAddress || null,
                    shippingAddress: body.shippingAddress || null,
                    subTotal: body.subTotal ? BigInt(body.subTotal) : BigInt(0),
                    discount: body.discount ? BigInt(body.discount) : BigInt(0),
                    tax: body.tax ? BigInt(body.tax) : BigInt(0),
                    adjustment: body.adjustment ? BigInt(body.adjustment) : BigInt(0),
                    grandTotal: body.grandTotal ? BigInt(body.grandTotal) : BigInt(0),
                    termsAndConditions: body.termsAndConditions,
                    description: body.description,
                },
            });

            if (body.lineItems && body.lineItems.length > 0) {
                await (tx as any).invoiceLineItem.createMany({
                    data: body.lineItems.map((item: any, index: number) => ({
                        invoiceId: invoice.id,
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
                where: { id: invoice.id },
                include: {
                    owner: { select: { id: true, firstName: true, lastName: true } },
                    lineItems: {
                        include: { product: { select: { id: true, name: true, sku: true, unitPrice: true } } },
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
        console.error('Create Invoice Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
