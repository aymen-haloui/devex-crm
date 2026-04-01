import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

// GET /api/settings/modules - Fetch enabled modules for the organization
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId, userId } = auth;

        const allowed = await checkPermission(userId, 'settings', 'view');
        if (!allowed) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: { enabledModules: true }
        });

        return NextResponse.json({
            success: true,
            data: organization?.enabledModules || {}
        });
    } catch (error) {
        console.error('Error fetching modules settings:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/settings/modules - Update enabled modules
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId, userId } = auth;

        const allowed = await checkPermission(userId, 'settings', 'edit');
        if (!allowed) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { modules } = body; // Map of { [moduleName]: boolean }

        if (!modules || typeof modules !== 'object') {
            return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
        }

        await (prisma.organization as any).update({
            where: { id: organizationId },
            data: { enabledModules: modules }
        });

        return NextResponse.json({
            success: true,
            message: 'Modules updated successfully'
        });
    } catch (error) {
        console.error('Error updating modules settings:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
