import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
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

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const active = searchParams.get('active');

        const where: any = {
            organizationId,
            deletedAt: null,
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ],
        };

        if (active === 'true') where.active = true;
        if (active === 'false') where.active = false;

        const [priceBooks, total] = await Promise.all([
            prisma.priceBook.findMany({
                where,
                include: {
                    owner: {
                        select: { id: true, firstName: true, lastName: true, email: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.priceBook.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: priceBooks,
            meta: {
                page,
                limit,
                total,
                hasMore: page * limit < total,
            },
        });
    } catch (error) {
        console.error('[PRICE_BOOKS_GET]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const { userId, organizationId } = auth;

        const hasPermission = await checkPermission(userId, 'price_books', 'create');
        if (!hasPermission) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, active, pricingModel, description, discountRules } = body;

        if (!name) {
            return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
        }

        // Use transaction to create price book and rules
        const priceBook = await prisma.priceBook.create({
            data: {
                organizationId,
                ownerId: body.ownerId || userId,
                name,
                active: active ?? true,
                pricingModel: pricingModel ?? 'flat',
                description,
                discountRules: {
                    create: (discountRules || []).map((rule: any) => ({
                        fromRange: parseFloat(rule.fromRange),
                        toRange: parseFloat(rule.toRange),
                        discount: parseFloat(rule.discount),
                    })),
                },
            } as any, // Cast to any to bypass stale types if prisma generate failed
            include: {
                discountRules: true,
                owner: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });

        return NextResponse.json({ success: true, data: priceBook }, { status: 201 });
    } catch (error) {
        console.error('[PRICE_BOOKS_POST]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
