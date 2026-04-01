import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET for Meta webhook verification
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token) {
        // We need to verify which organization this webhook belongs to.
        // In a multi-tenant setup, we might need a better way to check the verify_token
        // For now, we'll check if any organization matches this token
        const org = await prisma.organization.findFirst({
            where: { whatsappWebhookVerifyToken: token },
        });

        if (org) {
            return new NextResponse(challenge, { status: 200 });
        }
    }

    return new NextResponse('Forbidden', { status: 403 });
}

// POST for handling incoming messages/events
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Log the incoming webhook for debugging
        console.log('WhatsApp Webhook Received:', JSON.stringify(body, null, 2));

        // Real-world implementation would parse the message and update leads/contacts
        // For now, we just acknowledge receipt
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
