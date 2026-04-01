'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import DataTableFilters from '@/components/tables/DataTableFilters';
import MassActionsMenu from '@/components/tables/MassActionsMenu';
import { Plus, Search, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type Solution = {
  id: string;
  solutionNumber: string;
  title: string;
  status: string;
  question?: string | null;
  answer?: string | null;
  createdAt: string;
  owner: { firstName: string; lastName: string };
  product?: { name: string } | null;
};

const statusColors: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  Published: 'bg-emerald-100 text-emerald-700',
  Review: 'bg-amber-100 text-amber-700',
};

export default function SolutionsPage() {
  const t = useTranslations('support.solutions');
  const tCommon = useTranslations('common');
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchSolutions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/support/solutions?${params}`);
      const json = await res.json();
      if (json.success) setSolutions(json.data);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchSolutions, 250);
    return () => clearTimeout(t);
  }, [fetchSolutions]);

  const solutionFields = [
    { id: 'solutionNumber', label: t('fields.solutionNumber') },
    { id: 'title', label: t('fields.title') },
    { id: 'status', label: t('fields.status') },
    { id: 'ownerId', label: t('fields.owner') },
  ];

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleSelectAll = () => {
    if (selectedRows.size === solutions.length && solutions.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(solutions.map(s => s.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const handleBulkDelete = async () => {
    const count = selectedRows.size;
    if (!confirm(tCommon('deleteConfirmBatch', { count }))) return;
    try {
      const ids = Array.from(selectedRows).join(',');
      const res = await fetch(`/api/support/solutions?ids=${ids}`, { method: 'DELETE' });
      if (res.ok) fetchSolutions();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50">
      {/* Page Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('title')}</h1>
          <div className="h-6 w-[1px] bg-slate-200" />
          <p className="text-sm text-slate-500 font-medium">{t('solutionsCount', { count: solutions.length })}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/support/solutions/new">
            <Button className="h-8 px-4 shadow-sm font-bold text-xs rounded-md bg-primary hover:bg-primary/90 text-white">
              {t('createSolution')}
            </Button>
          </Link>
          <MassActionsMenu entity="Solutions" selectedCount={selectedRows.size} onAction={(action) => {
            if (action === 'mass_delete') handleBulkDelete();
          }} />
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar Filters */}
        <DataTableFilters
          entity="Solutions"
          fields={solutionFields}
          onReset={() => {
            setSearch('');
            setStatusFilter('all');
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
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={t('placeholders.search')}
                  className="pl-9 h-8 text-[13px] border-none bg-transparent focus-visible:ring-0 shadow-none font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 border-none bg-transparent shadow-none text-xs font-bold text-slate-600 focus:ring-0">
                  <SelectValue placeholder={t('placeholders.allStatus')} />
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-xl border-slate-200">
                  <SelectItem value="all" className="text-xs font-medium">{t('statuses.all')}</SelectItem>
                  <SelectItem value="Draft" className="text-xs font-medium">{t('statuses.draft')}</SelectItem>
                  <SelectItem value="Published" className="text-xs font-medium">{t('statuses.published')}</SelectItem>
                  <SelectItem value="Review" className="text-xs font-medium">{t('statuses.review')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            <Table className="border-collapse">
              <TableHeader className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-10 pl-4 h-10">
                    <Checkbox
                      checked={solutions.length > 0 && selectedRows.size === solutions.length}
                      onCheckedChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                  </TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.solutionId')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.title')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">{t('fields.status')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.productName')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.owner')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">{t('fields.createdTime')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-slate-50">
                      <TableCell colSpan={7} className="h-10 p-0">
                        <div className="h-10 w-full bg-white animate-pulse border-b border-slate-50" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : solutions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center p-8">
                        <BookOpen className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-[14px] font-bold text-slate-900">{t('noSolutions')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  solutions.map((sol) => (
                    <TableRow
                      key={sol.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => toggleSelectRow(sol.id)}
                    >
                      <TableCell className="pl-4 h-10 w-10 p-0" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(sol.id)}
                          onCheckedChange={() => toggleSelectRow(sol.id)}
                          className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                        />
                      </TableCell>
                      <TableCell className="px-5 font-mono text-sm text-accent">
                        <Link href={`/support/solutions/${sol.id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                          {sol.solutionNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-[13px] font-bold text-slate-900">
                        {sol.title}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tight ${statusColors[sol.status] ?? 'bg-slate-100 text-slate-700'}`}>
                          {t(`statuses.${sol.status.toLowerCase()}`) || sol.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-[13px] text-slate-700">{sol.product?.name ?? '—'}</TableCell>
                      <TableCell className="px-4 py-2 text-[13px] text-slate-700">{sol.owner.firstName} {sol.owner.lastName}</TableCell>
                      <TableCell className="px-4 py-2 text-[12px] text-slate-500 font-medium text-right">
                        {format(new Date(sol.createdAt), 'MM/dd/yyyy hh:mm a')}
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
          </div>
        </div>
      )}
    </div>
  );
}
