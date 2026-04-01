'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import PriceBookForm from '@/components/inventory/PriceBookForm';

import { useTranslations } from 'next-intl';

export default function NewPriceBookPage() {
    const router = useRouter();
    const t = useTranslations('inventory.priceBooks');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: any) => {
        setLoading(true);
        try {
            const res = await fetch('/api/inventory/price-books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (result.success) {
                toast.success(t('createSuccess'));
                router.push(`/inventory/price-books/${result.data.id}`);
                router.refresh();
            } else {
                toast.error(result.error || t('createError'));
            }
        } catch (error) {
            console.error('Error creating price book:', error);
            toast.error(t('createError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PriceBookForm
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                loading={loading}
            />
        </div>
    );
}
