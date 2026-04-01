import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { projectCreateSchema } from '@/lib/validation/projects';

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        const { organizationId } = auth;

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const where: any = { organizationId, deletedAt: null };
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                    account: { select: { id: true, name: true } },
                    contact: { select: { id: true, firstName: true, lastName: true } },
                    deal: { select: { id: true, name: true } },
                },
            }),
            prisma.project.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: projects,
            meta: { page, limit, total, hasMore: page * limit < total },
        });
    } catch (error) {
        console.error('Projects GET error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        const { userId, organizationId } = auth;

        const body = await request.json();
        const validated = projectCreateSchema.parse(body);

        const project = await prisma.project.create({
            data: {
                ...validated,
                organizationId,
                ownerId: validated.ownerId || userId,
                budget: validated.budget ? BigInt(validated.budget) : 0n,
                revenue: validated.revenue ? BigInt(validated.revenue) : 0n,
                startDate: validated.startDate ? new Date(validated.startDate) : null,
                endDate: validated.endDate ? new Date(validated.endDate) : null,
            },
            include: {
                owner: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        });

        return NextResponse.json({ success: true, data: project }, { status: 201 });
    } catch (error: any) {
        console.error('Projects POST error:', error);
        if (error.name === 'ZodError') return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
