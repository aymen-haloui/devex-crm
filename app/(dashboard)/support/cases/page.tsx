'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Search, Briefcase, RefreshCw, MoreHorizontal, ChevronRight,
  AlertCircle, ShieldAlert, Clock, History, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from 'next-intl';
import DataTableFilters from '@/components/tables/DataTableFilters';
import MassActionsMenu from '@/components/tables/MassActionsMenu';

export default function CasesPage() {
  const router = useRouter();
  const t = useTranslations('support.cases');
  const tCommon = useTranslations('common');
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [sla, setSla] = useState<{ overdueCount: number; atRiskCount: number }>({ overdueCount: 0, atRiskCount: 0 });
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, hasMore: false });

  const fetchCases = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNumber.toString(),
        limit: '20',
        ...(search && { search }),
      });
      const res = await fetch(`/api/support/cases?${params}`);
      const data = await res.json();
      if (data.success) {
        setCases(data.data);
        setMeta(data.meta);
      }
    } catch {
      toast.error(t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [search, t]);

  const fetchSla = useCallback(async () => {
    try {
      const res = await fetch('/api/support/cases/sla');
      const data = await res.json();
      if (data.success) {
        setSla({
          overdueCount: data.data.overdueCount,
          atRiskCount: data.data.atRiskCount,
        });
      }
    } catch (e) {
      console.error('Failed to fetch SLA data');
    }
  }, []);

  useEffect(() => {
    fetchCases();
    fetchSla();
  }, [fetchCases, fetchSla]);

  const escalateOverdueCases = async () => {
    try {
      const res = await fetch('/api/support/cases/sla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escalateOverdue: true }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('sla.escalatedCount', { count: data.data.escalatedCount }));
        fetchCases();
        fetchSla();
      }
    } catch (err) {
      toast.error(t('errors.escalateFailed'));
    }
  };

  const updateCaseStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/support/cases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(t('errors.statusUpdated'));
        fetchCases();
      }
    } catch (err) {
      toast.error(t('errors.updateFailed'));
    }
  };

  const toggleSelectAll = () => {
    if (selectedCases.size === cases.length && cases.length > 0) {
      setSelectedCases(new Set());
    } else {
      setSelectedCases(new Set(cases.map(c => c.id)));
    }
  };

  const toggleSelectCase = (id: string) => {
    const newSet = new Set(selectedCases);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedCases(newSet);
  };

  const handleBulkDelete = async () => {
    const count = selectedCases.size;
    if (!confirm(tCommon('deleteConfirmBatch', { count }))) return;
    try {
      const ids = Array.from(selectedCases).join(',');
      const res = await fetch(`/api/support/cases?ids=${ids}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(t('errors.deletedCount', { count }));
        setSelectedCases(new Set());
        fetchCases();
      }
    } catch (e) {
      toast.error(t('errors.deleteFailed'));
    }
  };

  const caseFields = [
    { id: 'caseNumber', label: t('fields.caseNumber') },
    { id: 'product', label: t('fields.productName') },
    { id: 'subject', label: t('fields.subject') },
    { id: 'status', label: t('fields.status') },
    { id: 'priority', label: t('fields.priority') },
    { id: 'caseOrigin', label: t('fields.caseOrigin') },
    { id: 'accountName', label: t('fields.accountName') },
    { id: 'ownerId', label: t('fields.owner') },
  ];

  if (loading && cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 bg-white">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('syncing')}</p>
      </div>
    );
  }

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
          <Button onClick={() => router.push('/support/cases/new')} className="h-8 px-4 shadow-sm font-bold text-xs rounded-md bg-primary hover:bg-primary/90 text-white">
            {t('createCase')}
          </Button>
          <MassActionsMenu entity="Cases" selectedCount={selectedCases.size} onAction={(action) => {
            import('@/components/tables/massActionsHandlers').then(mod => {
              const { handleMassAction } = mod;
              handleMassAction(action, 'Cases', selectedCases, cases);
            });
            if (action === 'mass_delete') handleBulkDelete();
          }} />
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar Filters */}
        <DataTableFilters
          entity="Cases"
          fields={caseFields}
          onReset={() => setSearch('')}
          onApply={(f) => console.log('Applying filters:', f)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* SLA Performance Bar */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-8 shrink-0 bg-slate-50/30">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('sla.overdue')}</span>
              </div>
              <span className="text-[14px] font-black text-rose-600">{sla.overdueCount}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-0.5">
                <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('sla.atRisk')}</span>
              </div>
              <span className="text-[14px] font-black text-orange-600">{sla.atRiskCount}</span>
            </div>
            <div className="ml-auto">
              <Button size="sm" variant="outline" className="h-7 text-[11px] font-bold border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg px-3" onClick={escalateOverdueCases}>
                <AlertCircle className="w-3 h-3 mr-1.5" /> {t('sla.escalate')}
              </Button>
            </div>
          </div>

          {/* Compact Toolbar */}
          <div className="h-12 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 w-full max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={t('placeholders.filter')}
                  className="pl-9 h-8 text-[13px] border-none bg-transparent focus-visible:ring-0 shadow-none font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => fetchCases()} className="h-8 w-8 rounded text-slate-600 border-slate-300 hover:bg-slate-50">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-10 h-10">
                    <Checkbox
                      checked={cases.length > 0 && selectedCases.size === cases.length}
                      onCheckedChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-primary"
                    />
                  </TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('caseDetails')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.productName')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">{t('fields.priority')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">{t('fields.status')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.dueDate')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">{tCommon('filters.record_action')}</TableHead>
                  <TableHead className="h-10 px-4 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center p-8">
                        <AlertCircle className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-[14px] font-bold text-slate-900">{t('noCases')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  cases.map((caseItem) => (
                    <TableRow
                      key={caseItem.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => toggleSelectCase(caseItem.id)}
                    >
                      <TableCell className="w-10 h-10 p-0" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedCases.has(caseItem.id)}
                          onCheckedChange={() => toggleSelectCase(caseItem.id)}
                          className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-primary"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex flex-col gap-0.5" onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/support/cases/${caseItem.id}`);
                        }}>
                          <span className="text-[13px] font-bold text-blue-600 hover:underline transition-colors">{caseItem.caseNumber}</span>
                          <span className="text-[11px] text-slate-600 font-medium line-clamp-1">{caseItem.subject}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        {caseItem.product?.name || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tight ${['high', 'critical'].includes(caseItem.priority?.toLowerCase()) ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          caseItem.priority?.toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                          {t(`priorities.${caseItem.priority?.toLowerCase()}`) || caseItem.priority}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tight ${['open', 'pending', 'new'].includes(caseItem.status?.toLowerCase()) ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                          'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                          {t(`statuses.${caseItem.status?.toLowerCase()}`) || caseItem.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{caseItem.dueAt ? format(new Date(caseItem.dueAt), 'MMM d, HH:mm') : t('notSpecified')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-right">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">
                          <History className="w-3 h-3 text-indigo-500" />
                          <span className="text-[11px] font-black text-slate-700">{t('sla.level', { level: caseItem.escalationLevel ?? 0 })}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm">
                              <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-100 p-1">
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2" onClick={() => router.push(`/support/cases/${caseItem.id}`)}>
                              {t('actions.analysis')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2" onClick={() => updateCaseStatus(caseItem.id, 'resolved')}>
                              {t('actions.resolve')}
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

          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-white text-xs font-medium text-slate-500 shrink-0">
            <div>
              {tCommon('totalCount')}: {meta.total}
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                disabled={meta.page <= 1}
                onClick={() => fetchCases(meta.page - 1)}
                className="h-7 text-[11px] font-bold"
              >
                {tCommon('previous')}
              </Button>
              <span className="text-slate-900">{tCommon('page')} {meta.page}</span>
              <Button
                variant="ghost"
                size="sm"
                disabled={!meta.hasMore}
                onClick={() => fetchCases(meta.page + 1)}
                className="h-7 text-[11px] font-bold"
              >
                {tCommon('next')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedCases.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-slate-900 text-white px-6 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-[13px] font-bold tracking-tight">{tCommon('mass_actions.selected', { count: selectedCases.size })}</span>
          <div className="h-4 w-[1px] bg-slate-700 mx-1" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" className="text-white hover:bg-white/10 h-8 px-4 text-[12px] font-bold rounded-full" onClick={() => setSelectedCases(new Set())}>
              {tCommon('mass_actions.deselect_all')}
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
