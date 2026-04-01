'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import InvoiceForm from '@/components/inventory/InvoiceForm';

import { useTranslations } from 'next-intl';

export default function NewInvoicePage() {
    const router = useRouter();
    const t = useTranslations('inventory.invoices');

    const handleSubmit = async (data: any) => {
        const res = await fetch('/api/inventory/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
            toast.success(t('createSuccess'));
            router.push(`/inventory/invoices/${result.data.id}`);
        } else {
            toast.error(result.error || t('createError'));
            throw new Error(result.error);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <InvoiceForm onSubmit={handleSubmit} onCancel={() => router.push('/inventory/invoices')} />
        </div>
    );
}
