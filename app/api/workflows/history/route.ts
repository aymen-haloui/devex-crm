import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId, userId } = auth;

        // Check permission - using 'workflows' view permission
        const allowed = await checkPermission(userId, 'workflows', 'view');
        if (!allowed) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const workflowId = searchParams.get('workflowId');
        const status = searchParams.get('status');

        const where: any = { organizationId };
        if (workflowId) where.workflowId = workflowId;
        if (status) where.status = status;

        const executions = await prisma.workflowExecution.findMany({
            where,
            include: {
                workflow: {
                    select: { name: true, triggerType: true }
                },
                executedBy: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        return NextResponse.json({
            success: true,
            data: executions,
        });
    } catch (error) {
        console.error('Error fetching workflow history:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
