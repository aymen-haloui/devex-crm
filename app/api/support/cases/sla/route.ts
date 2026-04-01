import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

const OPEN_STATUSES = ['new', 'open', 'pending'];

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'cases', 'view');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const now = new Date();
        const soon = new Date(Date.now() + 1000 * 60 * 60 * 4);

        const [overdueCases, atRiskCases] = await Promise.all([
            prisma.case.findMany({
                where: {
                    organizationId,
                    deletedAt: null,
                    status: { in: OPEN_STATUSES },
                    dueAt: { lt: now },
                },
                orderBy: { dueAt: 'asc' },
            }),
            prisma.case.findMany({
                where: {
                    organizationId,
                    deletedAt: null,
                    status: { in: OPEN_STATUSES },
                    dueAt: { gte: now, lte: soon },
                },
                orderBy: { dueAt: 'asc' },
            }),
        ]);

        return NextResponse.json(
            {
                success: true,
                data: {
                    overdueCount: overdueCases.length,
                    atRiskCount: atRiskCases.length,
                    overdueCases,
                    atRiskCases,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching case SLA status:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'cases', 'edit');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { escalateOverdue = true } = body || {};

        const overdue = await prisma.case.findMany({
            where: {
                organizationId,
                deletedAt: null,
                status: { in: OPEN_STATUSES },
                dueAt: { lt: new Date() },
            },
        });

        if (escalateOverdue && overdue.length > 0) {
            await Promise.all(
                overdue.map((item) =>
                    prisma.case.update({
                        where: { id: item.id },
                        data: {
                            escalationLevel: (item.escalationLevel || 0) + 1,
                            escalatedAt: new Date(),
                            status: item.status === 'new' ? 'pending' : item.status,
                        },
                    })
                )
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    escalatedCount: overdue.length,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error escalating overdue cases:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
