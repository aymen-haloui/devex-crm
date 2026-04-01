'use client';

import React, { useState, useEffect } from 'react';
import EntityAutocomplete from '@/components/ui/EntityAutocomplete';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    FileText,
    User,
    Building,
    Briefcase,
    MapPin,
    Plus,
    Trash2,
    DollarSign,
    Percent,
    Calculator,
    Calendar as CalendarIcon,
    Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslations } from 'next-intl';

const quoteSchema = z.object({
    subject: z.string().min(1, 'Subject is required'),
    stage: z.string().min(1, 'Stage is required'),
    validUntil: z.date().optional().nullable(),
    carrier: z.string().optional(),
    team: z.string().optional(),
    ownerId: z.string().min(1, 'Owner is required'),
    accountId: z.string().optional().nullable(),
    contactId: z.string().optional().nullable(),
    dealId: z.string().optional().nullable(),

    billingAddress: z.object({
        country: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        coordinates: z.string().optional()
    }).optional(),

    shippingAddress: z.object({
        country: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        coordinates: z.string().optional()
    }).optional(),

    termsAndConditions: z.string().optional(),
    description: z.string().optional(),

    lineItems: z.array(z.object({
        productId: z.string().min(1, 'Product selection is required'),
        productName: z.string().optional(), // Used for display only
        quantity: z.number().min(1, 'Minimum 1'),
        listPrice: z.number().min(0),
        discount: z.number().min(0),
        tax: z.number().min(0),
        amount: z.number(), // qty * listPrice
        total: z.number(),  // amount - discount + tax
        description: z.string().optional(),
    })).min(1, 'At least one item is required'),

    subTotal: z.number(),
    discount: z.number(),
    tax: z.number(),
    adjustment: z.number(),
    grandTotal: z.number()
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function QuoteForm({ initialData, onSubmit, onCancel, loading }: QuoteFormProps) {
    const t = useTranslations('inventory.quotes');
    const tCommon = useTranslations('common');

    const QUOTE_STAGES = [
        { value: 'Draft', label: t('stages.draft') },
        { value: 'Negotiation', label: t('stages.negotiation') },
        { value: 'Delivered', label: t('stages.delivered') },
        { value: 'On Hold', label: t('stages.onHold') },
        { value: 'Confirmed', label: t('stages.confirmed') },
        { value: 'Closed Won', label: t('stages.closedWon') },
        { value: 'Closed Lost', label: t('stages.closedLost') },
    ];
    const [users, setUsers] = useState<any[]>([]);
    const [deals, setDeals] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    const defaultValues: QuoteFormValues = {
        subject: initialData?.subject || '',
        stage: initialData?.stage || 'Draft',
        validUntil: initialData?.validUntil ? new Date(initialData.validUntil) : null,
        carrier: initialData?.carrier || '',
        team: initialData?.team || '',
        ownerId: initialData?.ownerId || '',
        accountId: initialData?.accountId || null,
        contactId: initialData?.contactId || null,
        dealId: initialData?.dealId || null,

        billingAddress: initialData?.billingAddress || { country: '', street: '', city: '', state: '', zip: '', coordinates: '' },
        shippingAddress: initialData?.shippingAddress || { country: '', street: '', city: '', state: '', zip: '', coordinates: '' },

        termsAndConditions: initialData?.termsAndConditions || '',
        description: initialData?.description || '',

        lineItems: initialData?.lineItems?.map((li: any) => ({
            productId: li.productId,
            productName: li.product?.name || 'Unknown Product',
            quantity: li.quantity,
            listPrice: Number(li.listPrice),
            discount: Number(li.discount),
            tax: Number(li.tax),
            amount: Number(li.amount),
            total: Number(li.total),
            description: li.description || ''
        })) || [{
            productId: '', productName: '', quantity: 1, listPrice: 0, discount: 0, tax: 0, amount: 0, total: 0, description: ''
        }],

        subTotal: initialData?.subTotal ? Number(initialData.subTotal) : 0,
        discount: initialData?.discount ? Number(initialData.discount) : 0,
        tax: initialData?.tax ? Number(initialData.tax) : 0,
        adjustment: initialData?.adjustment ? Number(initialData.adjustment) : 0,
        grandTotal: initialData?.grandTotal ? Number(initialData.grandTotal) : 0,
    };

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<QuoteFormValues>({
        resolver: zodResolver(quoteSchema),
        defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "lineItems",
    });

    // Watch line items and adjustment for live calculation
    const watchedLineItems = watch("lineItems");
    const watchedAdjustment = watch("adjustment");
    const billingAddress = watch("billingAddress");

    useEffect(() => {
        const fetchRelations = async () => {
            try {
                const [usersRes, dealsRes, productsRes] = await Promise.all([
                    fetch('/api/users'),
                    fetch('/api/deals'),
                    fetch('/api/products'),
                ]);

                const usersData = await usersRes.json();
                const dealsData = await dealsRes.json();
                const productsData = await productsRes.json();

                if (usersData.success) setUsers(usersData.data);
                if (dealsData.success) setDeals(dealsData.data);
                if (productsData.success) setProducts(productsData.data);

                if (!initialData && usersData.data.length > 0) {
                    setValue('ownerId', usersData.data[0].id);
                }
            } catch (err) {
                console.error('Failed to load relations', err);
            }
        };
        fetchRelations();
    }, []);

    // Recalculate Totals whenever line items or adjustment change
    useEffect(() => {
        let subTotal = 0;
        let totalTax = 0;
        let totalDiscount = 0;

        const computedItems = watchedLineItems.map(item => {
            const amount = (item.quantity || 0) * (item.listPrice || 0);
            const taxAmt = (amount * (item.tax || 0)) / 100; // Assuming tax is a percentage
            const discountAmt = item.discount || 0; // Assuming flat discount amount here or percentage based on needs

            const itemTotal = amount + taxAmt - discountAmt;

            subTotal += amount;
            totalTax += taxAmt;
            totalDiscount += discountAmt;

            return { ...item, amount, total: itemTotal };
        });

        const grandTotal = subTotal + totalTax - totalDiscount + (Number(watchedAdjustment) || 0);

        // Update form values silently without triggering re-render loops
        setValue('subTotal', subTotal);
        setValue('tax', totalTax);
        setValue('discount', totalDiscount);
        setValue('grandTotal', grandTotal);

    }, [JSON.stringify(watchedLineItems), watchedAdjustment, setValue]);

    const copyBillingToShipping = () => {
        if (billingAddress) {
            setValue('shippingAddress', billingAddress, { shouldValidate: true });
        }
    };

    const handleProductSelect = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            setValue(`lineItems.${index}.productId`, product.id);
            setValue(`lineItems.${index}.productName`, product.name);
            setValue(`lineItems.${index}.listPrice`, Number(product.unitPrice));
            // Provide an empty description by default
            if (!watchedLineItems[index].description) {
                setValue(`lineItems.${index}.description`, product.description || '');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-24">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            {initialData ? t('editQuote') : t('createQuote')}
                        </h1>
                        <p className="text-sm font-bold text-slate-400">{t('sections.quoteInfo')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" type="button" onClick={onCancel} className="font-bold text-slate-500 rounded-xl">
                        {tCommon('cancel')}
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90 text-white font-bold px-8 shadow-lg shadow-accent/20 rounded-xl">
                        {loading ? tCommon('saving') : initialData ? t('saveChanges') : t('createQuote')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Main Information Column */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Quote Information Card */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-8">
                        <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                            <div className="p-2 bg-primary/5 rounded-xl">
                                <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.quoteInfo')}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2 lg:col-span-2">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">{t('fields.subject')} <span className="text-rose-500">*</span></label>
                                <Input {...register('subject')} className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl font-bold" placeholder={t('placeholders.subject')} />
                                {errors.subject && <p className="text-xs font-bold text-rose-500">{errors.subject.message as string}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">{t('fields.stage')} <span className="text-rose-500">*</span></label>
                                <Controller
                                    name="stage"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl font-bold">
                                                <SelectValue placeholder={t('placeholders.selectStage')} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                {QUOTE_STAGES.map(s => (
                                                    <SelectItem key={s.value} value={s.value} className="font-bold">{s.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.stage && <p className="text-xs font-bold text-rose-500">{errors.stage.message as string}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">{t('fields.validUntil')}</label>
                                <Controller
                                    name="validUntil"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full h-12 justify-start text-left font-bold rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white",
                                                        !field.value && "text-slate-400"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "PPP") : t('placeholders.pickDate')}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 rounded-2xl border-slate-100 shadow-xl" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value || undefined}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                    className="font-bold"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">{t('fields.deal')}</label>
                                <Controller
                                    name="dealId"
                                    control={control}
                                    render={({ field }) => (
                                        <EntityAutocomplete
                                            endpoint="/api/deals"
                                            placeholder={t('placeholders.searchDeals')}
                                            value={field.value || ''}
                                            onChange={(id) => field.onChange(id || null)}
                                        />
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">{t('fields.team')}</label>
                                <Input {...register('team')} className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl font-bold" placeholder={t('placeholders.team')} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">{t('fields.carrier')}</label>
                                <Input {...register('carrier')} className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl font-bold" placeholder={t('placeholders.carrier')} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">{t('fields.owner')} <span className="text-rose-500">*</span></label>
                                <Controller
                                    name="ownerId"
                                    control={control}
                                    render={({ field }) => (
                                        <EntityAutocomplete
                                            endpoint="/api/users"
                                            placeholder={t('placeholders.searchUsers')}
                                            value={field.value || ''}
                                            onChange={(id) => field.onChange(id || null)}
                                        />
                                    )}
                                />
                                {errors.ownerId && <p className="text-xs font-bold text-rose-500">{errors.ownerId.message as string}</p>}
                            </div>

                        </div>
                    </div>

                    {/* Quoted Items Complex Card */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 pb-6 border-b border-slate-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-emerald-50 rounded-xl">
                                        <DollarSign className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.quotedItems')}</h3>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => append({ productId: '', productName: '', quantity: 1, listPrice: 0, discount: 0, tax: 0, amount: 0, total: 0, description: '' })}
                                    className="h-10 rounded-xl font-bold text-accent border-accent/20 hover:bg-accent/5"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> {t('placeholders.addRow')}
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto w-full">
                            <Table className="min-w-[900px]">
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-slate-100 hover:bg-transparent">
                                        <TableHead className="w-[50px] text-center font-black text-slate-400 uppercase text-[10px] tracking-widest">No.</TableHead>
                                        <TableHead className="w-[250px] font-black text-slate-400 uppercase text-[10px] tracking-widest">{t('fields.productDetails')}</TableHead>
                                        <TableHead className="w-[100px] text-right font-black text-slate-400 uppercase text-[10px] tracking-widest">{t('fields.quantity')}</TableHead>
                                        <TableHead className="w-[120px] text-right font-black text-slate-400 uppercase text-[10px] tracking-widest">{t('fields.listPrice')}</TableHead>
                                        <TableHead className="w-[120px] text-right font-black text-slate-400 uppercase text-[10px] tracking-widest">{t('fields.amount')}</TableHead>
                                        <TableHead className="w-[100px] text-right font-black text-slate-400 uppercase text-[10px] tracking-widest">{t('fields.discount')}</TableHead>
                                        <TableHead className="w-[100px] text-right font-black text-slate-400 uppercase text-[10px] tracking-widest">{t('fields.taxPercent')}</TableHead>
                                        <TableHead className="w-[120px] text-right font-black text-slate-400 uppercase text-[10px] tracking-widest pr-8">{t('fields.total')}</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id} className="border-slate-100 group">
                                            <TableCell className="text-center font-bold text-slate-400 text-xs">{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <Controller
                                                        name={`lineItems.${index}.productId`}
                                                        control={control}
                                                        render={({ field: selectField }) => (
                                                            <Select
                                                                value={selectField.value}
                                                                onValueChange={(val) => handleProductSelect(index, val)}
                                                            >
                                                                <SelectTrigger className="h-9 bg-transparent border-transparent hover:bg-slate-50 focus:bg-white focus:border-indigo-200 rounded-lg font-bold text-xs p-2">
                                                                    <SelectValue placeholder={t('placeholders.selectProduct')} />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-[300px]">
                                                                    {products.map(p => (
                                                                        <SelectItem key={p.id} value={p.id} className="font-bold text-xs">
                                                                            {p.name} <span className="text-slate-400 font-medium">({p.sku})</span>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                    {errors.lineItems?.[index]?.productId && (
                                                        <p className="text-[10px] font-bold text-rose-500 pl-2">{errors.lineItems[index].productId?.message}</p>
                                                    )}
                                                    <Textarea
                                                        {...register(`lineItems.${index}.description`)}
                                                        placeholder={t('placeholders.lineItemDescription')}
                                                        className="h-14 min-h-[56px] text-xs resize-none bg-transparent border-transparent hover:bg-slate-50 focus:bg-white rounded-lg p-2"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                                                    className="h-9 text-right font-bold text-xs bg-transparent border-transparent hover:bg-slate-50 focus:bg-white rounded-lg p-2"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="relative">
                                                    <DollarSign className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <Input
                                                        type="number"
                                                        {...register(`lineItems.${index}.listPrice`, { valueAsNumber: true })}
                                                        className="h-9 text-right pl-6 font-bold text-xs bg-transparent border-transparent hover:bg-slate-50 focus:bg-white rounded-lg p-2"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-black text-slate-500 text-xs">
                                                <div className="flex items-center justify-end gap-1">
                                                    <DollarSign className="w-3 h-3" />
                                                    {(watchedLineItems[index]?.quantity * watchedLineItems[index]?.listPrice) || 0}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="relative">
                                                    <DollarSign className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <Input
                                                        type="number"
                                                        {...register(`lineItems.${index}.discount`, { valueAsNumber: true })}
                                                        className="h-9 text-right pl-6 font-bold text-xs text-rose-600 bg-transparent border-transparent hover:bg-slate-50 focus:bg-white rounded-lg p-2"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        {...register(`lineItems.${index}.tax`, { valueAsNumber: true })}
                                                        className="h-9 text-right font-bold text-xs bg-transparent border-transparent hover:bg-slate-50 focus:bg-white rounded-lg p-2"
                                                    />
                                                    <Percent className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8 font-black text-slate-900 text-sm">
                                                <div className="flex items-center justify-end gap-1">
                                                    <DollarSign className="w-3 h-3" />
                                                    {((watchedLineItems[index]?.amount || 0) + ((watchedLineItems[index]?.amount || 0) * (watchedLineItems[index]?.tax || 0) / 100) - (watchedLineItems[index]?.discount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    variant="ghost"
                                                    className="w-8 h-8 p-0 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Totals Section */}
                        <div className="bg-slate-50/50 p-8 border-t border-slate-100 flex flex-col items-end gap-4">
                            <div className="w-[300px] space-y-3">
                                <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                                    <span>{t('fields.subTotal')}</span>
                                    <span>${watch('subTotal')?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-rose-500">
                                    <span>{t('fields.discount')}</span>
                                    <span>- ${watch('discount')?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                                    <span>{t('fields.tax')}</span>
                                    <span>${watch('tax')?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                                    <span>{t('fields.adjustment')}</span>
                                    <div className="w-24 relative">
                                        <DollarSign className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            type="number"
                                            {...register('adjustment', { valueAsNumber: true })}
                                            className="h-8 text-right pl-6 font-bold text-xs rounded-lg"
                                        />
                                    </div>
                                </div>
                                <Separator className="bg-slate-200" />
                                <div className="flex justify-between items-center text-lg font-black text-primary">
                                    <span>{t('fields.grandTotal')}</span>
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        {watch('grandTotal')?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar Information Column */}
                <div className="space-y-8">

                    {/* Account & Contact Sidebar */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                            <div className="p-2 bg-amber-50 rounded-xl">
                                <User className="w-4 h-4 text-amber-500" />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.relations')}</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">{t('fields.account')}</label>
                                <Controller
                                    name="accountId"
                                    control={control}
                                    render={({ field }) => (
                                        <EntityAutocomplete
                                            endpoint="/api/accounts"
                                            placeholder={t('placeholders.searchAccounts')}
                                            value={field.value || ''}
                                            onChange={(id) => field.onChange(id || null)}
                                        />
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">{t('fields.contact')}</label>
                                <Controller
                                    name="contactId"
                                    control={control}
                                    render={({ field }) => (
                                        <EntityAutocomplete
                                            endpoint="/api/contacts"
                                            placeholder={t('placeholders.searchContacts')}
                                            value={field.value || ''}
                                            onChange={(id) => field.onChange(id || null)}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Information Card */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-8">
                        <div className="flex flex-col gap-4 border-b border-slate-50 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-rose-50 rounded-xl">
                                        <MapPin className="w-4 h-4 text-rose-500" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.addresses')}</h3>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={copyBillingToShipping} className="text-[10px] font-bold h-8 rounded-lg uppercase tracking-widest text-slate-500 border-slate-200">
                                    {t('placeholders.copyBilling')}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('fields.billingAddress')}</h4>
                                <Input {...register('billingAddress.street')} className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl font-bold" placeholder={t('fields.street')} />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input {...register('billingAddress.city')} className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl font-bold" placeholder={t('fields.city')} />
                                    <Input {...register('billingAddress.state')} className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl font-bold" placeholder={t('fields.state')} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input {...register('billingAddress.zip')} className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl font-bold" placeholder={t('fields.zip')} />
                                    <Input {...register('billingAddress.country')} className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl font-bold" placeholder={t('fields.country')} />
                                </div>
                            </div>

                            <Separator className="bg-slate-100" />

                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('fields.shippingAddress')}</h4>
                                <Input {...register('shippingAddress.street')} className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl font-bold" placeholder={t('fields.street')} />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input {...register('shippingAddress.city')} className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl font-bold" placeholder={t('fields.city')} />
                                    <Input {...register('shippingAddress.state')} className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl font-bold" placeholder={t('fields.state')} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input {...register('shippingAddress.zip')} className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl font-bold" placeholder={t('fields.zip')} />
                                    <Input {...register('shippingAddress.country')} className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl font-bold" placeholder={t('fields.country')} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Terms Sidebar */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                            <div className="p-2 bg-slate-100 rounded-xl">
                                <FileText className="w-4 h-4 text-slate-500" />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.termsNotes')}</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">{t('fields.terms')}</label>
                                <Textarea
                                    {...register('termsAndConditions')}
                                    className="min-h-[100px] bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl font-bold resize-none"
                                    placeholder={t('placeholders.enterTerms')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">{t('fields.internalDescription')}</label>
                                <Textarea
                                    {...register('description')}
                                    className="min-h-[100px] bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl font-bold resize-none"
                                    placeholder={t('placeholders.internalNotes')}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </form>
    );
}
