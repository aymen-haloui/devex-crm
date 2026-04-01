import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { serviceCreateSchema } from '@/lib/validation/services';

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        const { organizationId } = auth;

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const where: any = { organizationId, deletedAt: null };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const services = await prisma.service.findMany({
            where,
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ success: true, data: services });
    } catch (error) {
        console.error('Services GET error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        const { organizationId } = auth;

        const body = await request.json();
        const validated = serviceCreateSchema.parse(body);

        const service = await prisma.service.create({
            data: {
                ...validated,
                organizationId,
                price: validated.price ? BigInt(validated.price) : 0n,
            },
        });

        return NextResponse.json({ success: true, data: service }, { status: 201 });
    } catch (error: any) {
        console.error('Services POST error:', error);
        if (error.name === 'ZodError') return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
