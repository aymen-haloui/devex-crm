'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, Copy, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EntityAutocomplete from '@/components/ui/EntityAutocomplete';
import { Invoice, Product, User as UserType } from '@/types';
import { numberToFrenchWords } from '@/lib/currency-utils';
import { PrintDocument } from './PrintDocument';
import { useTranslations } from 'next-intl';

const getInvoiceSchema = (t: any) => z.object({
    subject: z.string().min(1, t('errors.subjectRequired')),
    customerNo: z.string().optional().nullable(),
    status: z.string().default('draft'),
    purchaseOrder: z.string().optional().nullable(),
    exciseDuty: z.string().optional().nullable(),
    salesCommission: z.coerce.number().optional().nullable(),
    invoiceDate: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),
    ownerId: z.string().optional().nullable(),
    accountId: z.string().optional().nullable(),
    contactId: z.string().optional().nullable(),
    dealId: z.string().optional().nullable(),
    billingAddress: z.object({ street: z.string().optional(), city: z.string().optional(), state: z.string().optional(), zip: z.string().optional(), country: z.string().optional() }).optional(),
    shippingAddress: z.object({ street: z.string().optional(), city: z.string().optional(), state: z.string().optional(), zip: z.string().optional(), country: z.string().optional() }).optional(),
    subTotal: z.coerce.number().default(0),
    discount: z.coerce.number().default(0),
    tax: z.coerce.number().default(0),
    adjustment: z.coerce.number().default(0),
    grandTotal: z.coerce.number().default(0),
    termsAndConditions: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    lineItems: z.array(z.object({
        productId: z.string().min(1, t('errors.productRequired')),
        quantity: z.coerce.number().min(1).default(1),
        listPrice: z.coerce.number().default(0),
        discount: z.coerce.number().default(0),
        tax: z.coerce.number().default(0),
        amount: z.coerce.number().default(0),
        total: z.coerce.number().default(0),
        description: z.string().optional().nullable(),
    })).default([]),
});

type FormValues = z.infer<ReturnType<typeof getInvoiceSchema>>;

interface InvoiceFormProps {
    initialData?: Invoice | null;
    onSubmit: (data: any) => Promise<void>;
    onCancel?: () => void;
}

export default function InvoiceForm({ initialData, onSubmit, onCancel }: InvoiceFormProps) {
    const t = useTranslations('inventory.invoices');
    const tCommon = useTranslations('common');

    const INVOICE_STATUSES = [
        { value: 'draft', label: t('statuses.draft') },
        { value: 'sent', label: t('statuses.sent') },
        { value: 'paid', label: t('statuses.paid') },
        { value: 'overdue', label: t('statuses.overdue') },
        { value: 'cancelled', label: t('statuses.cancelled') },
        { value: 'void', label: t('statuses.void') },
    ];
    const [users, setUsers] = useState<any[]>([]);
    const [deals, setDeals] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [org, setOrg] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toDateStr = (d: any) => d ? new Date(d).toISOString().split('T')[0] : '';

    const schema = React.useMemo(() => getInvoiceSchema(t), [t]);
    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: initialData ? {
            subject: initialData.subject, status: initialData.status,
            customerNo: initialData.customerNo ?? '', exciseDuty: initialData.exciseDuty ?? '',
            salesCommission: initialData.salesCommission ? Number(initialData.salesCommission) : 0,
            purchaseOrder: initialData.purchaseOrder ?? '', invoiceDate: toDateStr(initialData.invoiceDate),
            dueDate: toDateStr(initialData.dueDate), ownerId: initialData.ownerId ?? '',
            accountId: initialData.accountId ?? '', contactId: initialData.contactId ?? '',
            dealId: initialData.dealId ?? '', billingAddress: initialData.billingAddress ?? {},
            shippingAddress: initialData.shippingAddress ?? {},
            subTotal: Number(initialData.subTotal), discount: Number(initialData.discount),
            tax: Number(initialData.tax), adjustment: Number(initialData.adjustment),
            grandTotal: Number(initialData.grandTotal), termsAndConditions: initialData.termsAndConditions ?? '',
            description: initialData.description ?? '',
            lineItems: (initialData.lineItems || []).map(item => ({
                productId: item.productId, quantity: item.quantity,
                listPrice: Number(item.listPrice), discount: Number(item.discount),
                tax: Number(item.tax), amount: Number(item.amount),
                total: Number(item.total), description: item.description ?? '',
            })),
        } : { status: 'draft', invoiceDate: toDateStr(new Date()), subTotal: 0, discount: 0, tax: 0, adjustment: 0, grandTotal: 0, lineItems: [] },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });
    const lineItems = watch('lineItems');
    const adjustment = watch('adjustment') || 0;

    useEffect(() => {
        const subTotal = lineItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
        const totalDiscount = lineItems.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
        const totalTax = lineItems.reduce((sum, item) => {
            const base = (Number(item.listPrice) * Number(item.quantity)) - Number(item.discount);
            return sum + (base * (Number(item.tax) / 100));
        }, 0);
        setValue('subTotal', Math.round(subTotal * 100) / 100);
        setValue('discount', Math.round(totalDiscount * 100) / 100);
        setValue('tax', Math.round(totalTax * 100) / 100);
        setValue('grandTotal', Math.round((subTotal + totalTax + Number(adjustment)) * 100) / 100);
    }, [JSON.stringify(lineItems), adjustment, setValue]);

    const calcAmounts = useCallback((index: number) => {
        const item = lineItems[index];
        if (!item) return;
        const base = (Number(item.listPrice) * Number(item.quantity));
        const discounted = base - Number(item.discount);
        const taxAmt = discounted * (Number(item.tax) / 100);
        setValue(`lineItems.${index}.amount`, Math.round(discounted * 100) / 100);
        setValue(`lineItems.${index}.total`, Math.round((discounted + taxAmt) * 100) / 100);
    }, [lineItems, setValue]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [u, d, p, o] = await Promise.all([
                    fetch('/api/users').then(r => r.ok ? r.json() : { success: false }),
                    fetch('/api/deals?limit=100').then(r => r.ok ? r.json() : { success: false }),
                    fetch('/api/products?limit=100').then(r => r.ok ? r.json() : { success: false }),
                    fetch('/api/organizations/profile').then(r => r.ok ? r.json() : { success: false }),
                ]);
                if (u.success) setUsers(u.data || u.users || []);
                if (d.success) setDeals(d.data || []);
                if (p.success) setProducts(p.data || []);
                if (o.success) setOrg(o.data);
            } catch (err) {
                console.error('Error fetching form data:', err);
            }
        };
        fetchData();
    }, []);

    const handleProductChange = (index: number, productId: string) => {
        const p = products.find(p => p.id === productId);
        if (p) {
            setValue(`lineItems.${index}.listPrice`, Number(p.unitPrice) / 100);
            setValue(`lineItems.${index}.quantity`, 1);
            setValue(`lineItems.${index}.discount`, 0);
            setValue(`lineItems.${index}.tax`, 0);
            setTimeout(() => calcAmounts(index), 50);
        }
    };

    const copyBilling = () => setValue('shippingAddress', watch('billingAddress'));

    const onFormSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            await onSubmit({
                ...data,
                subTotal: Math.round((data.subTotal || 0) * 100),
                discount: Math.round((data.discount || 0) * 100),
                tax: Math.round((data.tax || 0) * 100),
                adjustment: Math.round((data.adjustment || 0) * 100),
                grandTotal: Math.round((data.grandTotal || 0) * 100),
                lineItems: data.lineItems.map(item => ({
                    ...item,
                    listPrice: Math.round((item.listPrice || 0) * 100),
                    discount: Math.round((item.discount || 0) * 100),
                    amount: Math.round((item.amount || 0) * 100),
                    total: Math.round((item.total || 0) * 100),
                })),
            });
            toast.success(t('successMessage'));
        } catch { toast.error(t('errorMessage')); }
        finally { setIsSubmitting(false); }
    };

    const i = "h-10 border-slate-200 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all";
    const l = "text-xs font-black text-slate-500 uppercase tracking-wider";
    const s = "bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-6";

    const currencySymbol = org?.currency === 'DZD' ? 'د.ج' : (org?.currency === 'EUR' ? '€' : '$');

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                        <FileText className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">{initialData ? t('editInvoice') : t('newInvoice')}</h1>
                        <p className="text-sm font-medium text-slate-500">{initialData ? t('editingInvoice', { number: initialData.invoiceNumber }) : t('placeholders.status')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {onCancel && <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-6 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50">{tCommon('cancel')}</Button>}
                    <Button type="button" variant="outline" onClick={() => window.print()} className="h-11 px-6 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 no-print">
                        <FileText className="w-4 h-4 mr-2" /> {t('printPdf')}
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="h-11 px-6 rounded-xl font-bold bg-accent hover:bg-accent/90 text-white shadow-sm no-print">
                        {isSubmitting ? tCommon('saving') : (initialData ? t('updateInvoice') : t('createInvoice'))}
                    </Button>
                </div>
            </div>

            {/* Invoice Info */}
            <div className={s}>
                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                    <div className="p-2 bg-primary/5 rounded-xl"><FileText className="w-4 h-4 text-primary" /></div>
                    <div className="flex-1">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.invoiceInfo')}</h2>
                        {org && (
                            <div className="flex gap-4 mt-2">
                                {org.rcNumber && <span className="text-[9px] font-bold text-slate-400 uppercase">RC: {org.rcNumber}</span>}
                                {org.nifNumber && <span className="text-[9px] font-bold text-slate-400 uppercase">NIF: {org.nifNumber}</span>}
                                {org.aiNumber && <span className="text-[9px] font-bold text-slate-400 uppercase">AI: {org.aiNumber}</span>}
                                {org.nisNumber && <span className="text-[9px] font-bold text-slate-400 uppercase">NIS: {org.nisNumber}</span>}
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {initialData && (
                        <div className="space-y-1.5">
                            <Label className={l}>{t('fields.invoiceNumber')}</Label>
                            <Input value={initialData.invoiceNumber} disabled className={i} />
                        </div>
                    )}
                    <div className={initialData ? "lg:col-span-1 space-y-1.5" : "lg:col-span-2 space-y-1.5"}>
                        <Label className={l}>{t('fields.subject')} *</Label>
                        <Input {...register('subject')} placeholder={t('placeholders.subject')} className={i} />
                        {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label className={l}>{t('fields.customerNo')}</Label>
                        <Input {...register('customerNo')} placeholder={t('placeholders.customerNo')} className={i} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={l}>{t('fields.status')}</Label>
                        <Controller name="status" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className={i}><SelectValue placeholder={t('placeholders.status')} /></SelectTrigger>
                                <SelectContent>{INVOICE_STATUSES.map(st => <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>)}</SelectContent>
                            </Select>
                        )} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={l}>{t('fields.salesCommission')}</Label>
                        <Input type="number" step="0.01" {...register('salesCommission')} placeholder="0.00" className={i} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={l}>{t('fields.exciseDuty')}</Label>
                        <Input {...register('exciseDuty')} placeholder={t('placeholders.exciseDuty')} className={i} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={l}>{t('fields.purchaseOrder')}</Label>
                        <Input {...register('purchaseOrder')} placeholder={t('placeholders.purchaseOrder')} className={i} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={l}>{t('fields.invoiceDate')}</Label>
                        <Input type="date" {...register('invoiceDate')} className={i} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={l}>{t('fields.dueDate')}</Label>
                        <Input type="date" {...register('dueDate')} className={i} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={l}>{t('fields.owner')}</Label>
                        <Controller name="ownerId" control={control} render={({ field }) => (
                            <EntityAutocomplete
                                endpoint="/api/users"
                                placeholder={t('placeholders.searchUsers')}
                                value={field.value || ''}
                                onChange={(id) => field.onChange(id || null)}
                            />
                        )} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={l}>{t('fields.account')}</Label>
                        <Controller name="accountId" control={control} render={({ field }) => (
                            <EntityAutocomplete
                                endpoint="/api/accounts"
                                placeholder={t('placeholders.searchAccounts')}
                                value={field.value || ''}
                                onChange={(id) => field.onChange(id || null)}
                            />
                        )} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={l}>{t('fields.contact')}</Label>
                        <Controller name="contactId" control={control} render={({ field }) => (
                            <EntityAutocomplete
                                endpoint="/api/contacts"
                                placeholder={t('placeholders.searchContacts')}
                                value={field.value || ''}
                                onChange={(id) => field.onChange(id || null)}
                            />
                        )} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={l}>{t('fields.deal')}</Label>
                        <Controller name="dealId" control={control} render={({ field }) => (
                            <EntityAutocomplete
                                endpoint="/api/deals"
                                placeholder={t('placeholders.searchDeals')}
                                value={field.value || ''}
                                onChange={(id) => field.onChange(id || null)}
                            />
                        )} />
                    </div>
                </div>
            </div>

            {/* Addresses */}
            <div className={s}>
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.addressInfo')}</h2>
                    <Button type="button" variant="outline" size="sm" onClick={copyBilling}
                        className="text-xs font-bold border-slate-200 text-accent hover:bg-accent/5 rounded-xl">
                        <Copy className="w-3 h-3 mr-1.5" /> {t('copyBilling')}
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(['billingAddress', 'shippingAddress'] as const).map((addr, idx) => (
                        <div key={addr} className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{idx === 0 ? t('placeholders.billing') : t('placeholders.shipping')} {tCommon('fields.address')}</h3>
                            <div className="space-y-3">
                                <Input {...register(`${addr}.street`)} placeholder={t('placeholders.street')} className={i} />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input {...register(`${addr}.city`)} placeholder={t('placeholders.city')} className={i} />
                                    <Input {...register(`${addr}.state`)} placeholder={t('placeholders.state')} className={i} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input {...register(`${addr}.zip`)} placeholder={t('placeholders.zip')} className={i} />
                                    <Input {...register(`${addr}.country`)} placeholder={t('placeholders.country')} className={i} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Line Items */}
            <div className={s}>
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.invoicedItems')}</h2>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1, listPrice: 0, discount: 0, tax: 0, amount: 0, total: 0, description: '' })}
                        className="text-xs font-bold border-accent/20 text-accent hover:bg-accent/5 rounded-xl">
                        <Plus className="w-3 h-3 mr-1.5" /> {t('placeholders.addItem')}
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="py-3 pl-2 text-left text-xs font-black text-slate-400 uppercase tracking-widest w-8">#</th>
                                <th className="py-3 px-3 text-left text-xs font-black text-slate-400 uppercase">{t('fields.product')}</th>
                                <th className="py-3 px-3 text-right text-xs font-black text-slate-400 uppercase w-20">{t('fields.quantity')}</th>
                                <th className="py-3 px-3 text-right text-xs font-black text-slate-400 uppercase w-28">{t('fields.unitPrice')}</th>
                                <th className="py-3 px-3 text-right text-xs font-black text-slate-400 uppercase w-28">{t('fields.discount')}</th>
                                <th className="py-3 px-3 text-right text-xs font-black text-slate-400 uppercase w-20">{t('fields.taxPercent')}</th>
                                <th className="py-3 px-3 text-right text-xs font-black text-slate-400 uppercase w-28">{t('fields.total')}</th>
                                <th className="py-3 px-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, idx) => (
                                <tr key={field.id} className="border-b border-slate-50">
                                    <td className="py-3 pl-2 text-xs font-bold text-slate-400">{idx + 1}</td>
                                    <td className="py-3 px-3">
                                        <Controller name={`lineItems.${idx}.productId`} control={control} render={({ field: f }) => (
                                            <Select onValueChange={v => { f.onChange(v); handleProductChange(idx, v); }} value={f.value}>
                                                <SelectTrigger className="h-9 border-slate-200 rounded-xl text-xs font-medium w-full"><SelectValue placeholder={t('placeholders.selectProduct')} /></SelectTrigger>
                                                <SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        )} />
                                    </td>
                                    <td className="py-3 px-3"><Input type="number" min="1" {...register(`lineItems.${idx}.quantity`, { onChange: () => calcAmounts(idx) })} className="h-9 border-slate-200 rounded-xl text-xs font-bold text-right w-full" /></td>
                                    <td className="py-3 px-3"><Input type="number" step="0.01" {...register(`lineItems.${idx}.listPrice`, { onChange: () => calcAmounts(idx) })} className="h-9 border-slate-200 rounded-xl text-xs font-bold text-right w-full" /></td>
                                    <td className="py-3 px-3"><Input type="number" step="0.01" {...register(`lineItems.${idx}.discount`, { onChange: () => calcAmounts(idx) })} className="h-9 border-slate-200 rounded-xl text-xs font-bold text-right w-full" /></td>
                                    <td className="py-3 px-3"><Input type="number" step="0.1" {...register(`lineItems.${idx}.tax`, { onChange: () => calcAmounts(idx) })} className="h-9 border-slate-200 rounded-xl text-xs font-bold text-right w-full" /></td>
                                    <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">{currencySymbol} {(watch(`lineItems.${idx}.total`) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="py-3 px-2"><Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)} className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><Trash2 className="w-3.5 h-3.5" /></Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {fields.length === 0 && <div className="py-12 text-center text-slate-400 font-medium text-sm">{t('placeholders.noItemsAdded')}</div>}
                </div>

                {/* Total in Words (Algerian Requirement) */}
                {watch('grandTotal') > 0 && org?.currency === 'DZD' && (
                    <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t('sections.totalInWords')}</span>
                        <p className="text-sm font-bold text-slate-700 italic">
                            &ldquo;{t('legal.amountInWordsPrefix')} {numberToFrenchWords(watch('grandTotal'))} {t('legal.amountInWordsSuffix')}&rdquo;
                        </p>
                    </div>
                )}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <div className="w-full max-w-sm space-y-3">
                        <div className="flex justify-between text-sm font-bold text-slate-500"><span>{t('fields.subTotal')}</span><span>{currencySymbol} {(watch('subTotal') || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                        <div className="flex justify-between text-sm font-bold text-rose-500"><span>{t('fields.discount')}</span><span>- {currencySymbol} {(watch('discount') || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                        <div className="flex justify-between text-sm font-bold text-slate-500"><span>{t('fields.tax')}</span><span>{currencySymbol} {(watch('tax') || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                        <div className="flex justify-between text-sm font-bold text-slate-600 items-center"><span>{t('fields.adjustment')}</span><Input type="number" step="0.01" {...register('adjustment')} className="h-8 w-28 text-right text-sm font-bold border-slate-200 rounded-xl" /></div>
                        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex justify-between items-center mt-4">
                            <span className="text-sm font-black text-slate-800 uppercase tracking-widest">{t('fields.grandTotal')}</span>
                            <span className="text-xl font-black text-primary">{currencySymbol} {(watch('grandTotal') || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms */}
            <div className={s}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <Label className={l}>{t('fields.terms')}</Label>
                        <Textarea {...register('termsAndConditions')} rows={5} placeholder={t('placeholders.enterTerms')} className="border-slate-200 rounded-xl text-sm font-medium resize-none" />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={l}>{t('fields.description')}</Label>
                        <Textarea {...register('description')} rows={5} placeholder={t('placeholders.internalNotes')} className="border-slate-200 rounded-xl text-sm font-medium resize-none" />
                    </div>
                </div>
            </div>

            {/* Hidden Print Document */}
            <PrintDocument
                data={watch()}
                org={org}
                type="Invoice"
                currencySymbol={currencySymbol}
            />
        </form>
    );
}
