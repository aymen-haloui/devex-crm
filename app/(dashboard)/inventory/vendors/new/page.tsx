'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import VendorForm from '@/components/inventory/VendorForm';

import { useTranslations } from 'next-intl';

export default function NewVendorPage() {
    const router = useRouter();
    const t = useTranslations('inventory.vendors');

    const handleSubmit = async (data: any) => {
        const res = await fetch('/api/inventory/vendors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
            toast.success(t('createSuccess'));
            router.push(`/inventory/vendors/${result.data.id}`);
        } else {
            toast.error(result.error || t('createError'));
            throw new Error(result.error);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <VendorForm onSubmit={handleSubmit} onCancel={() => router.push('/inventory/vendors')} />
        </div>
    );
}
