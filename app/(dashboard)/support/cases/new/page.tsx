'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import CaseForm from '@/components/support/CaseForm';

export default function NewCasePage() {
    const router = useRouter();
    const t = useTranslations('support.cases');

    const handleSubmit = async (data: any) => {
        const res = await fetch('/api/support/cases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await res.json();

        if (result.success) {
            toast.success(t('createSuccess') || 'Case created successfully');
            router.push(`/support/cases/${result.data.id}`);
        } else {
            toast.error(result.error || t('errors.createFailed') || 'Failed to create case');
            throw new Error(result.error);
        }
    };

    return (
        <CaseForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/support/cases')}
        />
    );
}
