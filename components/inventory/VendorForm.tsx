'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, X, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Vendor } from '@/types';
import { useTranslations } from 'next-intl';

const getVendorSchema = (t: any) => z.object({
    name: z.string().min(1, t('errors.nameRequired')),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    website: z.string().optional(),
    category: z.string().optional(),
    glAccount: z.string().optional(),
    emailOptOut: z.boolean().default(false),
    description: z.string().optional(),
    billingAddress: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        country: z.string().optional(),
    }).optional(),
});

type FormValues = z.infer<ReturnType<typeof getVendorSchema>>;

interface VendorFormProps {
    initialData?: Partial<Vendor>;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

export default function VendorForm({ initialData, onSubmit, onCancel }: VendorFormProps) {
    const t = useTranslations('inventory.vendors');
    const tCommon = useTranslations('common');
    const form = useForm<FormValues>({
        resolver: zodResolver(getVendorSchema(t)),
        defaultValues: {
            name: initialData?.name || '',
            email: initialData?.email || '',
            phone: initialData?.phone || '',
            website: initialData?.website || '',
            category: initialData?.category || '',
            glAccount: initialData?.glAccount || '',
            emailOptOut: initialData?.emailOptOut || false,
            description: initialData?.description || '',
            billingAddress: initialData?.billingAddress || { street: '', city: '', state: '', zip: '', country: '' },
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: FormValues) => {
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
                        <div className="w-8 h-8 rounded bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <h1 className="text-lg font-medium text-slate-800">
                            {initialData ? `${t('editVendor')}: ${initialData.name}` : t('createVendor')}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={onCancel} className="h-8 px-4 text-xs font-medium rounded border-slate-300 hover:bg-slate-50 text-slate-700">
                            {tCommon('cancel')}
                        </Button>
                        <Button type="button" variant="outline" className="h-8 px-4 text-xs font-medium rounded border-slate-300 hover:bg-slate-50 text-slate-700">
                            {tCommon('saveAndNew')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="h-8 px-4 text-xs font-medium rounded bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                            {isSubmitting ? tCommon('saving') : tCommon('save')}
                        </Button>
                    </div>
                </div>

                <div className="p-8 max-w-5xl mx-auto space-y-12 pb-24">

                    {/* Vendor Image Section (Placeholder) */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-800">{t('sections.vendorImage')}</h3>
                        <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <User className="w-8 h-8 text-slate-400" />
                        </div>
                    </div>

                    {/* Vendor Information Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2">{t('sections.vendorInfo')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{t('fields.owner')}</FormLabel>
                                    <div className="col-span-2">
                                        <div className="h-8 px-3 flex items-center bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 cursor-not-allowed">
                                            {tCommon('currentUser')}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{t('fields.phone')}</FormLabel>
                                    <div className="col-span-2">
                                        <FormField control={form.control} name="phone" render={({ field }) => (
                                            <FormControl><Input className="h-8 text-sm rounded border-slate-300 focus:border-indigo-500" {...field} value={field.value || ''} /></FormControl>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{t('fields.website')}</FormLabel>
                                    <div className="col-span-2">
                                        <FormField control={form.control} name="website" render={({ field }) => (
                                            <FormControl><Input className="h-8 text-sm rounded border-slate-300 focus:border-indigo-500" {...field} value={field.value || ''} /></FormControl>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{t('fields.category')}</FormLabel>
                                    <div className="col-span-2">
                                        <FormField control={form.control} name="category" render={({ field }) => (
                                            <FormControl><Input className="h-8 text-sm rounded border-slate-300 focus:border-indigo-500" {...field} value={field.value || ''} /></FormControl>
                                        )} />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium whitespace-nowrap"><span className="text-red-500 mr-0.5">*</span> {t('fields.name')}</FormLabel>
                                    <div className="col-span-2">
                                        <FormField control={form.control} name="name" render={({ field }) => (
                                            <FormControl><Input className="h-8 text-sm rounded border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500" {...field} value={field.value || ''} /></FormControl>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{t('fields.email')}</FormLabel>
                                    <div className="col-span-2">
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormControl><Input type="email" className="h-8 text-sm rounded border-slate-300 focus:border-indigo-500" {...field} value={field.value || ''} /></FormControl>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{t('fields.glAccount')}</FormLabel>
                                    <div className="col-span-2">
                                        <FormField control={form.control} name="glAccount" render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                                <FormControl>
                                                    <SelectTrigger className="h-8 text-sm rounded border-slate-300 focus:border-indigo-500">
                                                        <SelectValue placeholder={t('glAccounts.none')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none" disabled>{t('glAccounts.none')}</SelectItem>
                                                    <SelectItem value="Sales Revenue">{t('glAccounts.salesRevenue')}</SelectItem>
                                                    <SelectItem value="Cost of Goods Sold">{t('glAccounts.cogs')}</SelectItem>
                                                    <SelectItem value="Operating Expenses">{t('glAccounts.operatingExpenses')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium">{t('fields.emailOptOut')}</FormLabel>
                                    <div className="col-span-2 flex items-center h-8">
                                        <FormField control={form.control} name="emailOptOut" render={({ field }) => (
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="border-slate-300 rounded-sm data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                                            </FormControl>
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Information Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2">{t('sections.addressInfo')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
                            {/* Left Column (Address) */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <FormLabel className="text-xs text-right text-slate-600 font-medium pt-2">{tCommon('address')}</FormLabel>
                                    <div className="col-span-2 space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                        {['country', 'street', 'city', 'state', 'zip'].map((sub) => (
                                            <div key={`billing-${sub}`} className="grid grid-cols-3 items-center gap-4">
                                                <FormLabel className="text-[11px] text-right text-slate-500">
                                                    {sub === 'street' ? tCommon('street') : sub === 'zip' ? tCommon('zip') : sub === 'country' ? tCommon('country') : sub === 'state' ? tCommon('state') : tCommon('city')}
                                                </FormLabel>
                                                <div className="col-span-2">
                                                    <FormField control={form.control} name={`billingAddress.${sub}` as any} render={({ field }) => (
                                                        <FormControl><Input className="h-8 text-sm rounded border-slate-300 bg-white" placeholder={sub === 'country' || sub === 'state' ? tCommon('none') : ''} {...field} value={field.value || ''} /></FormControl>
                                                    )} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Right Column (Empty for matching Devex screenshot Layout) */}
                            <div className="space-y-6"></div>
                        </div>
                    </div>

                    {/* Description Information Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2">{t('sections.descriptionInfo')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
                            <div className="grid grid-cols-3 gap-4">
                                <FormLabel className="text-xs text-right text-slate-600 font-medium pt-2">{t('fields.description')}</FormLabel>
                                <div className="col-span-2">
                                    <FormField control={form.control} name="description" render={({ field }) => (
                                        <FormControl>
                                            <Textarea className="min-h-[100px] text-sm rounded border-slate-300 focus:border-indigo-500 resize-y" {...field} value={field.value || ''} />
                                        </FormControl>
                                    )} />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </form>
        </Form>
    );
}
