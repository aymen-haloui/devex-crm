import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const params = await context.params;
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'campaigns', 'view');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const campaign = await prisma.campaign.findFirst({
            where: {
                id: id,
                organizationId,
                deletedAt: null,
            },
            include: {
                template: true,
                segment: true,
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
            },
        });

        if (!campaign) {
            return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: campaign });
    } catch (error) {
        console.error('Error fetching campaign:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const params = await context.params;
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'campaigns', 'edit');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const body = await request.json();

        // Filtering and formatting fields
        const updateData: any = {};
        const allowedFields = [
            'name', 'status', 'budget', 'spent', 'revenue',
            'startDate', 'endDate', 'scheduledAt', 'timezone',
            'emailsPerMinute', 'templateId', 'segmentId'
        ];

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                if (['startDate', 'endDate', 'scheduledAt'].includes(field)) {
                    updateData[field] = body[field] ? new Date(body[field]) : null;
                } else if (['budget', 'spent', 'revenue'].includes(field)) {
                    updateData[field] = body[field] ? BigInt(body[field]) : BigInt(0);
                } else {
                    updateData[field] = body[field];
                }
            }
        });

        const updated = await prisma.campaign.update({
            where: {
                id: params.id,
                organizationId,
            },
            data: updateData,
            include: {
                template: true,
                segment: true,
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating campaign:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const params = await context.params;
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const allowed = await checkPermission(userId, 'campaigns', 'delete');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        await prisma.campaign.update({
            where: {
                id: params.id,
                organizationId,
            },
            data: {
                deletedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
