'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Briefcase } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import ProductAutocomplete from '@/components/ui/ProductAutocomplete';
import EntityAutocomplete from '@/components/ui/EntityAutocomplete';

const caseSchema = (ts: any) => z.object({
    productId: z.string().optional().or(z.literal('')),
    type: z.string().optional().or(z.literal('')),
    caseOrigin: z.string().optional().or(z.literal('')),
    relatedTo: z.string().optional().or(z.literal('')),
    accountId: z.string().optional().or(z.literal('')),
    dealId: z.string().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    status: z.string().min(1, ts('errors.statusRequired')).default('New'),
    priority: z.string().optional().or(z.literal('')),
    caseReason: z.string().optional().or(z.literal('')),
    subject: z.string().min(1, ts('errors.subjectRequired')),
    reportedBy: z.string().optional().or(z.literal('')),
    email: z.string().email().optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    internalComments: z.string().optional().or(z.literal('')),
    solution: z.string().optional().or(z.literal('')),
});

type CaseFormValues = z.infer<ReturnType<typeof caseSchema>>;

interface CaseFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

export default function CaseForm({ initialData, onSubmit, onCancel }: CaseFormProps) {
    const t = useTranslations('common');
    const ts = useTranslations('support.cases');

    const form = useForm<CaseFormValues>({
        resolver: zodResolver(caseSchema(ts)),
        defaultValues: {
            productId: initialData?.productId || '',
            type: initialData?.type || '',
            caseOrigin: initialData?.caseOrigin || '',
            relatedTo: initialData?.relatedTo || '',
            accountId: initialData?.accountId || '',
            dealId: initialData?.dealId || '',
            phone: initialData?.phone || '',
            status: initialData?.status || 'New',
            priority: initialData?.priority || 'None',
            caseReason: initialData?.caseReason || '',
            subject: initialData?.subject || '',
            reportedBy: initialData?.reportedBy || '',
            email: initialData?.email || '',
            description: initialData?.description || '',
            internalComments: initialData?.internalComments || '',
            solution: initialData?.solution || '',
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: CaseFormValues) => {
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
                            <Briefcase className="w-4 h-4 text-primary" />
                        </div>
                        <h1 className="text-lg font-medium text-slate-800">
                            {initialData ? `${ts('editCase')}: ${initialData.caseNumber}` : ts('createCase')}
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
                    {/* Case Information Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2">{ts('sections.caseInfo')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{ts('fields.caseNumber')}</FormLabel>
                                    <div className="col-span-2 min-w-0">
                                        <div className="h-8 px-3 flex items-center bg-slate-50 border border-slate-200 rounded text-sm text-slate-500 cursor-not-allowed truncate">
                                            {initialData?.caseNumber || ts('placeholders.autoGenerated')}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{ts('fields.productName')}</FormLabel>
                                    <div className="col-span-2 min-w-0">
                                        <FormField control={form.control} name="productId" render={({ field }) => (
                                            <FormControl><ProductAutocomplete placeholder={ts('placeholders.searchProducts')} value={field.value || ''} onChange={field.onChange} /></FormControl>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{ts('fields.type')}</FormLabel>
                                    <div className="col-span-2 min-w-0">
                                        <FormField control={form.control} name="type" render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                                <FormControl>
                                                    <SelectTrigger className="h-8 text-sm rounded border-slate-300 focus:border-accent">
                                                        <SelectValue placeholder={t('none')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Question">{ts('types.question')}</SelectItem>
                                                    <SelectItem value="Problem">{ts('types.problem')}</SelectItem>
                                                    <SelectItem value="Feature Request">{ts('types.featureRequest')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{ts('fields.caseOrigin')}</FormLabel>
                                    <div className="col-span-2 min-w-0">
                                        <FormField control={form.control} name="caseOrigin" render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                                <FormControl>
                                                    <SelectTrigger className="h-8 text-sm rounded border-slate-300 focus:border-accent">
                                                        <SelectValue placeholder={t('none')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Email">{ts('origins.email')}</SelectItem>
                                                    <SelectItem value="Phone">{ts('origins.phone')}</SelectItem>
                                                    <SelectItem value="Web">{ts('origins.web')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{ts('fields.relatedTo')}</FormLabel>
                                    <div className="col-span-2 min-w-0">
                                        <FormField control={form.control} name="relatedTo" render={({ field }) => (
                                            <FormControl><Input className="h-8 text-sm rounded border-slate-300 focus:border-accent" {...field} value={field.value || ''} /></FormControl>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{ts('fields.accountName')}</FormLabel>
                                    <div className="col-span-2 min-w-0">
                                        <FormField control={form.control} name="accountId" render={({ field }) => (
                                            <FormControl><EntityAutocomplete endpoint="/api/accounts" placeholder={ts('placeholders.searchAccounts')} value={field.value || ''} onChange={field.onChange} /></FormControl>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{ts('fields.dealName')}</FormLabel>
                                    <div className="col-span-2 min-w-0">
                                        <FormField control={form.control} name="dealId" render={({ field }) => (
                                            <FormControl><EntityAutocomplete endpoint="/api/deals" placeholder={ts('placeholders.searchDeals')} value={field.value || ''} onChange={field.onChange} /></FormControl>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{ts('fields.phone')}</FormLabel>
                                    <div className="col-span-2 min-w-0">
                                        <FormField control={form.control} name="phone" render={({ field }) => (
                                            <FormControl><Input type="tel" className="h-8 text-sm rounded border-slate-300 focus:border-accent" {...field} value={field.value || ''} /></FormControl>
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
                                                    <SelectItem value="New">{ts('statuses.new')}</SelectItem>
                                                    <SelectItem value="On Hold">{ts('statuses.on_hold')}</SelectItem>
                                                    <SelectItem value="Escalated">{ts('statuses.escalated')}</SelectItem>
                                                    <SelectItem value="Closed">{ts('statuses.closed')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{ts('fields.priority')}</FormLabel>
                                    <div className="col-span-2">
                                        <FormField control={form.control} name="priority" render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                                <FormControl>
                                                    <SelectTrigger className="h-8 text-sm rounded border-slate-300 focus:border-accent">
                                                        <SelectValue placeholder={t('none')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="None">{ts('priorities.none')}</SelectItem>
                                                    <SelectItem value="High">{ts('priorities.high')}</SelectItem>
                                                    <SelectItem value="Medium">{ts('priorities.medium')}</SelectItem>
                                                    <SelectItem value="Low">{ts('priorities.low')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{ts('fields.caseReason')}</FormLabel>
                                    <div className="col-span-2">
                                        <FormField control={form.control} name="caseReason" render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                                <FormControl>
                                                    <SelectTrigger className="h-8 text-sm rounded border-slate-300 focus:border-accent">
                                                        <SelectValue placeholder={t('none')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="User error">{ts('reasons.userError')}</SelectItem>
                                                    <SelectItem value="Complex functionality">{ts('reasons.complexFunctionality')}</SelectItem>
                                                    <SelectItem value="Existing problem">{ts('reasons.existingProblem')}</SelectItem>
                                                    <SelectItem value="Instructions not clear">{ts('reasons.instructionsNotClear')}</SelectItem>
                                                    <SelectItem value="New problem">{ts('reasons.newProblem')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium whitespace-nowrap"><span className="text-red-500 mr-0.5">*</span> {ts('fields.subject')}</FormLabel>
                                    <div className="col-span-2">
                                        <FormField control={form.control} name="subject" render={({ field }) => (
                                            <FormControl><Input placeholder={ts('placeholders.subject')} className="h-8 text-sm rounded border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500" {...field} value={field.value || ''} /></FormControl>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{ts('fields.reportedBy')}</FormLabel>
                                    <div className="col-span-2">
                                        <FormField control={form.control} name="reportedBy" render={({ field }) => (
                                            <FormControl><Input className="h-8 text-sm rounded border-slate-300 focus:border-accent" {...field} value={field.value || ''} /></FormControl>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{ts('fields.email')}</FormLabel>
                                    <div className="col-span-2">
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormControl><Input type="email" className="h-8 text-sm rounded border-slate-300 focus:border-accent" {...field} value={field.value || ''} /></FormControl>
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
                                <FormLabel className="text-xs text-right text-slate-600 font-medium pt-2">{ts('fields.description')}</FormLabel>
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormControl><Textarea className="min-h-[80px] text-sm rounded border-slate-300 focus:border-accent" {...field} value={field.value || ''} /></FormControl>
                                )} />
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                                <FormLabel className="text-xs text-right text-slate-600 font-medium pt-2">{ts('fields.internalComments')}</FormLabel>
                                <FormField control={form.control} name="internalComments" render={({ field }) => (
                                    <FormControl><Textarea className="min-h-[80px] text-sm rounded border-slate-300 focus:border-accent" {...field} value={field.value || ''} /></FormControl>
                                )} />
                            </div>
                        </div>
                    </div>

                    {/* Solution Information Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2">{ts('sections.solutionInfo')}</h3>
                        <div className="space-y-6 max-w-4xl">
                            <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                                <FormLabel className="text-xs text-right text-slate-600 font-medium pt-2">{ts('fields.solution')}</FormLabel>
                                <FormField control={form.control} name="solution" render={({ field }) => (
                                    <FormControl><Textarea className="min-h-[80px] text-sm rounded border-slate-300 focus:border-accent" {...field} value={field.value || ''} /></FormControl>
                                )} />
                            </div>
                        </div>
                    </div>

                </div>
            </form>
        </Form>
    );
}
