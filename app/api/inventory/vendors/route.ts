import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { checkPermission } from '@/lib/permissions';

export async function GET(request: NextRequest) {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'vendors', 'read');
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
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [vendors, total] = await Promise.all([
            (prisma.vendor as any).findMany({
                where,
                include: {
                    owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
            }),
            (prisma.vendor as any).count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: vendors,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('List Vendors Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'vendors', 'create');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const body = await request.json();

        if (!body.name) {
            return NextResponse.json({ success: false, error: 'Vendor name is required' }, { status: 400 });
        }

        const created = await (prisma.vendor as any).create({
            data: {
                organizationId,
                ownerId: body.ownerId || userId,
                name: body.name,
                email: body.email,
                phone: body.phone,
                website: body.website,
                category: body.category,
                status: body.status || 'active',
                description: body.description,
                glAccount: body.glAccount || null,
                emailOptOut: body.emailOptOut === true || body.emailOptOut === 'true',
                billingAddress: body.billingAddress || null,
                shippingAddress: body.shippingAddress || null,
            },
        });

        return NextResponse.json({ success: true, data: created }, { status: 201 });
    } catch (error) {
        console.error('Create Vendor Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
