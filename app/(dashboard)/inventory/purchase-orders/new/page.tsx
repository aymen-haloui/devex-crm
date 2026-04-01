'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import PurchaseOrderForm from '@/components/inventory/PurchaseOrderForm';

import { useTranslations } from 'next-intl';

export default function NewPurchaseOrderPage() {
    const router = useRouter();
    const t = useTranslations('inventory.purchaseOrders');

    const handleSubmit = async (data: any) => {
        const res = await fetch('/api/inventory/purchase-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
            toast.success(t('createSuccess'));
            router.push(`/inventory/purchase-orders/${result.data.id}`);
        } else {
            toast.error(result.error || t('createError'));
            throw new Error(result.error);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <PurchaseOrderForm onSubmit={handleSubmit} onCancel={() => router.push('/inventory/purchase-orders')} />
        </div>
    );
}
