'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import ProductAutocomplete from '@/components/ui/ProductAutocomplete';

const solutionSchema = (ts: any) => z.object({
    title: z.string().min(1, ts('errors.titleRequired')),
    status: z.string().default('Draft'),
    productId: z.string().optional().or(z.literal('')),
    question: z.string().optional().or(z.literal('')),
    answer: z.string().optional().or(z.literal('')),
    comments: z.string().optional().or(z.literal('')),
});

type SolutionFormValues = z.infer<ReturnType<typeof solutionSchema>>;

interface SolutionFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

export default function SolutionForm({ initialData, onSubmit, onCancel }: SolutionFormProps) {
    const t = useTranslations('common');
    const ts = useTranslations('support.solutions');

    const form = useForm<SolutionFormValues>({
        resolver: zodResolver(solutionSchema(ts)),
        defaultValues: {
            title: initialData?.title || '',
            status: initialData?.status || 'Draft',
            productId: initialData?.productId || '',
            question: initialData?.question || '',
            answer: initialData?.answer || '',
            comments: initialData?.comments || '',
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: SolutionFormValues) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="bg-white min-h-[calc(100vh-6rem)]">
                {/* Fixed Header */}
                <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/5 border border-primary/10 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <h1 className="text-lg font-medium text-slate-800">
                            {initialData ? `${ts('editSolution')}: ${initialData.solutionNumber}` : ts('createSolution')}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={onCancel} className="h-8 px-4 text-xs font-medium rounded border-slate-300 hover:bg-slate-50 text-slate-700">
                            {t('cancel')}
                        </Button>
                        <Button type="button" variant="outline" className="h-8 px-4 text-xs font-medium rounded border-slate-300 hover:bg-slate-50 text-slate-700">
                            {t('saveAndNew')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="h-8 px-4 text-xs font-medium rounded bg-accent hover:bg-accent/90 text-white shadow-sm">
                            {isSubmitting ? t('saving') : t('save')}
                        </Button>
                    </div>
                </div>

                <div className="p-8 max-w-5xl mx-auto space-y-12 pb-24">
                    {/* Solution Information Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2">{ts('sections.solutionInfo')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{ts('fields.solutionNumber')}</FormLabel>
                                    <div className="col-span-2">
                                        <div className="h-8 px-3 flex items-center bg-slate-50 border border-slate-200 rounded text-sm text-slate-500 cursor-not-allowed">
                                            {initialData?.solutionNumber || ts('placeholders.autoGenerated')}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium whitespace-nowrap"><span className="text-red-500 mr-0.5">*</span> {ts('fields.title')}</FormLabel>
                                    <div className="col-span-2">
                                        <FormField control={form.control} name="title" render={({ field }) => (
                                            <FormControl><Input className="h-8 text-sm rounded border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500" {...field} value={field.value || ''} /></FormControl>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{ts('fields.status')}</FormLabel>
                                    <div className="col-span-2">
                                        <FormField control={form.control} name="status" render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                                <FormControl>
                                                    <SelectTrigger className="h-8 text-sm rounded border-slate-300 focus:border-accent">
                                                        <SelectValue placeholder={t('none')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Draft">{ts('statuses.draft')}</SelectItem>
                                                    <SelectItem value="Reviewed">{ts('statuses.reviewed')}</SelectItem>
                                                    <SelectItem value="Published">{ts('statuses.published')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{ts('fields.owner')}</FormLabel>
                                    <div className="col-span-2">
                                        <div className="h-8 px-3 flex items-center bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 cursor-not-allowed">
                                            {t('activeUser')}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{ts('fields.productName')}</FormLabel>
                                    <div className="col-span-2">
                                        <FormField control={form.control} name="productId" render={({ field }) => (
                                            <FormControl><ProductAutocomplete placeholder={ts('placeholders.searchProducts')} value={field.value || ''} onChange={field.onChange} /></FormControl>
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Information Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2">{ts('sections.descriptionInfo')}</h3>
                        <div className="space-y-6 max-w-4xl">
                            <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                                <FormLabel className="text-xs text-right text-slate-600 font-medium pt-2">{ts('fields.question')}</FormLabel>
                                <FormField control={form.control} name="question" render={({ field }) => (
                                    <FormControl><Textarea className="min-h-[80px] text-sm rounded border-slate-300 focus:border-accent" {...field} value={field.value || ''} /></FormControl>
                                )} />
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                                <FormLabel className="text-xs text-right text-slate-600 font-medium pt-2">{ts('fields.answer')}</FormLabel>
                                <FormField control={form.control} name="answer" render={({ field }) => (
                                    <FormControl><Textarea className="min-h-[120px] text-sm rounded border-slate-300 focus:border-accent" {...field} value={field.value || ''} /></FormControl>
                                )} />
                            </div>
                        </div>
                    </div>

                </div>
            </form>
        </Form>
    );
}
