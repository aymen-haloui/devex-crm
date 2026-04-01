'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import QuoteForm from '@/components/inventory/QuoteForm';

import { useTranslations } from 'next-intl';

export default function NewQuotePage() {
    const router = useRouter();
    const t = useTranslations('inventory.quotes');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: any) => {
        try {
            setLoading(true);
            const res = await fetch('/api/inventory/quotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const responseData = await res.json();

            if (responseData.success) {
                toast.success(t('createSuccess'));
                router.push(`/inventory/quotes/${responseData.data.id}`);
            } else {
                toast.error(responseData.error || t('createError'));
            }
        } catch (error) {
            console.error("Quote creation error:", error);
            toast.error(t('createError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <QuoteForm
                onSubmit={handleSubmit}
                onCancel={() => router.push('/inventory/quotes')}
                loading={loading}
            />
        </div>
    );
}
