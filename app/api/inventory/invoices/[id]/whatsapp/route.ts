import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { checkPermission } from '@/lib/permissions';
import { sendInvoiceWhatsApp } from '@/lib/messaging/whatsapp';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const allowed = await checkPermission(auth.userId, 'invoices', 'view');
        if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const invoice = await prisma.invoice.findUnique({
            where: { id: params.id, organizationId: auth.organizationId },
            include: {
                contact: true,
                account: true,
                organization: true,
            },
        });

        if (!invoice) {
            return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
        }

        const recipientPhone = invoice.contact?.phone || invoice.account?.phone;
        if (!recipientPhone) {
            return NextResponse.json({ success: false, error: 'No phone number found for this contact/account' }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crm.devex.dz';
        const invoiceLink = `${appUrl}/public/invoices/${invoice.id}`; // Assuming a public view exists

        await sendInvoiceWhatsApp({
            organizationId: auth.organizationId,
            to: recipientPhone,
            customerName: invoice.contact ? `${invoice.contact.firstName} ${invoice.contact.lastName}` : (invoice.account?.name || 'Customer'),
            invoiceNumber: invoice.invoiceNumber,
            amount: `${Number(invoice.grandTotal).toLocaleString()} ${invoice.organization.currency || 'DZD'}`,
            link: invoiceLink,
        });

        // Log activity
        await prisma.activity.create({
            data: {
                organizationId: auth.organizationId,
                type: 'whatsapp',
                title: `Invoice ${invoice.invoiceNumber} sent via WhatsApp`,
                description: `Sent to ${recipientPhone}`,
                ownerId: auth.userId,
                status: 'completed',
                relatedToId: invoice.id,
                relatedToType: 'invoice',
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('WhatsApp Invoice Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to send WhatsApp message' }, { status: 500 });
    }
}
