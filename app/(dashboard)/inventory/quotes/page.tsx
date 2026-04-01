'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Plus, Search, Filter, FileText, MoreHorizontal, Building, User, Briefcase, RefreshCw, ChevronRight, Loader2,
  Calendar, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import DataTableFilters from '@/components/tables/DataTableFilters';
import MassActionsMenu from '@/components/tables/MassActionsMenu';

const STAGE_STYLE: Record<string, string> = {
  draft: 'bg-slate-50 text-slate-600 border-slate-200',
  negotiation: 'bg-amber-50 text-amber-700 border-amber-100',
  delivered: 'bg-blue-50 text-blue-700 border-blue-100',
  on_hold: 'bg-orange-50 text-orange-700 border-orange-100',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  closed_won: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  closed_lost: 'bg-rose-50 text-rose-700 border-rose-100',
};

export default function QuotesPage() {
  const t = useTranslations('inventory.quotes');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const limit = 50;

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      const res = await fetch(`/api/inventory/quotes?${params}`);
      const data = await res.json();
      if (data.success) {
        setQuotes(data.data);
        setTotal(data.meta.total);
      }
    } catch {
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  }, [page, search, limit]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const filteredQuotes = useMemo(() => {
    return quotes.filter(q =>
      q.subject.toLowerCase().includes(search.toLowerCase()) ||
      q.quoteNumber.toLowerCase().includes(search.toLowerCase())
    );
  }, [quotes, search]);

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredQuotes.length && filteredQuotes.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredQuotes.map(q => q.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedRows.size} quotes?`)) return;
    try {
      const ids = Array.from(selectedRows).join(',');
      const res = await fetch(`/api/inventory/quotes/bulk?ids=${ids}`, { method: 'DELETE' });
      if (res.ok) fetchQuotes();
    } catch (e) {
      console.error('Failed to delete quotes:', e);
    }
  };

  const quoteFields = [
    { id: 'subject', label: 'Subject' },
    { id: 'quoteNumber', label: 'Quote #' },
    { id: 'stage', label: 'Stage' },
    { id: 'grandTotal', label: 'Total Amount' },
    { id: 'accountName', label: 'Account' },
  ];

  if (loading && quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{tCommon('loading')}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50">
      {/* Page Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Quotes</h1>
          <div className="h-6 w-[1px] bg-slate-200" />
          <p className="text-sm text-slate-500 font-medium">{total} Quotes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="h-8 px-4 shadow-sm font-bold text-xs rounded-md" onClick={() => router.push('/inventory/quotes/new')}>
            {tCommon('create', { entity: t('single') })}
          </Button>
          <MassActionsMenu entity="Quotes" selectedCount={selectedRows.size} onAction={(action) => {
            import('@/components/tables/massActionsHandlers').then(mod => {
              const { handleMassAction } = mod;
              handleMassAction(action, 'Quotes', selectedRows, quotes as any[]);
            });
            if (action === 'mass_delete') handleBulkDelete();
          }} />
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar Filters */}
        <DataTableFilters
          entity="Quotes"
          fields={quoteFields}
          onReset={() => setSearch('')}
          onApply={(f) => console.log('Applying filters:', f)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Compact Toolbar */}
          <div className="h-12 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 w-full max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Find a quote..."
                  className="pl-9 h-8 text-[13px] border-none bg-transparent focus-visible:ring-0 shadow-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50/80 sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="w-10 pl-4 py-3">
                    <Checkbox
                      checked={filteredQuotes.length > 0 && selectedRows.size === filteredQuotes.length}
                      onCheckedChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Proposal Details</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stage & Status</th>
                  <th className="px-6 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Valuation</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Related To</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Owner</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center p-8">
                        <FileText className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-[14px] font-bold text-slate-900">No Proposal Records Found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.map(quote => (
                    <tr
                      key={quote.id}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer border-b border-slate-50"
                      onClick={() => toggleSelectRow(quote.id)}
                    >
                      <td className="pl-4 h-10 p-0" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(quote.id)}
                          onCheckedChange={() => toggleSelectRow(quote.id)}
                          className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5" onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/inventory/quotes/${quote.id}`);
                        }}>
                          <span className="text-[13px] font-bold text-primary hover:underline">{quote.subject}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{quote.quoteNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`text-[10px] font-bold tracking-tight uppercase border px-2 py-0.5 rounded-md shadow-none w-fit ${STAGE_STYLE[quote.stage?.toLowerCase().replace(/ /g, '_')] || 'bg-slate-50 text-slate-700'}`}>
                          {tCommon(`statuses.${quote.stage?.toLowerCase().replace(/ /g, '_')}`, { defaultValue: quote.stage })}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[14px] font-black text-slate-900">${Number(quote.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Est. Revenue</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {quote.account && (
                            <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
                              <Building className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-[150px]">{quote.account.name}</span>
                            </div>
                          )}
                          {quote.contact && (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                              <User className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[150px]">{quote.contact.firstName} {quote.contact.lastName}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 uppercase">
                            {quote.owner?.firstName?.[0]}{quote.owner?.lastName?.[0]}
                          </div>
                          <span className="text-[12px] font-bold text-slate-600 truncate">{quote.owner?.firstName} {quote.owner?.lastName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm">
                              <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-100 p-1">
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2" onClick={() => router.push(`/inventory/quotes/${quote.id}`)}>
                              Quote Summary
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2">
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2">
                              Convert to Invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2 text-rose-600">
                              Retract Quote
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="h-10 px-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
              <span>{Math.min(filteredQuotes.length, limit)} of {total} Quotes</span>
              <div className="h-3 w-[1px] bg-slate-300" />
              <div className="flex items-center gap-1">
                <span>Page</span>
                <span className="text-slate-900">{page}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md hover:bg-white shadow-none"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronRight className="w-4 h-4 text-slate-400 rotate-180" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md hover:bg-white shadow-none"
                disabled={page >= Math.ceil(total / limit)}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedRows.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-slate-900 text-white px-6 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-[13px] font-bold tracking-tight">{selectedRows.size} selected</span>
          <div className="h-4 w-[1px] bg-slate-700 mx-1" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" className="text-white hover:bg-white/10 h-8 px-4 text-[12px] font-bold rounded-full" onClick={() => setSelectedRows(new Set())}>
              Deselect All
            </Button>
            <Button variant="ghost" className="text-rose-400 hover:bg-rose-900/40 h-8 px-4 text-[12px] font-bold rounded-full" onClick={handleBulkDelete}>
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
