import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { feedbackCreateSchema } from '@/lib/validation/feedbacks';

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        const { organizationId } = auth;

        const feedbacks = await prisma.feedback.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
            include: {
                contact: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        return NextResponse.json({ success: true, data: feedbacks });
    } catch (error) {
        console.error('Feedbacks GET error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        const { organizationId } = auth;

        const body = await request.json();
        const validated = feedbackCreateSchema.parse(body);

        const feedback = await prisma.feedback.create({
            data: {
                ...validated,
                organizationId,
            },
            include: {
                contact: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        return NextResponse.json({ success: true, data: feedback }, { status: 201 });
    } catch (error: any) {
        console.error('Feedbacks POST error:', error);
        if (error.name === 'ZodError') return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
