import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const notifications = await prisma.notification.findMany({
            where: {
                userId: auth.userId,
                organizationId: auth.organizationId,
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return NextResponse.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { id, all, read } = body;

        if (all) {
            await prisma.notification.updateMany({
                where: {
                    userId: auth.userId,
                    organizationId: auth.organizationId,
                },
                data: { read: Boolean(read) },
            });
            return NextResponse.json({ success: true });
        }

        const notificationId = id || new URL(request.url).searchParams.get('id');
        if (!notificationId) {
            return NextResponse.json({ success: false, error: 'Missing notification ID' }, { status: 400 });
        }

        await prisma.notification.update({
            where: {
                id: notificationId,
                userId: auth.userId,
                organizationId: auth.organizationId,
            },
            data: { read: Boolean(read) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        let body = {};
        try {
            body = await request.json();
        } catch (e) {
            // Body might be empty
        }
        const { id, all } = body as any;

        if (all) {
            await prisma.notification.deleteMany({
                where: {
                    userId: auth.userId,
                    organizationId: auth.organizationId,
                },
            });
            return NextResponse.json({ success: true });
        }

        const notificationId = id || new URL(request.url).searchParams.get('id');
        if (!notificationId) {
            return NextResponse.json({ success: false, error: 'Missing notification ID' }, { status: 400 });
        }

        await prisma.notification.delete({
            where: {
                id: notificationId,
                userId: auth.userId,
                organizationId: auth.organizationId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
