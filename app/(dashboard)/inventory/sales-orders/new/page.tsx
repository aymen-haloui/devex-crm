'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import SalesOrderForm from '@/components/inventory/SalesOrderForm';

export default function NewSalesOrderPage() {
    const router = useRouter();
    const ts = useTranslations('inventory.salesOrders');

    const handleSubmit = async (data: any) => {
        const res = await fetch('/api/inventory/sales-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
            toast.success(ts('successMessage'));
            router.push(`/inventory/sales-orders/${result.data.id}`);
        } else {
            toast.error(result.error || ts('errorMessage'));
            throw new Error(result.error);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <SalesOrderForm
                onSubmit={handleSubmit}
                onCancel={() => router.push('/inventory/sales-orders')}
            />
        </div>
    );
}
