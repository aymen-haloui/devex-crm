'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import { useTranslations } from 'next-intl';

interface FilterCategory {
    id: string;
    label: string;
    items: { id: string; label: string; checked: boolean }[];
}

interface DataTableFiltersProps {
    entity: string;
    onApply?: (filters: any) => void;
    onReset?: () => void;
    fields: { id: string; label: string }[];
}

export default function DataTableFilters({ entity, onApply, onReset, fields }: DataTableFiltersProps) {
    const t = useTranslations('common');
    const [search, setSearch] = useState('');
    const [systemFilters, setSystemFilters] = useState([
        { id: 'touched', checked: false },
        { id: 'untouched', checked: false },
        { id: 'record_action', checked: false },
        { id: 'related_action', checked: false },
        { id: 'locked', checked: false },
        { id: 'latest_email', checked: false },
        { id: 'activities', checked: false },
        { id: 'campaigns', checked: false },
    ]);

    const getSystemLabel = (id: string) => {
        const labels: Record<string, string> = {
            touched: t('filters.touched_records'),
            untouched: t('filters.untouched_records'),
            record_action: t('filters.record_action'),
            related_action: t('filters.related_records_action'),
            locked: t('filters.locked'),
            latest_email: t('filters.latest_email_status'),
            activities: t('filters.activities'),
            campaigns: t('filters.campaigns'),
        };
        return labels[id] || id;
    };

    const [checkedFields, setCheckedFields] = useState<Record<string, boolean>>({});
    const [sections, setSections] = useState({
        system: true,
        fields: true
    });

    const toggleSection = (section: 'system' | 'fields') => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleSystemChange = (id: string, checked: boolean) => {
        setSystemFilters(prev => prev.map(f => f.id === id ? { ...f, checked } : f));
    };

    const handleFieldChange = (id: string, checked: boolean) => {
        setCheckedFields(prev => ({ ...prev, [id]: checked }));
    };

    const onApplyFilters = () => {
        const selectedFieldIds = Object.keys(checkedFields).filter(id => checkedFields[id]);
        onApply?.({
            systemFilters,
            fieldFilters: selectedFieldIds.map(id => ({ id, checked: true }))
        });
    };

    const onResetFilters = () => {
        setSystemFilters(prev => prev.map(f => ({ ...f, checked: false })));
        setCheckedFields({});
        onReset?.();
    };

    return (
        <div className="w-[280px] border-r border-slate-200 bg-white h-full flex flex-col shrink-0 animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[14px] font-bold text-slate-800">
                    {t('filter')} {entity} {t('by').toLowerCase()}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400" onClick={onResetFilters}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="p-3">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                        placeholder={t('search')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="ps-8 h-8 text-[13px] border-slate-200 focus-visible:ring-accent bg-slate-50/50"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1 px-3 pb-4">
                {/* System Defined Filters */}
                <div className="mb-2">
                    <button
                        onClick={() => toggleSection('system')}
                        className="flex items-center gap-2 w-full py-2 text-[13px] font-bold text-slate-700 hover:text-slate-900"
                    >
                        {sections.system ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                            <>
                                <ChevronRight className="h-3.5 w-3.5 rtl:hidden" />
                                <ChevronLeft className="h-3.5 w-3.5 hidden rtl:block" />
                            </>
                        )}
                        {t('systemFilters')}
                    </button>
                    {sections.system && (
                        <div className="space-y-2 mt-1 px-1">
                            {systemFilters.map(filter => (
                                <div key={filter.id} className="flex items-center gap-2.5 group">
                                    <Checkbox
                                        id={`sys-${filter.id}`}
                                        checked={filter.checked}
                                        onCheckedChange={(checked) => handleSystemChange(filter.id, !!checked)}
                                        className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                                    />
                                    <label
                                        htmlFor={`sys-${filter.id}`}
                                        className="text-[13px] text-slate-600 group-hover:text-slate-900 cursor-pointer transition-colors"
                                    >
                                        {getSystemLabel(filter.id)}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Separator className="my-2 bg-slate-100" />

                {/* Filter By Fields */}
                <div>
                    <button
                        onClick={() => toggleSection('fields')}
                        className="flex items-center gap-2 w-full py-2 text-[13px] font-bold text-slate-700 hover:text-slate-900"
                    >
                        {sections.fields ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                            <>
                                <ChevronRight className="h-3.5 w-3.5 rtl:hidden" />
                                <ChevronLeft className="h-3.5 w-3.5 hidden rtl:block" />
                            </>
                        )}
                        {t('fieldFilters')}
                    </button>
                    {sections.fields && (
                        <div className="space-y-2 mt-1 px-1">
                            {fields
                                .filter(f => f.label.toLowerCase().includes(search.toLowerCase()))
                                .map(filter => (
                                    <div key={filter.id} className="flex items-center gap-2.5 group">
                                        <Checkbox
                                            id={`field-${filter.id}`}
                                            checked={!!checkedFields[filter.id]}
                                            onCheckedChange={(checked) => handleFieldChange(filter.id, !!checked)}
                                            className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                                        />
                                        <label
                                            htmlFor={`field-${filter.id}`}
                                            className="text-[13px] text-slate-600 group-hover:text-slate-900 cursor-pointer transition-colors"
                                        >
                                            {filter.label}
                                        </label>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-slate-100 flex items-center gap-2 bg-slate-50/50">
                <Button variant="outline" className="flex-1 h-8 text-xs font-bold border-slate-200" onClick={onResetFilters}>
                    {t('cancel')}
                </Button>
                <Button className="flex-1 h-8 text-xs font-bold bg-primary hover:bg-primary/90 text-white" onClick={onApplyFilters}>
                    {t('filters.search')}
                </Button>
            </div>
        </div>
    );
}
