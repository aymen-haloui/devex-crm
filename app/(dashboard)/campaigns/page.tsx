'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Megaphone,
  Filter,
  ArrowUpDown,
  Download,
  LayoutGrid,
  Calendar,
  Target,
  BarChart3,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import DataTableFilters from '@/components/tables/DataTableFilters';
import MassActionsMenu from '@/components/tables/MassActionsMenu';

interface Campaign {
  id: string;
  name: string;
  status: string;
  channel: string;
  budget: string | number;
  spent: string | number;
  revenue: string | number;
  leadsGenerated: number;
  startDate: string | null;
  endDate: string | null;
  owner: {
    firstName: string;
    lastName: string;
  };
}

const getStatusBadge = (status: string, t: any) => {
  const norm = status.toLowerCase();
  switch (norm) {
    case 'active':
    case 'sending':
      return <Badge className="bg-emerald-100 text-emerald-800 border-none rounded-md px-2 py-0.5 shadow-none font-medium whitespace-nowrap">{t(`statuses.${norm}`)}</Badge>;
    case 'completed':
      return <Badge className="bg-blue-100 text-blue-800 border-none rounded-md px-2 py-0.5 shadow-none font-medium whitespace-nowrap">{t('statuses.completed')}</Badge>;
    case 'draft':
      return <Badge className="bg-slate-100 text-slate-800 border-none rounded-md px-2 py-0.5 shadow-none font-medium whitespace-nowrap">{t('statuses.draft')}</Badge>;
    case 'scheduled':
      return <Badge className="bg-indigo-100 text-indigo-800 border-none rounded-md px-2 py-0.5 shadow-none font-medium whitespace-nowrap">{t('statuses.scheduled')}</Badge>;
    case 'paused':
      return <Badge className="bg-amber-100 text-amber-800 border-none rounded-md px-2 py-0.5 shadow-none font-medium whitespace-nowrap">{t('statuses.paused')}</Badge>;
    default:
      return <Badge className="bg-slate-100 text-slate-800 border-none rounded-md px-2 py-0.5 shadow-none font-medium capitalize whitespace-nowrap">{status}</Badge>;
  }
};

export default function CampaignsPage() {
  const t = useTranslations('campaigns');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [totals, setTotals] = useState({ spent: 0, budget: 0, revenue: 0, leads: 0 });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/campaigns?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setCampaigns(json.data);
        if (json.meta?.totals) {
          setTotals(json.meta.totals);
        }
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCampaigns(), 300);
    return () => clearTimeout(timer);
  }, [fetchCampaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [campaigns, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredCampaigns.length && filteredCampaigns.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredCampaigns.map(c => c.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const handleBulkDelete = async () => {
    if (!confirm(t('confirmDelete', { count: selectedRows.size }))) return;
    try {
      const ids = Array.from(selectedRows).join(',');
      const res = await fetch(`/api/campaigns/bulk?ids=${ids}`, { method: 'DELETE' });
      if (res.ok) fetchCampaigns();
    } catch (e) {
      console.error('Failed to delete campaigns:', e);
    }
  };

  const campaignFields = [
    { id: 'name', label: t('fields.name') },
    { id: 'status', label: t('fields.status') },
    { id: 'channel', label: t('fields.channel') },
    { id: 'budget', label: t('fields.budget') },
    { id: 'revenue', label: t('fields.revenue') },
  ];

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Megaphone className="w-10 h-10 text-indigo-600 animate-pulse" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('loadingAnalytics')}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50">
      {/* Page Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0 rtl:flex-row-reverse">
        <div className="flex items-center gap-4 rtl:flex-row-reverse">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('title')}</h1>
          <div className="h-6 w-[1px] bg-slate-200" />
          <p className="text-sm text-slate-500 font-medium">{t('campaignsCount', { count: filteredCampaigns.length })}</p>
        </div>
        <div className="flex items-center gap-2 rtl:flex-row-reverse">
          <Link href="/marketing">
            <Button className="h-8 px-4 shadow-sm font-bold text-xs rounded-md">
              {t('createCampaign')}
            </Button>
          </Link>
          <MassActionsMenu entity="Campaigns" selectedCount={selectedRows.size} onAction={(action) => {
            import('@/components/tables/massActionsHandlers').then(mod => {
              const { handleMassAction } = mod;
              handleMassAction(action, 'Campaigns', selectedRows, campaigns as any[]);
            });
            if (action === 'mass_delete') handleBulkDelete();
          }} />
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar Filters */}
        <DataTableFilters
          entity="Campaigns"
          fields={campaignFields}
          onReset={() => {
            setSearchQuery('');
            setStatusFilter('all');
          }}
          onApply={(f) => console.log('Applying filters:', f)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Stats Bar */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-6 overflow-x-auto shrink-0 bg-slate-50/30 rtl:flex-row-reverse">
            {[
              { label: t('fields.budget'), value: `$${totals.budget.toLocaleString()}` },
              { label: t('fields.spent'), value: `$${totals.spent.toLocaleString()}` },
              { label: t('fields.revenue'), value: `$${totals.revenue.toLocaleString()}` },
              { label: t('reach'), value: totals.leads.toLocaleString() },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col min-w-[100px] text-left rtl:text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <span className="text-[13px] font-black text-slate-900">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Compact Toolbar */}
          <div className="h-12 px-4 border-b border-slate-100 flex items-center justify-between shrink-0 rtl:flex-row-reverse">
            <div className="flex items-center gap-4 w-full max-w-xl rtl:flex-row-reverse">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rtl:left-auto rtl:right-3" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  className="pl-9 pr-3 rtl:pl-3 rtl:pr-9 h-8 text-[13px] border-none bg-transparent focus-visible:ring-0 shadow-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-10 pl-4 h-10 rtl:pr-4">
                    <Checkbox
                      checked={filteredCampaigns.length > 0 && selectedRows.size === filteredCampaigns.length}
                      onCheckedChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                  </TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left rtl:text-right">{t('fields.name')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left rtl:text-right">{t('fields.status')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left rtl:text-right">{t('fields.budget')} / {t('fields.spent')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right rtl:text-left">{t('fields.revenue')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">{tCommon('owner')}</TableHead>
                  <TableHead className="h-10 px-4 text-right rtl:text-left"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center p-8">
                        <Megaphone className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-[14px] font-bold text-slate-900">{t('noCampaigns')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <TableRow
                      key={campaign.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => toggleSelectRow(campaign.id)}
                    >
                      <TableCell className="pl-4 h-10 p-0 rtl:pr-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(campaign.id)}
                          onCheckedChange={() => toggleSelectRow(campaign.id)}
                          className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-2 text-left rtl:text-right">
                        <div className="flex flex-col gap-0.5" onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/campaigns/${campaign.id}`);
                        }}>
                          <span className="text-[13px] font-bold text-blue-600 hover:underline transition-colors">{campaign.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium capitalize">{campaign.channel}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-left rtl:text-right">
                        {getStatusBadge(campaign.status, t)}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-left rtl:text-right">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[12px] font-bold text-slate-700">${Number(campaign.budget).toLocaleString()}</span>
                          <div className="flex items-center gap-1.5 rtl:flex-row-reverse rtl:justify-end">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{t('fields.spent')}:</span>
                            <span className="text-[9px] font-bold text-slate-500">${Number(campaign.spent).toLocaleString()}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-right rtl:text-left">
                        <span className="text-[13px] font-black text-emerald-600">${Number(campaign.revenue).toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-7 h-7 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-sm">
                            {campaign.owner ? (
                              `${campaign.owner.firstName?.[0] || ''}${campaign.owner.lastName?.[0] || ''}`
                            ) : (
                              '??'
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-right rtl:text-left">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm">
                              <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-100 p-1 rtl:text-right">
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2 rtl:flex-row-reverse" onClick={() => router.push(`/campaigns/${campaign.id}`)}>
                              {t('viewResults')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2 text-rose-600 rtl:flex-row-reverse" onClick={(e) => {
                              e.stopPropagation();
                              handleBulkDelete();
                            }}>
                              {t('deleteCampaign')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedRows.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-slate-900 text-white px-6 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 rtl:flex-row-reverse">
          <span className="text-[13px] font-bold tracking-tight">{tCommon('selectedRows', { count: selectedRows.size })}</span>
          <div className="h-4 w-[1px] bg-slate-700 mx-1" />
          <div className="flex items-center gap-1 rtl:flex-row-reverse">
            <Button variant="ghost" className="text-white hover:bg-white/10 h-8 px-4 text-[12px] font-bold rounded-full" onClick={() => setSelectedRows(new Set())}>
              {tCommon('deselectAll')}
            </Button>
            <Button variant="ghost" className="text-rose-400 hover:bg-rose-900/40 h-8 px-4 text-[12px] font-bold rounded-full" onClick={handleBulkDelete}>
              {tCommon('delete')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
