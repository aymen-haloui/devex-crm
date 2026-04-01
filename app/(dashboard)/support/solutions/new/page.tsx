'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import SolutionForm from '@/components/support/SolutionForm';

export default function NewSolutionPage() {
    const router = useRouter();
    const t = useTranslations('support.solutions');

    const handleSubmit = async (data: any) => {
        const res = await fetch('/api/support/solutions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await res.json();

        if (result.success) {
            toast.success(t('createSuccess') || 'Solution created successfully');
            router.push(`/support/solutions/${result.data.id}`);
        } else {
            toast.error(result.error || t('errors.createFailed') || 'Failed to create solution');
            throw new Error(result.error);
        }
    };

    return (
        <SolutionForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/support/solutions')}
        />
    );
}
