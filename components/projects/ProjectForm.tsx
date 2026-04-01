'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, X, Layers, Calendar, DollarSign, User, Building2, Target } from 'lucide-react';
import EntityAutocomplete from '@/components/ui/EntityAutocomplete';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useTranslations } from 'next-intl';

const projectFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    status: z.enum(['planning', 'in_progress', 'completed', 'on_hold', 'cancelled']).default('planning'),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    budget: z.string().or(z.number()).transform((val) => Number(val) || 0),
    revenue: z.string().or(z.number()).transform((val) => Number(val) || 0),
    description: z.string().optional().nullable(),
    accountId: z.string().optional().nullable(),
    contactId: z.string().optional().nullable(),
    dealId: z.string().optional().nullable(),
    ownerId: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
    initialData?: any;
    onSubmit: (data: FormValues) => Promise<void>;
    onCancel: () => void;
}

export default function ProjectForm({ initialData, onSubmit, onCancel }: ProjectFormProps) {
    const tCommon = useTranslations('common');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // autocomplete components will fetch their own lists, so we no longer need to keep
    // large arrays of users/accounts/contacts/deals in state.

    // no need to prefetch relationship lists; autocomplete fields will query their endpoints directly.

    const form = useForm<FormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: {
            name: initialData?.name || '',
            status: initialData?.status || 'planning',
            startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
            endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
            budget: initialData?.budget ? Number(initialData.budget) : 0,
            revenue: initialData?.revenue ? Number(initialData.revenue) : 0,
            description: initialData?.description || '',
            accountId: initialData?.accountId || '',
            contactId: initialData?.contactId || '',
            dealId: initialData?.dealId || '',
            ownerId: initialData?.ownerId || '',
        },
    });

    const handleSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                accountId: data.accountId === '' ? null : data.accountId,
                contactId: data.contactId === '' ? null : data.contactId,
                dealId: data.dealId === '' ? null : data.dealId,
                ownerId: data.ownerId === '' ? null : data.ownerId,
            };
            await onSubmit(payload);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-semibold">{initialData ? 'Edit Project' : 'New Project'}</h2>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>{tCommon('cancel')}</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? tCommon('saving') : tCommon('save')}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl><Input placeholder="Internal CRM Upgrade" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="planning">Planning</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="on_hold">On Hold</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="budget"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Budget (DZD)</FormLabel>
                                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.value)} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="revenue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Revenue (DZD)</FormLabel>
                                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.value)} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="accountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account</FormLabel>
                                    <FormControl>
                                        <EntityAutocomplete
                                            endpoint="/api/accounts"
                                            placeholder={tCommon('placeholders.searchAccounts')}
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="contactId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact</FormLabel>
                                    <FormControl>
                                        <EntityAutocomplete
                                            endpoint="/api/contacts"
                                            placeholder={tCommon('placeholders.searchContacts')}
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dealId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deal</FormLabel>
                                    <FormControl>
                                        <EntityAutocomplete
                                            endpoint="/api/deals"
                                            placeholder={tCommon('placeholders.searchDeals')}
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ownerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Owner</FormLabel>
                                    <FormControl>
                                        <EntityAutocomplete
                                            endpoint="/api/users"
                                            placeholder={tCommon('placeholders.searchUsers')}
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Description</FormLabel>
                                    <FormControl><Textarea rows={4} {...field} value={field.value || ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </form>
        </Form>
    );
}
