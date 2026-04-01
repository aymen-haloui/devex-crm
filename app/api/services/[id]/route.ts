import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { serviceUpdateSchema } from '@/lib/validation/services';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        const { organizationId } = auth;
        const { id } = await params;

        const service = await prisma.service.findFirst({
            where: { id, organizationId, deletedAt: null },
        });

        if (!service) return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: service });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        const { organizationId } = auth;
        const { id } = await params;

        const body = await request.json();
        const validated = serviceUpdateSchema.parse(body);

        const service = await prisma.service.update({
            where: { id, organizationId },
            data: {
                ...validated,
                price: validated.price ? BigInt(validated.price) : undefined,
            },
        });

        return NextResponse.json({ success: true, data: service });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        const { organizationId } = auth;
        const { id } = await params;

        await prisma.service.update({
            where: { id, organizationId },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
