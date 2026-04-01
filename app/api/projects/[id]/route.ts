import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { projectUpdateSchema } from '@/lib/validation/projects';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        const { organizationId } = auth;
        const { id } = await params;

        const project = await prisma.project.findFirst({
            where: { id, organizationId, deletedAt: null },
            include: {
                owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                account: { select: { id: true, name: true } },
                contact: { select: { id: true, firstName: true, lastName: true } },
                deal: { select: { id: true, name: true } },
            },
        });

        if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: project });
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
        const validated = projectUpdateSchema.parse(body);

        const project = await prisma.project.update({
            where: { id, organizationId },
            data: {
                ...validated,
                budget: validated.budget ? BigInt(validated.budget) : undefined,
                revenue: validated.revenue ? BigInt(validated.revenue) : undefined,
                startDate: validated.startDate ? new Date(validated.startDate) : undefined,
                endDate: validated.endDate ? new Date(validated.endDate) : undefined,
            },
        });

        return NextResponse.json({ success: true, data: project });
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

        await prisma.project.update({
            where: { id, organizationId },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
