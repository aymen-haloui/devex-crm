import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

// GET /api/my-requests - List requests created by current user
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId, userId } = auth;

        const requests = await (prisma.request as any).findMany({
            where: {
                organizationId,
                userId
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error fetching my requests:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/my-requests - Create a new request
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId, userId } = auth;
        const body = await request.json();
        const { title, type, priority, description } = body;

        if (!title || !type) {
            return NextResponse.json({ success: false, error: 'Title and Type are required' }, { status: 400 });
        }

        const newRequest = await (prisma.request as any).create({
            data: {
                organizationId,
                userId,
                title,
                type,
                priority: priority || 'medium',
                description,
                status: 'pending'
            }
        });

        return NextResponse.json({
            success: true,
            data: newRequest
        });
    } catch (error) {
        console.error('Error creating request:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
