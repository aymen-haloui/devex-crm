import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { checkPermission } from '@/lib/permissions';

export async function GET(request: NextRequest) {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const config = await prisma.organization.findUnique({
            where: { id: auth.organizationId },
            select: {
                whatsappPhoneId: true,
                whatsappToken: true,
                whatsappProvider: true,
                whatsappWebhookVerifyToken: true,
            },
        });

        return NextResponse.json({ success: true, data: config });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const allowed = await checkPermission(auth.userId, 'settings', 'edit');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { whatsappPhoneId, whatsappToken, whatsappProvider, whatsappWebhookVerifyToken } = body;

        const updated = await prisma.organization.update({
            where: { id: auth.organizationId },
            data: {
                whatsappPhoneId,
                whatsappToken,
                whatsappProvider: whatsappProvider || 'meta',
                whatsappWebhookVerifyToken,
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
