'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Deal } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  List as ListIcon,
  LayoutGrid,
  MoreHorizontal,
  Building2,
  Filter,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEAL_STAGES } from '@/lib/constants';
import { format } from 'date-fns';
import DataTableFilters from '@/components/tables/DataTableFilters';
import MassActionsMenu from '@/components/tables/MassActionsMenu';

interface Meta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  totalValue?: number;
}

export default function DealsPage() {
  const t = useTranslations('deals');
  const tCommon = useTranslations('common');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 50, total: 0, hasMore: false, totalValue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('pipeline');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchDeals = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: viewMode === 'pipeline' ? '100' : '20',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (search) params.append('search', search);

      const response = await fetch(`/api/deals?${params.toString()}`, { credentials: 'include' });
      const data = await response.json();

      if (response.ok && data.success) {
        setDeals(data.data);
        setMeta(data.meta || { page: 1, limit: 20, total: 0, hasMore: false, totalValue: 0 });
        setSelectedRows(new Set());
      } else {
        setError(data.error || 'Failed to fetch deals');
      }
    } catch (err) {
      setError('An error occurred while fetching deals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchDeals(1, debouncedSearch);
  }, [debouncedSearch, fetchDeals]);

  const handlePageChange = (newPage: number) => {
    fetchDeals(newPage, debouncedSearch);
  };

  const filteredDeals = useMemo(() => {
    if (stageFilter && stageFilter !== 'all') {
      return deals.filter(d => d.stage === stageFilter);
    }
    return deals;
  }, [deals, stageFilter]);

  const stageBuckets = useMemo(() => {
    return DEAL_STAGES.map((stage) => {
      const bucketDeals = filteredDeals.filter((deal) => deal.stage === stage.id);
      const bucketTotal = bucketDeals.reduce((sum, deal) => sum + Number(deal.value), 0);
      return { stage, deals: bucketDeals, bucketTotal };
    });
  }, [filteredDeals]);

  const allSelected = useMemo(
    () => filteredDeals.length > 0 && selectedRows.size === filteredDeals.length,
    [filteredDeals.length, selectedRows.size]
  );

  const toggleSelectAll = () => {
    if (allSelected && filteredDeals.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredDeals.map((d) => d.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRows(next);
  };

  const getStageColorStyle = (stageId: string) => {
    switch (stageId) {
      case 'prospecting': return 'border-t-primary bg-primary/5';
      case 'qualification': return 'border-t-accent bg-accent/5';
      case 'needs_analysis': return 'border-t-purple-500 bg-purple-50/50';
      case 'value_proposition': return 'border-t-sky-500 bg-sky-50/50';
      case 'id_decision_makers': return 'border-t-cyan-500 bg-cyan-50/50';
      case 'perception_analysis': return 'border-t-teal-500 bg-teal-50/50';
      case 'proposal': return 'border-t-amber-500 bg-amber-50/50';
      case 'negotiation': return 'border-t-orange-500 bg-orange-50/50';
      case 'closed_won': return 'border-t-emerald-500 bg-emerald-50/50';
      case 'closed_lost': return 'border-t-rose-500 bg-rose-50/50';
      default: return 'border-t-slate-500 bg-slate-50/50';
    }
  };

  const locale = useLocale();

  const getPipelineValueDisplay = () => {
    if (typeof meta.totalValue === 'number' && !isNaN(meta.totalValue)) {
      const val = meta.totalValue;
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'DZD',
        maximumFractionDigits: 1
      });

      if (val >= 1000000) return formatter.format(val / 1000000) + 'M';
      if (val >= 1000) return formatter.format(val / 1000) + 'K';
      return formatter.format(val);
    }
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'DZD' }).format(0);
  };

  const handleBulkDelete = async () => {
    const count = selectedRows.size;
    if (!confirm(tCommon('deleteConfirmBatch', { count }))) return;
    try {
      const ids = Array.from(selectedRows).join(',');
      const res = await fetch(`/api/deals?ids=${ids}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDeals(1, debouncedSearch);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const dealFields = [
    { id: 'name', label: t('fields.name') },
    { id: 'value', label: t('fields.amount') },
    { id: 'stage', label: t('fields.stage') },
    { id: 'probability', label: t('fields.probability') },
    { id: 'expectedCloseDate', label: t('fields.closingDate') },
    { id: 'type', label: t('fields.type') },
    { id: 'source', label: t('fields.source') },
    { id: 'ownerId', label: t('fields.owner') },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50">
      {/* Page Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('title')}</h1>
          <div className="h-6 w-[1px] bg-slate-200" />
          <div className="flex flex-col">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-tight leading-none mb-1">{t('pipelineValue')}</p>
            <p className="text-sm font-bold text-slate-900 leading-none">{getPipelineValueDisplay()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/deals/new">
            <Button className="h-8 px-4 shadow-sm font-bold text-xs rounded-md">
              {t('createDeal')}
            </Button>
          </Link>
          <MassActionsMenu entity="Deals" selectedCount={selectedRows.size} onAction={(action) => {
            import('@/components/tables/massActionsHandlers').then(mod => {
              const { handleMassAction } = mod;
              handleMassAction(action, 'Deals', selectedRows, deals as any[]);
            });
            if (action === 'mass_delete') handleBulkDelete();
          }} />
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar Filters */}
        <DataTableFilters
          entity="Deals"
          fields={dealFields}
          onReset={() => {
            setSearchQuery('');
          }}
          onApply={(f) => {
            console.log('Applying filters:', f);
          }}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Compact Toolbar */}
          <div className="h-12 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 w-full max-w-xl">
              <div className="flex items-center border border-slate-200 rounded-md overflow-hidden h-8">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-full px-3 text-[11px] font-bold rounded-none border-r border-slate-200 ${viewMode === 'pipeline' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}
                  onClick={() => setViewMode('pipeline')}
                >
                  <LayoutGrid className="mr-1.5 h-3.5 w-3.5" /> {t('pipelineView')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-full px-3 text-[11px] font-bold rounded-none ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}
                  onClick={() => setViewMode('list')}
                >
                  <ListIcon className="mr-1.5 h-3.5 w-3.5" /> {t('listView')}
                </Button>
              </div>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rtl:left-auto rtl:right-3" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  className="pl-9 pr-4 h-8 text-[13px] border-none bg-transparent focus-visible:ring-0 shadow-none font-medium rtl:pl-4 rtl:pr-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="h-8 border-none bg-transparent shadow-none text-xs font-bold text-slate-600 focus:ring-0">
                  <Filter className="mr-2 h-3.5 w-3.5 text-slate-500 rtl:mr-0 rtl:ml-2" />
                  <SelectValue placeholder={t('allStages')} />
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-xl border-slate-200">
                  <SelectItem value="all" className="text-xs font-medium">{t('allStages')}</SelectItem>
                  {DEAL_STAGES.map(stage => (
                    <SelectItem key={stage.id} value={stage.id} className="text-xs font-medium">
                      {t(`statuses.${stage.id}`, { defaultValue: stage.label })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table/Pipeline Container */}
          <div className="flex-1 overflow-auto bg-slate-50/30">
            {error && (
              <div className="m-4 p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 font-medium text-center">
                {error}
              </div>
            )}

            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-12">
                <DollarSign className="w-10 h-10 text-primary animate-pulse" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">{tCommon('loading')}</p>
              </div>
            ) : viewMode === 'pipeline' ? (
              <div className="flex w-max min-h-full p-4 gap-4 items-start rtl:flex-row-reverse">
                {stageBuckets.map(({ stage, deals: bucketDeals, bucketTotal }) => (
                  <div key={stage.id} className="w-[280px] shrink-0 flex flex-col gap-3">
                    <div className={`p-3 rounded-md bg-white border border-slate-200 border-t-[3px] shadow-sm ${getStageColorStyle(stage.id)} flex flex-col`}>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 truncate pr-2 rtl:pr-0 rtl:pl-2">
                          {t(`statuses.${stage.id}`, { defaultValue: stage.label })}
                        </h3>
                        <Badge variant="outline" className="text-[10px] font-bold border-slate-200 h-5 px-1.5">
                          {stage.probability}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-slate-900 tracking-tight">
                          {new Intl.NumberFormat(locale, { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(bucketTotal)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold">{bucketDeals.length}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {bucketDeals.length === 0 ? (
                        <div className="rounded-md border border-dashed border-slate-200 p-8 flex items-center justify-center bg-white/50">
                          <span className="text-[11px] font-bold text-slate-300 uppercase">{tCommon('empty')}</span>
                        </div>
                      ) : (
                        bucketDeals.map((deal) => (
                          <Link key={deal.id} href={`/deals/${deal.id}`} className="block group">
                            <div className="bg-white rounded-md border border-slate-200 shadow-sm p-3 hover:border-accent/40 hover:shadow-md transition-all">
                              <span className="text-[13px] font-bold text-primary hover:underline leading-none">{deal.name}</span>
                              {deal.account && (
                                <div className="flex items-center mb-2">
                                  <Building2 className="w-3 h-3 text-slate-300 mr-1.5 shrink-0 rtl:mr-0 rtl:ml-1.5" />
                                  <p className="text-[11px] font-bold text-slate-400 truncate">{deal.account.name}</p>
                                </div>
                              )}
                              <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                                <p className="text-[12px] font-bold text-slate-900">{new Intl.NumberFormat(locale, { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(Number(deal.value))}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                  {deal.expectedCloseDate ? format(new Date(deal.expectedCloseDate), 'MMM d') : '-'}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View Table */
              <div className="bg-white">
                <Table className="border-collapse">
                  <TableHeader className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="w-10 pl-4 h-10 rtl:pl-0 rtl:pr-4">
                        <Checkbox
                          checked={filteredDeals.length > 0 && selectedRows.size === filteredDeals.length}
                          onCheckedChange={toggleSelectAll}
                          className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </TableHead>
                      <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left rtl:text-right">{t('fields.name')}</TableHead>
                      <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left rtl:text-right">{t('fields.amount')}</TableHead>
                      <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left rtl:text-right">{t('fields.stage')}</TableHead>
                      <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left rtl:text-right">{t('fields.probability')}</TableHead>
                      <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left rtl:text-right">{t('fields.closingDate')}</TableHead>
                      <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right rtl:text-left">{tCommon('modified_time')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-64 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center p-8">
                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                              <Search className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-[14px] font-bold text-slate-900">{t('noDeals')}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDeals.map((deal) => (
                        <TableRow
                          key={deal.id}
                          className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                          onClick={() => toggleSelectRow(deal.id)}
                        >
                          <TableCell className="pl-4 h-10 w-10 p-0 rtl:pl-0 rtl:pr-4" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedRows.has(deal.id)}
                              onCheckedChange={() => toggleSelectRow(deal.id)}
                              className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </TableCell>
                          <TableCell className="px-4 py-2 text-[13px] font-medium text-primary hover:underline text-left rtl:text-right">
                            {deal.name}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-[13px] font-bold text-slate-900 text-left rtl:text-right">
                            {new Intl.NumberFormat(locale, { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(Number(deal.value))}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-[13px] text-left rtl:text-right">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-tight border-t-2 ${getStageColorStyle(deal.stage)} shadow-none`}>
                              {t(`statuses.${deal.stage}`, { defaultValue: deal.stage })}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-2 text-[13px] text-slate-700 font-bold text-left rtl:text-right">{deal.probability}%</TableCell>
                          <TableCell className="px-4 py-2 text-[13px] text-slate-700 text-left rtl:text-right">
                            {deal.expectedCloseDate ? format(new Date(deal.expectedCloseDate), 'MM/dd/yyyy') : '-'}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-[12px] text-slate-500 font-medium text-right rtl:text-left">
                            {format(new Date(deal.updatedAt || deal.createdAt), 'MM/dd/yyyy hh:mm a')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="h-10 px-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 text-[12px] font-bold text-slate-500 uppercase tracking-tight">
              <span>{tCommon('total_count')}: {meta.total}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[12px] font-bold text-slate-400 mr-2 rtl:mr-0 rtl:ml-2">{tCommon('pagination', { start: meta.page, total: Math.ceil(meta.total / meta.limit) })}</span>
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
      {selectedRows.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-slate-900 text-white px-6 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-[13px] font-bold tracking-tight">{tCommon('mass_actions.selected', { count: selectedRows.size })}</span>
          <div className="h-4 w-[1px] bg-slate-700 mx-1" />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 h-8 px-4 text-[12px] font-bold rounded-full"
              onClick={() => setSelectedRows(new Set())}
            >
              {tCommon('mass_actions.deselect_all')}
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
              {tCommon('mass_actions.mass_update')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
