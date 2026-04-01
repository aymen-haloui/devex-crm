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
        const allowed = await checkPermission(userId, 'vendors', 'read');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const vendor = await (prisma.vendor as any).findFirst({
            where: { id, organizationId, deletedAt: null },
            include: {
                owner: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        });

        if (!vendor) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: vendor });
    } catch (error) {
        console.error('Get Vendor Error:', error);
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
        const allowed = await checkPermission(userId, 'vendors', 'update');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const existing = await (prisma.vendor as any).findFirst({ where: { id, organizationId, deletedAt: null } });
        if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

        const body = await request.json();

        const updated = await (prisma.vendor as any).update({
            where: { id },
            data: {
                ownerId: body.ownerId ?? existing.ownerId,
                name: body.name ?? existing.name,
                email: body.email ?? existing.email,
                phone: body.phone ?? existing.phone,
                website: body.website ?? existing.website,
                category: body.category ?? existing.category,
                status: body.status ?? existing.status,
                description: body.description ?? existing.description,
                glAccount: body.glAccount !== undefined ? body.glAccount : existing.glAccount,
                emailOptOut: body.emailOptOut !== undefined ? (body.emailOptOut === true || body.emailOptOut === 'true') : existing.emailOptOut,
                billingAddress: body.billingAddress !== undefined ? body.billingAddress : existing.billingAddress,
                shippingAddress: body.shippingAddress !== undefined ? body.shippingAddress : existing.shippingAddress,
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update Vendor Error:', error);
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
        const allowed = await checkPermission(userId, 'vendors', 'delete');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        await (prisma.vendor as any).update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ success: true, message: 'Vendor deleted' });
    } catch (error) {
        console.error('Delete Vendor Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
