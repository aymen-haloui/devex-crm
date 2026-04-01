import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { checkPermission } from '@/lib/permissions';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'quotes', 'read');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const quote = await prisma.quote.findFirst({
            where: {
                id,
                organizationId,
                deletedAt: null,
            },
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

        if (!quote) return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });

        // Convert BigInts to Strings for JSON response
        const serialized = JSON.parse(JSON.stringify(quote, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: serialized });
    } catch (error) {
        console.error('Get Quote Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'quotes', 'update');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const body = await request.json();

        // Verify quote belongs to org
        const existing = await prisma.quote.findFirst({
            where: { id, organizationId, deletedAt: null }
        });
        if (!existing) return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });

        // Ensure bigInts are parsed correctly
        const subTotal = body.subTotal ? BigInt(body.subTotal) : BigInt(0);
        const discount = body.discount ? BigInt(body.discount) : BigInt(0);
        const tax = body.tax ? BigInt(body.tax) : BigInt(0);
        const adjustment = body.adjustment ? BigInt(body.adjustment) : BigInt(0);
        const grandTotal = body.grandTotal ? BigInt(body.grandTotal) : BigInt(0);

        // Transaction to ensure atomicity of Line Items and Quote
        const result = await prisma.$transaction(async (tx) => {
            // 1. Delete old line items
            await tx.quoteLineItem.deleteMany({
                where: { quoteId: id }
            });

            // 2. Update quote and create new line items
            const quote = await tx.quote.update({
                where: { id },
                data: {
                    ownerId: body.ownerId || existing.ownerId,
                    subject: body.subject || existing.subject,
                    stage: body.stage || existing.stage,
                    carrier: body.carrier !== undefined ? body.carrier : existing.carrier,
                    team: body.team !== undefined ? body.team : existing.team,
                    validUntil: body.validUntil !== undefined ? (body.validUntil ? new Date(body.validUntil) : null) : existing.validUntil,
                    accountId: body.accountId !== undefined ? body.accountId : existing.accountId,
                    contactId: body.contactId !== undefined ? body.contactId : existing.contactId,
                    dealId: body.dealId !== undefined ? body.dealId : existing.dealId,
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
                await tx.quoteLineItem.createMany({
                    data: body.lineItems.map((item: any, index: number) => ({
                        quoteId: id,
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

            return await tx.quote.findUnique({
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
        console.error('Update Quote Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'quotes', 'delete');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const existing = await prisma.quote.findFirst({
            where: { id, organizationId, deletedAt: null }
        });
        if (!existing) return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });

        await prisma.quote.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete Quote Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
