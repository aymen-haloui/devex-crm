'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    Plus,
    MoreHorizontal,
    Mail,
    Phone,
    Building2,
    Filter,
    ArrowUpDown,
    Download,
    LayoutGrid,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import DataTableFilters from '@/components/tables/DataTableFilters';
import MassActionsMenu from '@/components/tables/MassActionsMenu';

// Match the Lead definition from API
interface Lead {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    company: string | null;
    status: string;
    source: string | null;
    score: number;
    createdAt: string;
    owner: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

interface Meta {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}

const getStatusBadge = (status: string, t: any) => {
    const norm = status.toLowerCase();
    switch (norm) {
        case 'new':
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none rounded-md px-2 py-0.5 shadow-none font-medium">{t('statuses.new')}</Badge>;
        case 'contacted':
            return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none rounded-md px-2 py-0.5 shadow-none font-medium">{t('statuses.contacted')}</Badge>;
        case 'qualified':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none rounded-md px-2 py-0.5 shadow-none font-medium">{t('statuses.qualified')}</Badge>;
        case 'proposal_sent':
        case 'proposal':
            return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none rounded-md px-2 py-0.5 shadow-none font-medium">{t('statuses.proposal')}</Badge>;
        case 'negotiation':
            return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-none rounded-md px-2 py-0.5 shadow-none font-medium">{t('statuses.negotiation')}</Badge>;
        case 'closed_won':
        case 'won':
            return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none rounded-md px-2 py-0.5 shadow-none font-medium">{t('statuses.won')}</Badge>;
        case 'closed_lost':
        case 'lost':
            return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-none rounded-md px-2 py-0.5 shadow-none font-medium">{t('statuses.lost')}</Badge>;
        default:
            return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200 border-none rounded-md px-2 py-0.5 shadow-none font-medium capitalize">{status}</Badge>;
    }
};

const getInitials = (first: string, last: string) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase() || '?';
};

const getAvatarColor = (name: string) => {
    const colors = [
        'bg-blue-100 text-blue-700',
        'bg-emerald-100 text-emerald-700',
        'bg-violet-100 text-violet-700',
        'bg-amber-100 text-amber-700',
        'bg-pink-100 text-pink-700',
        'bg-cyan-100 text-cyan-700',
        'bg-rose-100 text-rose-700',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function LeadsPage() {
    const t = useTranslations('leads');
    const tCommon = useTranslations('common');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [meta, setMeta] = useState<Meta>({ page: 1, limit: 15, total: 0, hasMore: false });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
    const [advancedFilters, setAdvancedFilters] = useState<any>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchLeads = useCallback(async (page: number, search: string, status: string, advFilters?: any) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: meta.limit.toString(),
                sortBy: 'createdAt',
                sortOrder: 'desc',
            });

            if (search) params.append('search', search);
            if (status && status !== 'all') params.append('status', status);

            // Apply advanced filters if present
            if (advFilters) {
                if (advFilters.systemFilters) {
                    advFilters.systemFilters.forEach((f: any) => {
                        if (f.checked) {
                            // Example: map system filters to query params
                            if (f.id === 'touched') params.append('touched', 'true');
                            // Add others as needed by your API
                        }
                    });
                }
                if (advFilters.fieldFilters) {
                    advFilters.fieldFilters.forEach((f: any) => {
                        // For now we just pass the IDs, in a real app you'd have values
                        params.append(`filter_${f.id}`, 'true');
                    });
                }
            }
            if (status && status !== 'all') params.append('status', status);

            const res = await fetch(`/api/leads?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch leads');
            const json = await res.json();

            if (json.success) {
                setLeads(json.data);
                setMeta(json.meta);
                setSelectedLeads(new Set()); // Reset selection on page/filter change
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [meta.limit]);

    useEffect(() => {
        fetchLeads(1, debouncedSearch, statusFilter, advancedFilters);
    }, [debouncedSearch, statusFilter, advancedFilters, fetchLeads]);

    const handlePageChange = (newPage: number) => {
        fetchLeads(newPage, debouncedSearch, statusFilter, advancedFilters);
    };

    const toggleSelectAll = () => {
        if (selectedLeads.size === leads.length && leads.length > 0) {
            setSelectedLeads(new Set());
        } else {
            setSelectedLeads(new Set(leads.map(l => l.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedLeads);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedLeads(next);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('deleteConfirm'))) return;
        try {
            const res = await fetch(`/api/leads?ids=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchLeads(meta.page, debouncedSearch, statusFilter);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleBulkDelete = async () => {
        const count = selectedLeads.size;
        if (!confirm(tCommon('deleteConfirmBatch', { count }))) return;
        try {
            const ids = Array.from(selectedLeads).join(',');
            const res = await fetch(`/api/leads?ids=${ids}`, { method: 'DELETE' });
            if (res.ok) {
                fetchLeads(1, debouncedSearch, statusFilter);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const tMass = useTranslations('common.mass_actions');

    const leadFields = [
        { id: 'firstName', label: t('fields.firstName') },
        { id: 'lastName', label: t('fields.lastName') },
        { id: 'email', label: t('fields.email') },
        { id: 'company', label: t('fields.company') },
        { id: 'phone', label: t('fields.phone') },
        { id: 'source', label: t('fields.source') },
        { id: 'status', label: t('fields.status') },
        { id: 'industry', label: t('fields.industry') },
        { id: 'annualRevenue', label: t('fields.annualRevenue') },
        { id: 'city', label: t('fields.city') },
        { id: 'country', label: t('fields.country') },
    ];

    return (
        <div className="w-full h-full flex flex-col bg-slate-50/50">
            {/* Page Header */}
            <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('title')}</h1>
                    <div className="h-6 w-[1px] bg-slate-200" />
                    <p className="text-sm text-slate-500 font-medium">{meta.total} {t('title')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/leads/new">
                        <Button className="h-8 px-4 shadow-sm font-bold text-xs rounded-md">
                            {t('createLead')}
                        </Button>
                    </Link>
                    <MassActionsMenu entity={t('single')} selectedCount={selectedLeads.size} onAction={(action) => {
                        if (action === 'mass_delete') handleBulkDelete();
                    }} />
                </div>
            </div>

            <div className="flex-1 flex min-h-0 overflow-hidden">
                {/* Left Sidebar Filters */}
                <DataTableFilters
                    entity={t('title')}
                    fields={leadFields}
                    onReset={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setAdvancedFilters(null);
                    }}
                    onApply={(f) => {
                        setAdvancedFilters(f);
                    }}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    {/* Compact Toolbar */}
                    <div className="h-12 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4 w-full max-w-xl">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder={t('searchPlaceholder')}
                                    className="pl-9 h-8 text-[13px] border-none bg-transparent focus-visible:ring-0 shadow-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-8 border-none bg-transparent shadow-none text-xs font-bold text-slate-600 focus:ring-0">
                                    <Filter className="mr-2 h-3.5 w-3.5 text-slate-500" />
                                    <SelectValue placeholder={t('statuses.all')} />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg shadow-xl border-slate-200">
                                    <SelectItem value="all" className="text-xs font-medium">{t('statuses.all')}</SelectItem>
                                    <SelectItem value="new" className="text-xs font-medium">{t('statuses.new')}</SelectItem>
                                    <SelectItem value="contacted" className="text-xs font-medium">{t('statuses.contacted')}</SelectItem>
                                    <SelectItem value="qualified" className="text-xs font-medium">{t('statuses.qualified')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Table Container - Flat Zoho Style */}
                    <div className="flex-1 overflow-auto">
                        <Table className="border-collapse">
                            <TableHeader className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="w-10 pl-4 h-10">
                                        <Checkbox
                                            checked={leads.length > 0 && selectedLeads.size === leads.length}
                                            onCheckedChange={toggleSelectAll}
                                            className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                    </TableHead>
                                    <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-slate-800">
                                            {t('fullName')} <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.company')}</TableHead>
                                    <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.email')}</TableHead>
                                    <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.phone')}</TableHead>
                                    <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.source')}</TableHead>
                                    <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.status')}</TableHead>
                                    <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.owner')}</TableHead>
                                    <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.createdAt')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <TableRow key={i} className="border-b border-slate-50">
                                            <TableCell colSpan={9} className="h-10 p-0">
                                                <div className="h-10 w-full bg-white animate-pulse border-b border-slate-50" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : leads.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center p-8">
                                                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                                    <Search className="h-6 w-6 text-primary" />
                                                </div>
                                                <span className="text-[13px] font-bold text-primary hover:underline">{t('noLeads')}</span>
                                                <p className="text-[13px] text-slate-500">{t('noLeadsDescription')}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leads.map((lead) => (
                                        <TableRow
                                            key={lead.id}
                                            className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                            onClick={() => toggleSelect(lead.id)}
                                        >
                                            <TableCell className="pl-4 h-10 w-10 p-0" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedLeads.has(lead.id)}
                                                    onCheckedChange={() => toggleSelect(lead.id)}
                                                    className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                            </TableCell>
                                            <TableCell className="px-4 py-2 text-[13px] font-medium text-blue-600 hover:underline">
                                                {lead.firstName} {lead.lastName}
                                            </TableCell>
                                            <TableCell className="px-4 py-2 text-[13px] text-slate-700">{lead.company || '-'}</TableCell>
                                            <TableCell className="px-4 py-2 text-[13px] text-slate-700">{lead.email}</TableCell>
                                            <TableCell className="px-4 py-2 text-[13px] text-slate-700">{lead.phone || '-'}</TableCell>
                                            <TableCell className="px-4 py-2 text-[13px] text-slate-700">{lead.source || '-'}</TableCell>
                                            <TableCell className="px-4 py-2 text-[13px]">
                                                {getStatusBadge(lead.status, t)}
                                            </TableCell>
                                            <TableCell className="px-4 py-2 text-[13px] text-slate-700">
                                                {lead.owner.firstName} {lead.owner.lastName}
                                            </TableCell>
                                            <TableCell className="px-4 py-2 text-[12px] text-slate-500 font-medium">
                                                {format(new Date(lead.createdAt), 'MM/dd/yyyy hh:mm a')}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="h-10 px-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4 text-[12px] font-bold text-slate-500 uppercase tracking-tight">
                            <span>{tCommon('pagination', { start: meta.page, total: meta.total })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[12px] font-bold text-slate-400 mr-2">{tCommon('page')} {meta.page} {tCommon('of')} {Math.ceil(meta.total / meta.limit)} {tCommon('page').toLowerCase()}s</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-[11px] font-bold hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                                onClick={(e) => { e.stopPropagation(); handlePageChange(meta.page - 1); }}
                                disabled={meta.page <= 1}
                            >
                                {tCommon('previous')}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-[11px] font-bold hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                                onClick={(e) => { e.stopPropagation(); handlePageChange(meta.page + 1); }}
                                disabled={!meta.hasMore}
                            >
                                {tCommon('next')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedLeads.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-slate-900 text-white px-6 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <span className="text-[13px] font-bold tracking-tight">{tMass('selected', { count: selectedLeads.size })}</span>
                    <div className="h-4 w-[1px] bg-slate-700 mx-1" />
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/10 h-8 px-4 text-[12px] font-bold rounded-full"
                            onClick={() => setSelectedLeads(new Set())}
                        >
                            {tMass('deselect_all')}
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-rose-400 hover:bg-rose-900/40 h-8 px-4 text-[12px] font-bold rounded-full"
                            onClick={handleBulkDelete}
                        >
                            {tCommon('delete')}
                        </Button>
                        <Button
                            className="bg-primary hover:bg-primary/90 text-white h-8 px-5 text-[12px] font-bold rounded-full shadow-lg shadow-primary/20"
                        >
                            {tMass('mass_update_btn')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
