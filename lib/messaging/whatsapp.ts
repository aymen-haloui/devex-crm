import { prisma } from '../prisma';

export interface WhatsAppMessageOptions {
    organizationId: string;
    to: string;
    type: 'text' | 'template';
    content?: string;
    templateName?: string;
    languageCode?: string;
    components?: any[];
}

export async function sendWhatsAppMessage(options: WhatsAppMessageOptions) {
    const { organizationId, to, type, content, templateName, languageCode, components } = options;

    // 1. Fetch organization WhatsApp config
    const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
            whatsappPhoneId: true,
            whatsappToken: true,
            whatsappProvider: true,
        },
    });

    if (!org || !org.whatsappPhoneId || !org.whatsappToken) {
        throw new Error('WhatsApp is not configured for this organization');
    }

    // 2. Prepare payload for Meta API
    const url = `https://graph.facebook.com/v18.0/${org.whatsappPhoneId}/messages`;

    const payload: any = {
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''), // Clean phone number
        type: type === 'template' ? 'template' : 'text',
    };

    if (type === 'template') {
        payload.template = {
            name: templateName,
            language: { code: languageCode || 'en' },
            components: components || [],
        };
    } else {
        payload.text = { body: content };
    }

    // 3. Send request
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${org.whatsappToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('WhatsApp API Error:', data);
            throw new Error(data.error?.message || 'Failed to send WhatsApp message');
        }

        return data;
    } catch (error) {
        console.error('WhatsApp Sender Error:', error);
        throw error;
    }
}

/**
 * Sends an invoice notification via WhatsApp template
 */
export async function sendInvoiceWhatsApp(args: {
    organizationId: string;
    to: string;
    customerName: string;
    invoiceNumber: string;
    amount: string;
    link: string;
}) {
    return sendWhatsAppMessage({
        organizationId: args.organizationId,
        to: args.to,
        type: 'template',
        templateName: 'invoice_notification', // Standardized name
        languageCode: 'en', // Should ideally follow user/org preference
        components: [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: args.customerName },
                    { type: 'text', text: args.invoiceNumber },
                    { type: 'text', text: args.amount },
                    { type: 'text', text: args.link },
                ],
            },
        ],
    });
}
