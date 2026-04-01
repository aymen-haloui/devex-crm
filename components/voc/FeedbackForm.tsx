'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, X, MessageSquare, User, Star, Send } from 'lucide-react';
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

const feedbackFormSchema = z.object({
    contactId: z.string().optional().nullable(),
    customerName: z.string().optional().nullable(),
    rating: z.number().min(1).max(5).default(5),
    comment: z.string().min(1, 'Comment is required'),
    source: z.string().optional().nullable(),
    sentiment: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof feedbackFormSchema>;

interface FeedbackFormProps {
    initialData?: any;
    onSubmit: (data: FormValues) => Promise<void>;
    onCancel: () => void;
}

export default function FeedbackForm({ initialData, onSubmit, onCancel }: FeedbackFormProps) {
    const tCommon = useTranslations('common');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [contacts, setContacts] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/contacts').then(r => r.json()).then(json => {
            if (json.success) setContacts(json.data);
        });
    }, []);

    const form = useForm<FormValues>({
        resolver: zodResolver(feedbackFormSchema),
        defaultValues: {
            contactId: initialData?.contactId || 'none',
            customerName: initialData?.customerName || '',
            rating: initialData?.rating || 5,
            comment: initialData?.comment || '',
            source: initialData?.source || 'manual',
            sentiment: initialData?.sentiment || 'neutral',
        },
    });

    const handleSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                contactId: data.contactId === 'none' ? null : data.contactId,
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
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 bg-white p-6 rounded-xl border">
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-semibold">{initialData ? 'Edit Feedback' : 'New Feedback Entry'}</h2>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>{tCommon('cancel')}</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="contactId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Linked Contact</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || 'none'}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select Contact" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">Anonymous / Not Linked</SelectItem>
                                        {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customer Name (if not linked)</FormLabel>
                                <FormControl><Input placeholder="John Doe" {...field} value={field.value || ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rating (1-5)</FormLabel>
                                <div className="flex items-center gap-2 mt-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => field.onChange(star)}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${star <= field.value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="source"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Source</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || 'manual'}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="manual">Manual Entry</SelectItem>
                                        <SelectItem value="email">Email Survey</SelectItem>
                                        <SelectItem value="phone">Phone Call</SelectItem>
                                        <SelectItem value="website">Website Form</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comments / Feedback</FormLabel>
                                    <FormControl><Textarea rows={4} placeholder="What did the customer say?" {...field} /></FormControl>
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
