import React, { useState, useEffect } from 'react';
import EntityAutocomplete from '@/components/ui/EntityAutocomplete';
import { useTranslations } from 'next-intl';
import {
    Package,
    Truck,
    Factory,
    Tag,
    Calendar,
    DollarSign,
    Percent,
    Hash,
    FileText,
    User,
    CheckCircle2,
    Save,
    X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/types';

interface ProductFormProps {
    initialData?: Partial<Product>;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function ProductForm({ initialData, onSubmit, onCancel, loading }: ProductFormProps) {
    const t = useTranslations('inventory.products');
    const tCommon = useTranslations('common');
    const [form, setForm] = useState({
        name: initialData?.name || '',
        sku: initialData?.sku || '',
        productCode: initialData?.productCode || '',
        vendorName: initialData?.vendorName || '',
        manufacturer: initialData?.manufacturer || '',
        productCategory: initialData?.productCategory || '',
        salesStartDate: initialData?.salesStartDate ? new Date(initialData.salesStartDate).toISOString().split('T')[0] : '',
        salesEndDate: initialData?.salesEndDate ? new Date(initialData.salesEndDate).toISOString().split('T')[0] : '',
        supportStartDate: initialData?.supportStartDate ? new Date(initialData.supportStartDate).toISOString().split('T')[0] : '',
        supportEndDate: initialData?.supportEndDate ? new Date(initialData.supportEndDate).toISOString().split('T')[0] : '',
        unitPrice: initialData?.unitPrice || 0,
        commissionRate: initialData?.commissionRate || 0,
        tax: initialData?.tax || '',
        taxable: initialData?.taxable ?? true,
        usageUnit: initialData?.usageUnit || 'Box',
        qtyInStock: initialData?.qtyInStock || 0,
        reorderLevel: initialData?.reorderLevel || 0,
        handlerId: initialData?.handlerId || '',
        qtyInDemand: initialData?.qtyInDemand || 0,
        description: initialData?.description || '',
    });

    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users');
                const data = await res.json();
                if (data.success) {
                    setUsers(data.data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    const handleChange = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-12">
            {/* Action Bar */}
            <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md py-4 z-10 border-b mb-6">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        {initialData?.id ? t('editProduct') : t('createProduct')}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Inventory Operations • Stock Unit</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onCancel} className="font-bold rounded-xl text-slate-500">
                        {tCommon('cancel')}
                    </Button>
                    <Button
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 rounded-xl shadow-lg shadow-indigo-500/20 gap-2"
                    >
                        <Save className="w-4 h-4" /> {loading ? tCommon('saving') : (initialData?.id ? tCommon('save') : t('createProduct'))}
                    </Button>
                </div>
            </div>

            {/* Product Information */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                        <Package className="w-4 h-4 text-indigo-500" />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.productInfo')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-slate-50/30 p-8 rounded-3xl border border-slate-100">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">{tCommon('fields.name')} <span className="text-rose-500">*</span></label>
                        <Input
                            required
                            className="h-11 rounded-2xl border-slate-200 bg-white font-bold focus:ring-2 focus:ring-indigo-500/10"
                            placeholder={t('placeholders.productName')}
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">{tCommon('fields.sku')} <span className="text-rose-500">*</span></label>
                        <Input
                            required
                            className="h-11 rounded-2xl border-slate-200 bg-white font-bold"
                            placeholder={t('placeholders.sku')}
                            value={form.sku}
                            onChange={(e) => handleChange('sku', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tCommon('fields.productCode')}</label>
                        <Input
                            className="h-11 rounded-2xl border-slate-200 bg-white font-bold"
                            placeholder={t('placeholders.productCode')}
                            value={form.productCode}
                            onChange={(e) => handleChange('productCode', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tCommon('fields.vendor')}</label>
                        <div className="relative group">
                            <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                className="h-11 pl-11 rounded-2xl border-slate-200 bg-white font-bold"
                                placeholder={t('placeholders.vendorName')}
                                value={form.vendorName}
                                onChange={(e) => handleChange('vendorName', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tCommon('fields.manufacturer')}</label>
                        <div className="relative group">
                            <Factory className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                className="h-11 pl-11 rounded-2xl border-slate-200 bg-white font-bold"
                                placeholder={t('placeholders.manufacturer')}
                                value={form.manufacturer}
                                onChange={(e) => handleChange('manufacturer', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fields.category')}</label>
                        <Select value={form.productCategory} onValueChange={(v: string) => handleChange('productCategory', v)}>
                            <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white font-bold">
                                <SelectValue placeholder={t('placeholders.category')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                <SelectItem value="software">{t('categories.software')}</SelectItem>
                                <SelectItem value="hardware">{t('categories.hardware')}</SelectItem>
                                <SelectItem value="service">{t('categories.service')}</SelectItem>
                                <SelectItem value="subscription">{t('categories.subscription')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">{t('fields.salesStartDate')}</label>
                        <Input
                            type="date"
                            className="h-11 rounded-2xl border-slate-200 bg-white font-bold"
                            value={form.salesStartDate}
                            onChange={(e) => handleChange('salesStartDate', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fields.salesEndDate')}</label>
                        <Input
                            type="date"
                            className="h-11 rounded-2xl border-slate-200 bg-white font-bold"
                            value={form.salesEndDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('salesEndDate', e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* Price Information */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-emerald-50 rounded-xl">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.priceInfo')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-slate-50/30 p-8 rounded-3xl border border-slate-100">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">{t('fields.unitPrice')} <span className="text-rose-500">*</span></label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-emerald-500">$</span>
                            <Input
                                type="number"
                                required
                                className="h-11 pl-8 rounded-2xl border-slate-200 bg-white font-bold"
                                value={form.unitPrice}
                                onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fields.commissionRate')}</label>
                        <div className="relative group">
                            <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                            <Input
                                type="number"
                                step="0.01"
                                className="h-11 rounded-2xl border-slate-200 bg-white font-bold"
                                value={form.commissionRate}
                                onChange={(e) => handleChange('commissionRate', parseFloat(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fields.tax')}</label>
                        <Input
                            className="h-11 rounded-2xl border-slate-200 bg-white font-bold placeholder:italic"
                            placeholder={t('placeholders.tax')}
                            value={form.tax}
                            onChange={(e) => handleChange('tax', e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-8">
                        <Checkbox
                            id="taxable"
                            checked={form.taxable}
                            onCheckedChange={(v: boolean) => handleChange('taxable', !!v)}
                            className="rounded-lg border-emerald-500/50 data-[state=checked]:bg-emerald-500"
                        />
                        <label htmlFor="taxable" className="text-sm font-bold text-slate-700 cursor-pointer">{t('fields.taxable')}</label>
                    </div>
                </div>
            </section>

            {/* Stock Information */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-50 rounded-xl">
                        <Hash className="w-4 h-4 text-blue-500" />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.stockInfo')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-slate-50/30 p-8 rounded-3xl border border-slate-100">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fields.usageUnit')}</label>
                        <Select value={form.usageUnit} onValueChange={(v: string) => handleChange('usageUnit', v)}>
                            <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                <SelectItem value="Box">{t('usageUnits.box')}</SelectItem>
                                <SelectItem value="Carton">{t('usageUnits.carton')}</SelectItem>
                                <SelectItem value="Unit">{t('usageUnits.unit')}</SelectItem>
                                <SelectItem value="Dozen">{t('usageUnits.dozen')}</SelectItem>
                                <SelectItem value="Pack">{t('usageUnits.pack')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fields.qtyStock')}</label>
                        <Input
                            type="number"
                            className="h-11 rounded-2xl border-slate-200 bg-white font-bold text-blue-600"
                            value={form.qtyInStock}
                            onChange={(e) => handleChange('qtyInStock', parseInt(e.target.value))}
                        />
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fields.reorderLevel')}</label>
                        <Input
                            type="number"
                            className="h-11 rounded-2xl border-slate-200 bg-white font-bold text-rose-500"
                            value={form.reorderLevel}
                            onChange={(e) => handleChange('reorderLevel', parseInt(e.target.value))}
                        />
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fields.handler')}</label>
                        <EntityAutocomplete
                            endpoint="/api/users"
                            placeholder={t('placeholders.searchUsers')}
                            value={form.handlerId}
                            onChange={(id) => handleChange('handlerId', id || '')}
                        />
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fields.qtyDemand')}</label>
                        <Input
                            type="number"
                            className="h-11 rounded-2xl border-slate-200 bg-white font-bold"
                            value={form.qtyInDemand}
                            onChange={(e) => handleChange('qtyInDemand', parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </section>

            {/* Description */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-amber-50 rounded-xl">
                        <FileText className="w-4 h-4 text-amber-500" />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.descriptionInfo')}</h3>
                </div>

                <div className="bg-slate-50/30 p-8 rounded-3xl border border-slate-100">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tCommon('fields.description')}</label>
                        <Textarea
                            className="min-h-[120px] rounded-2xl border-slate-200 p-4 font-medium italic text-slate-600 focus:ring-indigo-500/10"
                            placeholder={t('placeholders.description')}
                            value={form.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
                        />
                    </div>
                </div>
            </section>
        </form>
    );
}
