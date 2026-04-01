'use client';

import React, { useState, useEffect } from 'react';
import EntityAutocomplete from '@/components/ui/EntityAutocomplete';
import {
    Book,
    Tag,
    FileText,
    User,
    CheckCircle2,
    Save,
    X,
    Plus,
    Trash2,
    DollarSign,
    Percent,
    Layout
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
import { PriceBook, PriceBookDiscountRule } from '@/types';
import { useTranslations } from 'next-intl';

interface PriceBookFormProps {
    initialData?: Partial<PriceBook>;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function PriceBookForm({ initialData, onSubmit, onCancel, loading }: PriceBookFormProps) {
    const t = useTranslations('inventory.priceBooks');
    const tCommon = useTranslations('common');
    const [form, setForm] = useState({
        name: initialData?.name || '',
        active: initialData?.active ?? true,
        pricingModel: initialData?.pricingModel || 'flat',
        description: initialData?.description || '',
        ownerId: initialData?.ownerId || '',
    });

    const [rules, setRules] = useState<Partial<PriceBookDiscountRule>[]>(
        initialData?.discountRules || [{ fromRange: 0, toRange: 0, discount: 0 }]
    );

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
        onSubmit({ ...form, discountRules: rules });
    };

    const handleChange = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const addRule = () => {
        setRules([...rules, { fromRange: 0, toRange: 0, discount: 0 }]);
    };

    const removeRule = (index: number) => {
        setRules(rules.filter((_, i) => i !== index));
    };

    const updateRule = (index: number, field: keyof PriceBookDiscountRule, value: number) => {
        const newRules = [...rules];
        newRules[index] = { ...newRules[index], [field]: value };
        setRules(newRules);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-12">
            {/* Action Bar */}
            <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md py-4 z-10 border-b mb-6">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        {initialData?.id ? t('editPriceBook') : t('createPriceBook')}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{tCommon('inventory')} • {t('sections.pricingDetails')}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" type="button" onClick={onCancel} className="font-bold rounded-xl text-slate-500">
                        {tCommon('cancel')}
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 rounded-xl shadow-lg shadow-indigo-500/20 gap-2"
                    >
                        <Save className="w-4 h-4" /> {loading ? tCommon('saving') : t('savePriceBook')}
                    </Button>
                </div>
            </div>

            {/* Basic Information */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                        <Book className="w-4 h-4 text-indigo-500" />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.priceBookInfo')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-slate-50/30 p-8 rounded-3xl border border-slate-100">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fields.name')} <span className="text-rose-500">*</span></label>
                        <Input
                            required
                            className="h-11 rounded-2xl border-slate-200 bg-white font-bold focus:ring-2 focus:ring-indigo-500/10"
                            placeholder={t('placeholders.name')}
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fields.owner')}</label>
                        <EntityAutocomplete
                            endpoint="/api/users"
                            placeholder={t('placeholders.searchUsers')}
                            value={form.ownerId}
                            onChange={(id) => handleChange('ownerId', id || '')}
                        />
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-emerald-500">{t('fields.pricingModel')}</label>
                        <Select value={form.pricingModel} onValueChange={(v) => handleChange('pricingModel', v)}>
                            <SelectTrigger className="h-11 rounded-2xl border-emerald-100 bg-emerald-50/30 font-bold text-emerald-700">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                <SelectItem value="flat">{t('models.flat')}</SelectItem>
                                <SelectItem value="differential">{t('models.differential')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2 pt-8">
                        <Checkbox
                            id="active"
                            checked={form.active}
                            onCheckedChange={(v) => handleChange('active', !!v)}
                            className="rounded-lg border-indigo-500/50 data-[state=checked]:bg-indigo-500"
                        />
                        <label htmlFor="active" className="text-sm font-bold text-slate-700 cursor-pointer">{t('fields.active')}</label>
                    </div>
                </div>
            </section>

            {/* Pricing Details - Discount Rules */}
            <section className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <Percent className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.pricingDetails')}</h3>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addRule}
                        className="rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 font-bold gap-2"
                    >
                        <Plus className="w-4 h-4" /> {tCommon('add')}
                    </Button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{t('fields.fromRange')}</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{t('fields.toRange')}</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{t('fields.discountPercent')}</th>
                                <th className="px-6 py-4 border-b border-slate-100"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {rules.map((rule, idx) => (
                                <tr key={idx} className="group hover:bg-slate-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <Input
                                            type="number"
                                            className="h-10 rounded-xl border-slate-100 bg-transparent font-bold w-32"
                                            value={rule.fromRange}
                                            onChange={(e) => updateRule(idx, 'fromRange', parseFloat(e.target.value))}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Input
                                            type="number"
                                            className="h-10 rounded-xl border-slate-100 bg-transparent font-bold w-32"
                                            value={rule.toRange}
                                            onChange={(e) => updateRule(idx, 'toRange', parseFloat(e.target.value))}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative w-32">
                                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <Input
                                                type="number"
                                                className="h-10 pr-10 rounded-xl border-slate-100 bg-transparent font-bold"
                                                value={rule.discount}
                                                onChange={(e) => updateRule(idx, 'discount', parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {rules.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeRule(idx)}
                                                className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fields.description')}</label>
                        <Textarea
                            className="min-h-[120px] rounded-2xl border-slate-200 p-4 font-medium italic text-slate-600 focus:ring-indigo-500/10"
                            placeholder={t('placeholders.description')}
                            value={form.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                    </div>
                </div>
            </section>
        </form>
    );
}
