'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
    Plus, Trash2, Copy, ChevronDown, Package, ShoppingCart
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EntityAutocomplete from '@/components/ui/EntityAutocomplete';
import { SalesOrder, SalesOrderLineItem } from '@/types';
import { numberToFrenchWords } from '@/lib/currency-utils';
import { PrintDocument } from './PrintDocument';

const getSalesOrderSchema = (t: any) => z.object({
    subject: z.string().min(1, 'subjectRequired'),
    customerNo: z.string().optional().nullable(),
    status: z.string().default('created'),
    carrier: z.string().optional().nullable(),
    exciseDuty: z.string().optional().nullable(),
    pendingBilling: z.string().optional().nullable(),
    trackingNumber: z.string().optional().nullable(),
    purchaseOrder: z.string().optional().nullable(),
    salesCommission: z.coerce.number().optional().nullable(),
    validUntil: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),
    ownerId: z.string().optional().nullable(),
    accountId: z.string().optional().nullable(),
    contactId: z.string().optional().nullable(),
    dealId: z.string().optional().nullable(),
    quoteId: z.string().optional().nullable(),
    billingAddress: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        country: z.string().optional(),
    }).optional(),
    shippingAddress: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        country: z.string().optional(),
    }).optional(),
    subTotal: z.coerce.number().default(0),
    discount: z.coerce.number().default(0),
    tax: z.coerce.number().default(0),
    adjustment: z.coerce.number().default(0),
    grandTotal: z.coerce.number().default(0),
    termsAndConditions: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    lineItems: z.array(z.object({
        productId: z.string().min(1, 'productRequired'),
        quantity: z.coerce.number().min(1).default(1),
        listPrice: z.coerce.number().default(0),
        discount: z.coerce.number().default(0),
        tax: z.coerce.number().default(0),
        amount: z.coerce.number().default(0),
        total: z.coerce.number().default(0),
        description: z.string().optional().nullable(),
    })).default([]),
});

type FormValues = z.infer<ReturnType<typeof getSalesOrderSchema>>;

interface SalesOrderFormProps {
    initialData?: SalesOrder | null;
    onSubmit: (data: any) => Promise<void>;
    onCancel?: () => void;
}

const ORDER_STATUSES = [
    { value: 'created', key: 'statuses.created' },
    { value: 'approved', key: 'statuses.approved' },
    { value: 'delivered', key: 'statuses.delivered' },
    { value: 'cancelled', key: 'statuses.cancelled' },
];

export default function SalesOrderForm({ initialData, onSubmit, onCancel }: SalesOrderFormProps) {
    // relationship autocompletes fetch their own options
    const [products, setProducts] = useState<any[]>([]);
    const [org, setOrg] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const t = useTranslations('common');
    const ts = useTranslations('inventory.salesOrders');
    const ti = useTranslations('inventory.common');

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(getSalesOrderSchema(ts)),
        defaultValues: initialData ? {
            subject: initialData.subject,
            customerNo: initialData.customerNo ?? '',
            status: initialData.status,
            carrier: initialData.carrier ?? '',
            exciseDuty: initialData.exciseDuty ?? '',
            pendingBilling: initialData.pendingBilling ?? '',
            trackingNumber: initialData.trackingNumber ?? '',
            purchaseOrder: initialData.purchaseOrder ?? '',
            salesCommission: initialData.salesCommission ?? 0,
            validUntil: initialData.validUntil ? new Date(initialData.validUntil).toISOString().split('T')[0] : '',
            dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
            ownerId: initialData.ownerId ?? '',
            accountId: initialData.accountId ?? '',
            contactId: initialData.contactId ?? '',
            dealId: initialData.dealId ?? '',
            quoteId: initialData.quoteId ?? '',
            billingAddress: initialData.billingAddress ?? {},
            shippingAddress: initialData.shippingAddress ?? {},
            subTotal: Number(initialData.subTotal),
            discount: Number(initialData.discount),
            tax: Number(initialData.tax),
            adjustment: Number(initialData.adjustment),
            grandTotal: Number(initialData.grandTotal),
            termsAndConditions: initialData.termsAndConditions ?? '',
            description: initialData.description ?? '',
            lineItems: (initialData.lineItems || []).map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                listPrice: Number(item.listPrice),
                discount: Number(item.discount),
                tax: Number(item.tax),
                amount: Number(item.amount),
                total: Number(item.total),
                description: item.description ?? '',
            })),
        } : {
            status: 'created',
            subTotal: 0, discount: 0, tax: 0, adjustment: 0, grandTotal: 0,
            lineItems: [],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });
    const lineItems = watch('lineItems');
    const adjustment = watch('adjustment') || 0;

    // Calculate totals whenever line items or adjustment change
    useEffect(() => {
        const subTotal = lineItems.reduce((sum: number, item: any) => sum + (Number(item.total) || 0), 0);
        const totalDiscount = lineItems.reduce((sum: number, item: any) => sum + (Number(item.discount) || 0), 0);
        const totalTax = lineItems.reduce((sum: number, item: any) => {
            const itemTotal = (Number(item.listPrice) * Number(item.quantity)) - Number(item.discount);
            return sum + (itemTotal * (Number(item.tax) / 100));
        }, 0);
        const grandTotal = subTotal + totalTax + Number(adjustment);
        setValue('subTotal', Math.round(subTotal * 100) / 100);
        setValue('discount', Math.round(totalDiscount * 100) / 100);
        setValue('tax', Math.round(totalTax * 100) / 100);
        setValue('grandTotal', Math.round(grandTotal * 100) / 100);
    }, [JSON.stringify(lineItems), adjustment, setValue]);

    // Calculate line item amounts
    const calculateLineItemAmounts = useCallback((index: number) => {
        const item = lineItems[index];
        if (!item) return;
        const baseAmount = (Number(item.listPrice) * Number(item.quantity));
        const discountedAmount = baseAmount - Number(item.discount);
        const taxAmount = discountedAmount * (Number(item.tax) / 100);
        const total = discountedAmount + taxAmount;
        setValue(`lineItems.${index}.amount`, Math.round(discountedAmount * 100) / 100);
        setValue(`lineItems.${index}.total`, Math.round(total * 100) / 100);
    }, [lineItems, setValue]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // the autocomplete fields will query their own endpoints; still keep products and orgs for other logic
                const [productsR, orgR] = await Promise.all([
                    fetch('/api/products?limit=100').then(r => r.ok ? r.json() : { success: false }),
                    fetch('/api/organizations/profile').then(r => r.ok ? r.json() : { success: false }),
                ]);

                if (productsR.success) setProducts(productsR.data || []);
                if (orgR.success) setOrg(orgR.data || null);
            } catch (err) {
                console.error('Error fetching form data:', err);
            }
        };
        fetchData();
    }, []);

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            setValue(`lineItems.${index}.listPrice`, Number(product.unitPrice) / 100);
            setValue(`lineItems.${index}.quantity`, 1);
            setValue(`lineItems.${index}.discount`, 0);
            setValue(`lineItems.${index}.tax`, 0);
            setTimeout(() => calculateLineItemAmounts(index), 50);
        }
    };

    const copyBillingToShipping = () => {
        const billing = watch('billingAddress');
        setValue('shippingAddress', billing);
    };

    const onFormSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                accountId: data.accountId || null,
                contactId: data.contactId || null,
                dealId: data.dealId || null,
                ownerId: data.ownerId || null,
                subTotal: Math.round((data.subTotal || 0) * 100),
                discount: Math.round((data.discount || 0) * 100),
                tax: Math.round((data.tax || 0) * 100),
                adjustment: Math.round((data.adjustment || 0) * 100),
                grandTotal: Math.round((data.grandTotal || 0) * 100),
                lineItems: data.lineItems.map((item: any) => ({
                    ...item,
                    listPrice: Math.round((item.listPrice || 0) * 100),
                    discount: Math.round((item.discount || 0) * 100),
                    tax: item.tax || 0,
                    amount: Math.round((item.amount || 0) * 100),
                    total: Math.round((item.total || 0) * 100),
                })),
            };
            await onSubmit(payload);
        } catch (err) {
            toast.error(ts('errorMessage'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const currencySymbol = org?.currency === 'DZD' ? 'د.ج' : (org?.currency === 'EUR' ? '€' : '$');
    const inputCls = "h-10 border-slate-200 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all";
    const labelCls = "text-xs font-black text-slate-500 uppercase tracking-wider";
    const sectionCls = "bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-6";

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                        <ShoppingCart className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">
                            {initialData ? ts('editSO') : ts('newSO')}
                        </h1>
                        <p className="text-sm font-medium text-slate-500">
                            {initialData ? `${t('edit')} ${initialData.orderNumber}` : t('enterCredentials')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}
                            className="h-11 px-6 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50">
                            {t('cancel')}
                        </Button>
                    )}
                    <Button type="button" variant="outline" onClick={() => window.print()} className="h-11 px-6 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 no-print">
                        <ShoppingCart className="w-4 h-4 mr-2" /> {ti('printPdf')}
                    </Button>
                    <Button type="submit" disabled={isSubmitting}
                        className="h-11 px-6 rounded-xl font-bold bg-accent hover:bg-accent/90 text-white shadow-sm no-print">
                        {isSubmitting ? t('saving') : (initialData ? t('save') : t('create'))}
                    </Button>
                </div>
            </div>

            {/* Order Info */}
            <div className={sectionCls}>
                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                    <div className="p-2 bg-primary/5 rounded-xl"><ShoppingCart className="w-4 h-4 text-primary" /></div>
                    <div className="flex-1">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">{ts('sections.orderInfo')}</h2>
                        {org && (
                            <div className="flex gap-4 mt-2">
                                {org.rcNumber && <span className="text-[9px] font-bold text-slate-400 uppercase">{ti('legal.rc')}: {org.rcNumber}</span>}
                                {org.nifNumber && <span className="text-[9px] font-bold text-slate-400 uppercase">{ti('legal.nif')}: {org.nifNumber}</span>}
                                {org.aiNumber && <span className="text-[9px] font-bold text-slate-400 uppercase">{ti('legal.ai')}: {org.aiNumber}</span>}
                                {org.nisNumber && <span className="text-[9px] font-bold text-slate-400 uppercase">{ti('legal.nis')}: {org.nisNumber}</span>}
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                    {/* Column 1 */}
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.subject')} *</Label>
                            <Input {...register('subject')} placeholder={ts('placeholders.subject')} className={inputCls} />
                            {errors.subject && <p className="text-xs text-red-500">{ts(`errors.${errors.subject.message}`)}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.customerNo')}</Label>
                            <Input {...register('customerNo')} placeholder={ts('placeholders.customerNo')} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.orderNo')}</Label>
                            <Input value={initialData?.orderNumber || t('autoGenerated')} disabled className={`${inputCls} bg-slate-50 font-bold`} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.contactName')}</Label>
                            <Controller name="contactId" control={control} render={({ field }) => (
                                <EntityAutocomplete
                                    endpoint="/api/contacts"
                                    placeholder={ts('placeholders.searchContacts')}
                                    value={field.value || ''}
                                    onChange={(id) => field.onChange(id || null)}
                                />
                            )} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.quoteName')}</Label>
                            {/* Assuming we might want to select a quote or it's linked already */}
                            <Input value={initialData?.quoteId || t('none')} disabled className={`${inputCls} bg-slate-50`} />
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.dueDate')}</Label>
                            <Input type="date" {...register('dueDate')} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.purchaseOrder')}</Label>
                            <Input {...register('purchaseOrder')} placeholder={ts('placeholders.purchaseOrder')} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.exciseDuty')}</Label>
                            <Input {...register('exciseDuty')} placeholder={ts('placeholders.exciseDuty')} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.salesCommission')}</Label>
                            <Input type="number" step="0.01" {...register('salesCommission')} placeholder="0.00" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.status')}</Label>
                            <Controller name="status" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className={inputCls}><SelectValue placeholder={ts('placeholders.selectStatus')} /></SelectTrigger>
                                    <SelectContent>
                                        {ORDER_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{ts(s.key)}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.pendingBilling')}</Label>
                            <Input {...register('pendingBilling')} placeholder={ts('placeholders.pendingBilling')} className={inputCls} />
                        </div>
                    </div>

                    {/* Column 3 */}
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.accountName')}</Label>
                            <Controller name="accountId" control={control} render={({ field }) => (
                                <EntityAutocomplete
                                    endpoint="/api/accounts"
                                    placeholder={ts('placeholders.searchAccounts')}
                                    value={field.value || ''}
                                    onChange={(id) => field.onChange(id || null)}
                                />
                            )} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.dealName')}</Label>
                            <Controller name="dealId" control={control} render={({ field }) => (
                                <EntityAutocomplete
                                    endpoint="/api/deals"
                                    placeholder={ts('placeholders.searchDeals')}
                                    value={field.value || ''}
                                    onChange={(id) => field.onChange(id || null)}
                                />
                            )} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.orderOwner')}</Label>
                            <Controller name="ownerId" control={control} render={({ field }) => (
                                <EntityAutocomplete
                                    endpoint="/api/users"
                                    placeholder={ts('placeholders.searchUsers')}
                                    value={field.value || ''}
                                    onChange={(id) => field.onChange(id || null)}
                                />
                            )} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.validUntil')}</Label>
                            <Input type="date" {...register('validUntil')} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.carrier')}</Label>
                            <Input {...register('carrier')} placeholder={ts('placeholders.carrier')} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelCls}>{ts('fields.trackingNumber')}</Label>
                            <Input {...register('trackingNumber')} placeholder={ts('placeholders.trackingNumber')} className={inputCls} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Information */}
            <div className={sectionCls}>
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/5 rounded-xl"><Package className="w-4 h-4 text-primary" /></div>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">{ts('sections.addressInfo')}</h2>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={copyBillingToShipping}
                        className="text-xs font-bold border-slate-200 text-accent hover:bg-accent/5 rounded-xl">
                        <Copy className="w-3 h-3 mr-1.5" /> {ti('copyBilling')}
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Billing */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{ts('fields.billingAddress')}</h3>
                        <div className="space-y-3">
                            <Input {...register('billingAddress.street')} placeholder={ts('fields.street')} className={inputCls} />
                            <div className="grid grid-cols-2 gap-3">
                                <Input {...register('billingAddress.city')} placeholder={ts('fields.city')} className={inputCls} />
                                <Input {...register('billingAddress.state')} placeholder={ts('fields.state')} className={inputCls} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Input {...register('billingAddress.zip')} placeholder={ts('fields.zip')} className={inputCls} />
                                <Input {...register('billingAddress.country')} placeholder={ts('fields.country')} className={inputCls} />
                            </div>
                        </div>
                    </div>
                    {/* Shipping */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{ts('fields.shippingAddress')}</h3>
                        <div className="space-y-3">
                            <Input {...register('shippingAddress.street')} placeholder={ts('fields.street')} className={inputCls} />
                            <div className="grid grid-cols-2 gap-3">
                                <Input {...register('shippingAddress.city')} placeholder={ts('fields.city')} className={inputCls} />
                                <Input {...register('shippingAddress.state')} placeholder={ts('fields.state')} className={inputCls} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Input {...register('shippingAddress.zip')} placeholder={ts('fields.zip')} className={inputCls} />
                                <Input {...register('shippingAddress.country')} placeholder={ts('fields.country')} className={inputCls} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ordered Items */}
            <div className={sectionCls}>
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/5 rounded-xl"><Package className="w-4 h-4 text-primary" /></div>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">{ts('sections.orderedItems')}</h2>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1, listPrice: 0, discount: 0, tax: 0, amount: 0, total: 0, description: '' })}
                        className="text-xs font-bold border-accent/20 text-accent hover:bg-accent/5 rounded-xl">
                        <Plus className="w-3 h-3 mr-1.5" /> {t('addItem')}
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="py-3 pl-2 text-left text-xs font-black text-slate-400 uppercase tracking-widest w-8">#</th>
                                <th className="py-3 px-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{ti('product')}</th>
                                <th className="py-3 px-3 text-right text-xs font-black text-slate-400 uppercase tracking-widest w-20">{ti('qty')}</th>
                                <th className="py-3 px-3 text-right text-xs font-black text-slate-400 uppercase tracking-widest w-28">{ts('fields.unitPrice') || ti('unitPrice')}</th>
                                <th className="py-3 px-3 text-right text-xs font-black text-slate-400 uppercase tracking-widest w-28">{ti('discount')}</th>
                                <th className="py-3 px-3 text-right text-xs font-black text-slate-400 uppercase tracking-widest w-20">{ts('fields.taxPercent') || ti('tax')}</th>
                                <th className="py-3 px-3 text-right text-xs font-black text-slate-400 uppercase tracking-widest w-28">{ti('total')}</th>
                                <th className="py-3 px-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => (
                                <tr key={field.id} className="border-b border-slate-50">
                                    <td className="py-3 pl-2 text-xs font-bold text-slate-400">{index + 1}</td>
                                    <td className="py-3 px-3">
                                        <Controller name={`lineItems.${index}.productId`} control={control} render={({ field: f }) => (
                                            <EntityAutocomplete
                                                endpoint="/api/products"
                                                placeholder={ti('selectProduct')}
                                                value={f.value || ''}
                                                onChange={(v) => { f.onChange(v); handleProductChange(index, v); }}
                                            />
                                        )} />
                                        {errors.lineItems?.[index]?.productId && (
                                            <p className="text-[10px] text-red-500 mt-1 font-bold">
                                                {ts(`errors.${errors.lineItems[index]?.productId?.message}`)}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-3 px-3">
                                        <Input type="number" min="1" {...register(`lineItems.${index}.quantity`, { onChange: () => calculateLineItemAmounts(index) })}
                                            className="h-9 border-slate-200 rounded-xl text-xs font-bold text-right w-full" />
                                    </td>
                                    <td className="py-3 px-3">
                                        <Input type="number" step="0.01" {...register(`lineItems.${index}.listPrice`, { onChange: () => calculateLineItemAmounts(index) })}
                                            className="h-9 border-slate-200 rounded-xl text-xs font-bold text-right w-full" />
                                    </td>
                                    <td className="py-3 px-3">
                                        <Input type="number" step="0.01" {...register(`lineItems.${index}.discount`, { onChange: () => calculateLineItemAmounts(index) })}
                                            className="h-9 border-slate-200 rounded-xl text-xs font-bold text-right w-full" />
                                    </td>
                                    <td className="py-3 px-3">
                                        <Input type="number" step="0.1" {...register(`lineItems.${index}.tax`, { onChange: () => calculateLineItemAmounts(index) })}
                                            className="h-9 border-slate-200 rounded-xl text-xs font-bold text-right w-full" />
                                    </td>
                                    <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">
                                        {currencySymbol} {(watch(`lineItems.${index}.total`) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3 px-2">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}
                                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {fields.length === 0 && (
                        <div className="py-12 text-center text-slate-400 font-medium text-sm">
                            {ts('placeholders.noItemsAdded')}
                        </div>
                    )}
                </div>

                {/* Total in Words (Algerian Requirement) */}
                {watch('grandTotal') > 0 && org?.currency === 'DZD' && (
                    <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{ts('fields.montantLettres')}</span>
                        <p className="text-sm font-bold text-slate-700 italic">
                            &ldquo;{ti('legal.amountInWordsPrefix', { type: ts('title').toLowerCase() })} {numberToFrenchWords(watch('grandTotal'))} {ti('legal.amountInWordsSuffix')}&rdquo;
                        </p>
                    </div>
                )}

                {/* Totals */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <div className="w-full max-w-sm space-y-3">
                        <div className="flex justify-between text-sm font-bold text-slate-500">
                            <span>{ts('fields.subTotal') || ti('subTotal')}</span><span>{currencySymbol} {(watch('subTotal') || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-rose-500">
                            <span>{ts('fields.discount') || ti('discount')}</span><span>- {currencySymbol} {(watch('discount') || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-slate-500">
                            <span>{ts('fields.tax') || ti('tax')}</span><span>{currencySymbol} {(watch('tax') || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-slate-600">
                            <span>{t('adjustment')}</span>
                            <Input type="number" step="0.01" {...register('adjustment')} className="h-8 w-28 text-right text-sm font-bold border-slate-200 rounded-xl" />
                        </div>
                        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex justify-between items-center mt-4">
                            <span className="text-sm font-black text-slate-800 uppercase tracking-widest">{ts('fields.grandTotal') || ti('total')}</span>
                            <span className="text-xl font-black text-primary">{currencySymbol} {(watch('grandTotal') || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms & Notes */}
            <div className={sectionCls}>
                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">{ts('sections.termsNotes')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <Label className={labelCls}>{ti('termsAndConditions')}</Label>
                        <Textarea {...register('termsAndConditions')} rows={5} placeholder={ts('placeholders.enterTerms')}
                            className="border-slate-200 rounded-xl text-sm font-medium resize-none" />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={labelCls}>{ti('description')}</Label>
                        <Textarea {...register('description')} rows={5} placeholder={ts('placeholders.internalNotes')}
                            className="border-slate-200 rounded-xl text-sm font-medium resize-none" />
                    </div>
                </div>
            </div>

            {/* Hidden Print Document */}
            <PrintDocument
                data={watch()}
                org={org}
                type={ts('title')}
                currencySymbol={currencySymbol}
            />
        </form>
    );
}
