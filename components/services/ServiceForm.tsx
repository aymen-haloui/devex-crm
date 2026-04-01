'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, X, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useTranslations } from 'next-intl';

const serviceFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    price: z.string().or(z.number()).transform((val) => Number(val) || 0),
    duration: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof serviceFormSchema>;

interface ServiceFormProps {
    initialData?: any;
    onSubmit: (data: FormValues) => Promise<void>;
    onCancel: () => void;
}

export default function ServiceForm({ initialData, onSubmit, onCancel }: ServiceFormProps) {
    const tCommon = useTranslations('common');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(serviceFormSchema),
        defaultValues: {
            name: initialData?.name || '',
            price: initialData?.price ? Number(initialData.price) : 0,
            duration: initialData?.duration || '',
            location: initialData?.location || '',
            description: initialData?.description || '',
            isActive: initialData?.isActive ?? true,
        },
    });

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
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-semibold">{initialData ? 'Edit Service' : 'New Service'}</h2>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>{tCommon('cancel')}</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? tCommon('saving') : tCommon('save')}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Service Name</FormLabel>
                                <FormControl><Input placeholder="e.g. Lawn Care" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price (DZD)</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.value)} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Duration</FormLabel>
                                <FormControl><Input placeholder="e.g. 2 Hours" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl><Input placeholder="e.g. Client Address" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Textarea rows={4} {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Active Status</FormLabel>
                                    <div className="text-[12px] text-gray-500">Service is available for booking/quoting.</div>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </form>
        </Form>
    );
}
