'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductForm from '@/components/inventory/ProductForm';
import { toast } from 'sonner';

import { useTranslations } from 'next-intl';

export default function NewProductPage() {
    const router = useRouter();
    const t = useTranslations('inventory.products');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: any) => {
        setLoading(true);
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (result.success) {
                toast.success(t('createSuccess'));
                router.push('/inventory/products');
            } else {
                toast.error(result.error || t('createError'));
            }
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error(t('createError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="mb-8 flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 hover:bg-slate-100 rounded-xl px-4 py-2 transition-all"
                >
                    <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:-translate-x-1 transition-all" />
                    <span className="text-sm font-bold text-slate-600">{t('backToProducts')}</span>
                </Button>

                <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{t('premiumInventoryNode')}</span>
                </div>
            </div>

            <ProductForm
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                loading={loading}
            />
        </div>
    );
}
