'use client';

import React, { useState, useEffect } from 'react';
import EntityAutocomplete from '@/components/ui/EntityAutocomplete';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ShoppingCart, Building2, Calendar, MapPin, Save, X, Plus, Trash2,
    Calculator, DollarSign, Info, Tag, Package, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { PurchaseOrder, Product, Vendor } from '@/types';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { numberToFrenchWords } from '@/lib/currency-utils';
import { PrintDocument } from './PrintDocument';

const getLineItemSchema = (t: any) => z.object({
    id: z.string().optional(),
    productId: z.string().min(1, t('errors.productRequired')),
    quantity: z.number().min(1, t('errors.quantityMin')),
    listPrice: z.number().min(0),
    discount: z.number().min(0).default(0),
    tax: z.number().min(0).default(0),
    amount: z.number().default(0),
    total: z.number().default(0),
    description: z.string().optional(),
});

const getPoSchema = (t: any) => z.object({
    subject: z.string().min(1, t('errors.subjectRequired')),
    vendorId: z.string().min(1, t('errors.vendorRequired')),
    status: z.string().default('draft'),
    requisitionNumber: z.string().optional().nullable(),
    trackingNumber: z.string().optional().nullable(),
    carrier: z.string().optional().nullable(),
    salesOrderId: z.string().optional().nullable(),
    poDate: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),
    exciseDuty: z.string().optional().nullable(),
    salesCommission: z.coerce.number().optional().nullable(),
    contactId: z.string().optional().nullable(),
    ownerId: z.string().optional().nullable(),
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
    subTotal: z.number().default(0),
    discount: z.number().default(0),
    tax: z.number().default(0),
    adjustment: z.number().default(0),
    grandTotal: z.number().default(0),
    termsAndConditions: z.string().optional(),
    description: z.string().optional(),
    lineItems: z.array(getLineItemSchema(t)).min(1, t('errors.lineItemRequired')),
});

type FormValues = z.infer<ReturnType<typeof getPoSchema>>;

interface POFormProps {
    initialData?: Partial<PurchaseOrder>;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

export default function PurchaseOrderForm({ initialData, onSubmit, onCancel }: POFormProps) {
    const t = useTranslations('inventory.purchaseOrders');
    const tCommon = useTranslations('common');
    const tInventory = useTranslations('inventory.common');
    const [products, setProducts] = useState<Product[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [org, setOrg] = useState<any>(null);
    const [loadingResources, setLoadingResources] = useState(true);

    const form = useForm<FormValues>({
        resolver: zodResolver(getPoSchema(t)),
        defaultValues: {
            subject: initialData?.subject || '',
            vendorId: initialData?.vendorId || '',
            contactId: initialData?.contactId || '',
            ownerId: initialData?.ownerId || '',
            status: initialData?.status || 'draft',
            requisitionNumber: initialData?.requisitionNumber || '',
            trackingNumber: initialData?.trackingNumber || '',
            carrier: initialData?.carrier || '',
            salesOrderId: initialData?.salesOrderId || '',
            poDate: initialData?.poDate ? new Date(initialData.poDate).toISOString().split('T')[0] : '',
            dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
            exciseDuty: initialData?.exciseDuty || '',
            salesCommission: initialData?.salesCommission || 0,
            billingAddress: initialData?.billingAddress || { street: '', city: '', state: '', zip: '', country: '' },
            shippingAddress: initialData?.shippingAddress || { street: '', city: '', state: '', zip: '', country: '' },
            subTotal: Number(initialData?.subTotal) || 0,
            discount: Number(initialData?.discount) || 0,
            tax: Number(initialData?.tax) || 0,
            adjustment: Number(initialData?.adjustment) || 0,
            grandTotal: Number(initialData?.grandTotal) || 0,
            termsAndConditions: initialData?.termsAndConditions || '',
            description: initialData?.description || '',
            lineItems: initialData?.lineItems?.map(item => ({
                ...item,
                listPrice: Number(item.listPrice),
                discount: Number(item.discount),
                tax: Number(item.tax),
                amount: Number(item.amount),
                total: Number(item.total),
                description: item.description || '',
            })) || [{ productId: '', quantity: 1, listPrice: 0, discount: 0, tax: 0, amount: 0, total: 0, description: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "lineItems"
    });



    useEffect(() => {
        const fetchResources = async () => {
            try {
                const [pRes, vRes, uRes, cRes, oRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/inventory/vendors'),
                    fetch('/api/users'),
                    fetch('/api/contacts'),
                    fetch('/api/organizations/profile')
                ]);
                const [pData, vData, uData, cData, oData] = await Promise.all([
                    pRes.json(), vRes.json(), uRes.json(), cRes.json(), oRes.json()
                ]);
                if (pData.success) setProducts(pData.data);
                if (vData.success) setVendors(vData.data);
                if (uData.success) setUsers(uData.data);
                if (cData.success) setContacts(cData.data);
                if (oData.success) setOrg(oData.data);
            } catch (err) { console.error('Error fetching resources:', err); }
            finally { setLoadingResources(false); }
        };
        fetchResources();
    }, []);

    const calculateTotals = () => {
        const items = form.getValues('lineItems');
        let subTotal = 0;

        const updatedItems = items.map((item: any) => {
            const amount = item.quantity * item.listPrice;
            const discountVal = item.discount;
            const taxRate = item.tax;
            const afterDiscount = amount - discountVal;
            const total = afterDiscount + (afterDiscount * (taxRate / 100));
            subTotal += amount;
            return { ...item, amount, total };
        });

        const totalDiscount = updatedItems.reduce((acc: number, curr: any) => acc + curr.discount, 0);
        const totalTax = updatedItems.reduce((acc: number, curr: any) => acc + (curr.amount - curr.discount) * (curr.tax / 100), 0);
        const adjustment = form.getValues('adjustment') || 0;
        const grandTotal = subTotal - totalDiscount + totalTax + adjustment;

        form.setValue('subTotal', subTotal);
        form.setValue('discount', totalDiscount);
        form.setValue('tax', totalTax);
        form.setValue('grandTotal', grandTotal);
        form.setValue('lineItems', updatedItems);
    };

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            form.setValue(`lineItems.${index}.listPrice`, Number(product.unitPrice));
            form.setValue(`lineItems.${index}.description`, product.description || '');
            calculateTotals();
        }
    };

    const currencySymbol = org?.currency === 'DZD' ? 'د.ج' : (org?.currency === 'EUR' ? '€' : '$');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
                {/* Sticky Header */}
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-8 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 pt-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <ShoppingCart className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                {initialData ? `${t('editPO')}: ${initialData.orderNumber}` : t('newPO')}
                            </h1>
                            <p className="text-sm font-medium text-slate-500 italic">{tCommon('generateProfessional')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 no-print">
                        <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-5 rounded-xl font-bold border-slate-200">
                            <X className="w-4 h-4 mr-2" /> {tCommon('cancel')}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => window.print()} className="h-11 px-5 rounded-xl font-bold border-slate-200">
                            <ShoppingCart className="w-4 h-4 mr-2" /> {t('printPDF')}
                        </Button>
                        <Button type="submit" disabled={form.formState.isSubmitting} className="h-11 px-6 rounded-xl font-bold bg-accent hover:bg-accent/90 text-white shadow-sm">
                            <Save className="w-4 h-4 mr-2" /> {form.formState.isSubmitting ? tCommon('processing') : tCommon('saveRecord')}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Info */}
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-8">
                            <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                <div className="p-2 bg-primary/10 rounded-xl"><Info className="w-4 h-4 text-primary" /></div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.orderInfo')}</h3>
                                    {org && (
                                        <div className="flex gap-4 mt-2">
                                            {org.rcNumber && <span className="text-[9px] font-bold text-slate-400 uppercase">{tInventory('legal.rc')}: {org.rcNumber}</span>}
                                            {org.nifNumber && <span className="text-[9px] font-bold text-slate-400 uppercase">{tInventory('legal.nif')}: {org.nifNumber}</span>}
                                            {org.aiNumber && <span className="text-[9px] font-bold text-slate-400 uppercase">{tInventory('legal.ai')}: {org.aiNumber}</span>}
                                            {org.nisNumber && <span className="text-[9px] font-bold text-slate-400 uppercase">{tInventory('legal.nis')}: {org.nisNumber}</span>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                {/* Column 1 */}
                                <div className="space-y-6">
                                    <FormField control={form.control} name="subject" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.subject')} *</FormLabel>
                                            <FormControl><Input placeholder={t('placeholders.subject')} className="h-11 rounded-xl border-slate-200" {...field} /></FormControl><FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="vendorId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.vendorName')} *</FormLabel>
                                            <EntityAutocomplete
                                                endpoint="/api/vendors"
                                                placeholder={t('placeholders.searchVendors')}
                                                value={field.value || ''}
                                                onChange={(id) => field.onChange(id || null)}
                                            /><FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="requisitionNumber" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.requisitionNo')}</FormLabel>
                                            <FormControl><Input placeholder="REQ-000" className="h-11 rounded-xl border-slate-200" {...field} value={field.value || ''} /></FormControl><FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="trackingNumber" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.trackingNo')}</FormLabel>
                                            <FormControl><Input placeholder="TRK-000" className="h-11 rounded-xl border-slate-200" {...field} value={field.value || ''} /></FormControl><FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="contactId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.contactName')}</FormLabel>
                                            <EntityAutocomplete
                                                endpoint="/api/contacts"
                                                placeholder={t('placeholders.searchContacts')}
                                                value={field.value || ''}
                                                onChange={(id) => field.onChange(id || null)}
                                            /><FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                {/* Column 2 */}
                                <div className="space-y-6">
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.poNumber')}</FormLabel>
                                        <FormControl><Input value={initialData?.orderNumber || tCommon('autoGenerated')} disabled className="h-11 rounded-xl border-slate-100 bg-slate-50 font-bold text-slate-400" /></FormControl>
                                    </FormItem>
                                    <FormField control={form.control} name="poDate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.poDate')}</FormLabel>
                                            <FormControl><Input type="date" className="h-11 rounded-xl border-slate-200" {...field} value={field.value || ''} /></FormControl><FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="dueDate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.dueDate')}</FormLabel>
                                            <FormControl><Input type="date" className="h-11 rounded-xl border-slate-200" {...field} value={field.value || ''} /></FormControl><FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="carrier" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.carrier')}</FormLabel>
                                            <FormControl><Input placeholder="FedEx, UPS..." className="h-11 rounded-xl border-slate-200" {...field} value={field.value || ''} /></FormControl><FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="exciseDuty" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.exciseDuty')}</FormLabel>
                                            <FormControl><Input placeholder="0.00" className="h-11 rounded-xl border-slate-200" {...field} value={field.value || ''} /></FormControl><FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                {/* Column 3 */}
                                <div className="space-y-6">
                                    <FormField control={form.control} name="ownerId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.owner')}</FormLabel>
                                            <EntityAutocomplete
                                                endpoint="/api/users"
                                                placeholder={t('placeholders.searchUsers')}
                                                value={field.value || ''}
                                                onChange={(id) => field.onChange(id || null)}
                                            /><FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="salesCommission" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.salesCommission')}</FormLabel>
                                            <FormControl><Input type="number" step="0.01" className="h-11 rounded-xl border-slate-200" {...field} value={field.value || ''} /></FormControl><FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="status" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.status')}</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger className="h-11 rounded-xl border-slate-200"><SelectValue placeholder={t('placeholders.selectStatus')} /></SelectTrigger></FormControl>
                                                <SelectContent className="rounded-xl shadow-2xl">
                                                    <SelectItem value="draft">{t('statuses.draft')}</SelectItem>
                                                    <SelectItem value="ordered">{t('statuses.ordered')}</SelectItem>
                                                    <SelectItem value="received">{t('statuses.received')}</SelectItem>
                                                    <SelectItem value="cancelled">{t('statuses.cancelled')}</SelectItem>
                                                </SelectContent>
                                            </Select><FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="salesOrderId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.relatedSalesOrder')}</FormLabel>
                                            <FormControl><Input placeholder="SO-000" className="h-11 rounded-xl border-slate-200" {...field} value={field.value || ''} /></FormControl><FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-50">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-50 rounded-xl"><Package className="w-4 h-4 text-indigo-500" /></div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.orderedProducts')}</h3>
                                </div>
                                <Button type="button" onClick={() => append({ productId: '', quantity: 1, listPrice: 0, discount: 0, tax: 0, amount: 0, total: 0 })}
                                    variant="outline" className="h-9 px-4 rounded-xl font-bold border-accent/20 text-accent hover:bg-accent/5 transition-all">
                                    <Plus className="w-4 h-4 mr-2" /> {tCommon('addItem')}
                                </Button>
                            </div>

                            <div className="p-0 overflow-x-auto">
                                <table className="w-full min-w-[1000px]">
                                    <thead className="bg-slate-50/80">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest pl-10 w-[30%]">{tInventory('product')}</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-[10%]">{tInventory('qty')}</th>
                                            <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-[15%]">{tInventory('listPrice')}</th>
                                            <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-[10%]">{tInventory('tax')} (%)</th>
                                            <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-[15%]">{tInventory('discount')} ({currencySymbol})</th>
                                            <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest pl-6 pr-10 w-[15%]">{tInventory('total')}</th>
                                            <th className="px-6 py-4 text-center w-[50px]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {fields.map((field, index) => (
                                            <tr key={field.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-5 pl-10">
                                                    <FormField control={form.control} name={`lineItems.${index}.productId`} render={({ field }) => (
                                                        <Select onValueChange={(v) => { field.onChange(v); handleProductChange(index, v); }} value={field.value}>
                                                            <FormControl><SelectTrigger className="h-10 rounded-xl border-slate-100 bg-white font-bold"><SelectValue placeholder="Select product" /></SelectTrigger></FormControl>
                                                            <SelectContent className="rounded-xl shadow-2xl border-slate-50">
                                                                {products.map(p => <SelectItem key={p.id} value={p.id} className="font-bold py-2.5">{p.name}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    )} />
                                                </td>
                                                <td className="px-6 py-5">
                                                    <FormField control={form.control} name={`lineItems.${index}.quantity`} render={({ field }) => (
                                                        <FormControl><Input type="number" step="1" className="h-10 text-center rounded-xl border-slate-100 font-bold" {...field} onChange={e => { field.onChange(parseInt(e.target.value) || 0); calculateTotals(); }} /></FormControl>
                                                    )} />
                                                </td>
                                                <td className="px-6 py-5">
                                                    <FormField control={form.control} name={`lineItems.${index}.listPrice`} render={({ field }) => (
                                                        <FormControl><Input type="number" step="0.01" className="h-10 text-right rounded-xl border-slate-100 font-bold" {...field} onChange={e => { field.onChange(parseFloat(e.target.value) || 0); calculateTotals(); }} /></FormControl>
                                                    )} />
                                                </td>
                                                <td className="px-6 py-5">
                                                    <FormField control={form.control} name={`lineItems.${index}.tax`} render={({ field }) => (
                                                        <FormControl><Input type="number" className="h-10 text-right rounded-xl border-slate-100 font-bold" {...field} onChange={e => { field.onChange(parseFloat(e.target.value) || 0); calculateTotals(); }} /></FormControl>
                                                    )} />
                                                </td>
                                                <td className="px-6 py-5">
                                                    <FormField control={form.control} name={`lineItems.${index}.discount`} render={({ field }) => (
                                                        <FormControl><Input type="number" className="h-10 text-right rounded-xl border-slate-100 font-bold text-rose-600" {...field} onChange={e => { field.onChange(parseFloat(e.target.value) || 0); calculateTotals(); }} /></FormControl>
                                                    )} />
                                                </td>
                                                <td className="px-6 py-5 text-right pr-10">
                                                    <p className="text-sm font-black text-slate-800">{currencySymbol} {form.watch(`lineItems.${index}.total`).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                                </td>
                                                <td className="px-2 py-5 pr-6">
                                                    {fields.length > 1 && (
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => { remove(index); calculateTotals(); }} className="h-8 w-8 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Total in Words (Algerian Requirement) */}
                            {form.watch('grandTotal') > 0 && org?.currency === 'DZD' && (
                                <div className="mx-10 mb-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t('fields.montantLettres')}</span>
                                    <p className="text-sm font-bold text-slate-700 italic">
                                        &ldquo;{tInventory('legal.amountInWordsPrefix', { type: t('title').toLowerCase() })} {numberToFrenchWords(form.watch('grandTotal'))} {tInventory('legal.amountInWordsSuffix')}&rdquo;
                                    </p>
                                </div>
                            )}

                            {/* Totals Summary */}
                            <div className="bg-slate-50/50 p-10 flex flex-col items-end border-t border-slate-100">
                                <div className="w-full max-w-[360px] space-y-5">
                                    <div className="flex justify-between items-center text-sm font-bold text-slate-500 px-2"><span>{tInventory('subTotal')}</span><span className="text-slate-900">{currencySymbol} {form.watch('subTotal').toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between items-center text-sm font-bold text-slate-500 px-2"><span>{t('fields.taxRecovery')}</span><span className="text-slate-900">{currencySymbol} {form.watch('tax').toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between items-center text-sm font-bold text-rose-500 px-2"><span>{t('fields.globalDiscount')}</span><span>- {currencySymbol} {form.watch('discount').toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex items-center justify-between gap-4 px-2">
                                        <span className="text-sm font-bold text-slate-500">{tCommon('adjustment')}</span>
                                        <FormField control={form.control} name="adjustment" render={({ field }) => (
                                            <FormControl><Input type="number" step="0.01" className="h-9 w-32 border-slate-200 rounded-xl text-right font-black" {...field} onChange={e => { field.onChange(parseFloat(e.target.value) || 0); calculateTotals(); }} /></FormControl>
                                        )} />
                                    </div>
                                    <div className="h-px bg-slate-100 my-2" />
                                    <div className="flex justify-between items-center p-5 bg-primary rounded-2xl shadow-lg shadow-black/5 border border-white/10">
                                        <span className="text-sm font-black text-white/70 uppercase tracking-widest">{t('fields.totalAmount')}</span>
                                        <span className="text-2xl font-black text-white">{currencySymbol} {form.watch('grandTotal').toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms & Notes */}
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField control={form.control} name="termsAndConditions" render={({ field }) => (
                                    <FormItem><FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 border-l-2 border-indigo-400 ml-1 leading-none">{tInventory('termsAndConditions')}</FormLabel>
                                        <FormControl><Textarea placeholder={t('placeholders.enterTerms')} className="min-h-[120px] rounded-2xl border-slate-200 resize-none bg-slate-50/20 text-sm font-medium" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem><FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 border-l-2 border-slate-300 ml-1 leading-none">{tInventory('description')}</FormLabel>
                                        <FormControl><Textarea placeholder={t('placeholders.internalRemarks')} className="min-h-[120px] rounded-2xl border-slate-200 resize-none bg-slate-50/20 text-sm font-medium" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm space-y-8">
                            <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                <div className="p-2 bg-indigo-50 rounded-xl"><Tag className="w-4 h-4 text-indigo-500" /></div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.orderStatus')}</h3>
                            </div>

                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fields.status')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold bg-slate-50/50"><SelectValue placeholder={t('placeholders.selectStatus')} /></SelectTrigger></FormControl>
                                        <SelectContent className="rounded-xl shadow-2xl border-slate-50">
                                            <SelectItem value="draft" className="font-bold py-2.5">{t('statuses.draft')}</SelectItem>
                                            <SelectItem value="ordered" className="font-bold py-2.5 text-blue-600">{t('statuses.ordered')}</SelectItem>
                                            <SelectItem value="received" className="font-bold py-2.5 text-emerald-600">{t('statuses.received')}</SelectItem>
                                            <SelectItem value="cancelled" className="font-bold py-2.5 text-rose-600">{t('statuses.cancelled')}</SelectItem>
                                        </SelectContent>
                                    </Select><FormMessage />
                                </FormItem>
                            )} />

                            <div className="space-y-6 pt-4 border-t border-slate-50">
                                <FormField control={form.control} name="trackingNumber" render={({ field }) => (
                                    <FormItem><FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.trackingNo')}</FormLabel>
                                        <FormControl><Input placeholder={t('placeholders.trackingNo')} className="h-11 rounded-xl border-slate-200" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="carrier" render={({ field }) => (
                                    <FormItem><FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.carrier')}</FormLabel>
                                        <FormControl><Input placeholder={t('placeholders.carrier')} className="h-11 rounded-xl border-slate-200" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </div>

                        {/* Relations */}
                        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm space-y-8">
                            <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                <div className="p-2 bg-indigo-50 rounded-xl"><Briefcase className="w-4 h-4 text-indigo-500" /></div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{tCommon('relations')}</h3>
                            </div>
                            <FormField control={form.control} name="salesOrderId" render={({ field }) => (
                                <FormItem><FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('fields.relatedSalesOrder')}</FormLabel>
                                    <FormControl><Input placeholder={t('placeholders.relatedSO')} className="h-11 rounded-xl border-slate-200" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>

                        {/* Address Logic Toggle */}
                        <div className="bg-gradient-to-br from-primary to-slate-900 rounded-[3rem] p-8 text-white shadow-xl shadow-black/5">
                            <MapPin className="w-8 h-8 opacity-40 mb-4" />
                            <h4 className="text-lg font-black tracking-tight mb-2">{t('sections.shipmentDetails')}</h4>
                            <p className="text-xs font-medium text-blue-100 leading-relaxed mb-6 opacity-80">{tCommon('shipmentWarning')}</p>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors cursor-pointer" onClick={() => {
                                    // Quick Fill Logic if needed
                                }}>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{tCommon('shippingTarget')}</p>
                                    <p className="text-sm font-bold">{t('fields.standardWarehouse') || 'Standard Warehouse A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <PrintDocument
                data={form.watch()}
                org={org}
                type={t('title')}
                currencySymbol={currencySymbol}
            />
        </Form>
    );
}
