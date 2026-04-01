import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(req: NextRequest) {
    try {
        const authContext = await getRequestAuthContext(req);
        if (!authContext) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId } = authContext;

        const { searchParams } = new URL(req.url);
        const folder = searchParams.get('folder');

        const reports = await prisma.report.findMany({
            where: {
                organizationId,
                ...(folder ? { folder } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, data: reports });
    } catch (error: any) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
