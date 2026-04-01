import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const { id } = await params;
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const { userId, organizationId } = auth;

        const hasPermission = await checkPermission(userId, 'price_books', 'view');
        if (!hasPermission) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const priceBook = await prisma.priceBook.findFirst({
            where: {
                id,
                organizationId,
                deletedAt: null,
            },
            include: {
                owner: {
                    select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
                },
                discountRules: {
                    orderBy: { fromRange: 'asc' },
                },
                products: {
                    include: {
                        product: {
                            select: { id: true, name: true, sku: true, unitPrice: true },
                        },
                    },
                },
            },
        });

        if (!priceBook) {
            return NextResponse.json({ success: false, error: 'Price Book not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                ...priceBook,
                products: priceBook.products.map(p => ({
                    ...p,
                    listPrice: Number(p.listPrice)
                }))
            }
        });
    } catch (error) {
        console.error('[PRICE_BOOK_GET]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const { id } = await params;
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const { userId, organizationId } = auth;

        const hasPermission = await checkPermission(userId, 'price_books', 'edit');
        if (!hasPermission) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, active, pricingModel, description, discountRules } = body;

        // Use transaction to update price book and sync rules
        const updatedPriceBook = await prisma.$transaction(async (tx) => {
            // 1. Update basic info
            const pb = await tx.priceBook.update({
                where: { id, organizationId },
                data: {
                    name,
                    active,
                    pricingModel,
                    description,
                },
            });

            // 2. Sync discount rules (delete old ones and create new ones or update)
            // For simplicity in a CRM clone, we'll replace them if provided
            if (discountRules) {
                await tx.priceBookDiscountRule.deleteMany({
                    where: { priceBookId: id },
                });

                await tx.priceBookDiscountRule.createMany({
                    data: discountRules.map((rule: any) => ({
                        priceBookId: id,
                        fromRange: parseFloat(rule.fromRange),
                        toRange: parseFloat(rule.toRange),
                        discount: parseFloat(rule.discount),
                    })),
                });
            }

            return tx.priceBook.findFirst({
                where: { id },
                include: {
                    discountRules: { orderBy: { fromRange: 'asc' } },
                    owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
            });
        });

        return NextResponse.json({ success: true, data: updatedPriceBook });
    } catch (error) {
        console.error('[PRICE_BOOK_PUT]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const { id } = await params;
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const { userId, organizationId } = auth;

        const hasPermission = await checkPermission(userId, 'price_books', 'delete');
        if (!hasPermission) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        await prisma.priceBook.update({
            where: { id, organizationId },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ success: true, message: 'Price Book deleted successfully' });
    } catch (error) {
        console.error('[PRICE_BOOK_DELETE]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
