'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Plus, Search, Filter, Book, MoreHorizontal, RefreshCw, ChevronRight, Loader2,
  Calendar, Tag, ArrowUpDown, Percent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import DataTableFilters from '@/components/tables/DataTableFilters';
import MassActionsMenu from '@/components/tables/MassActionsMenu';
import { PriceBook } from '@/types';

export default function PriceBooksPage() {
  const router = useRouter();
  const [priceBooks, setPriceBooks] = useState<PriceBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const limit = 50;

  const fetchPriceBooks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      const res = await fetch(`/api/inventory/price-books?${params}`);
      const data = await res.json();
      if (data.success) {
        setPriceBooks(data.data);
        setTotal(data.meta.total || data.data.length);
      }
    } catch {
      toast.error('Failed to load price books');
    } finally {
      setLoading(false);
    }
  }, [page, search, limit]);

  useEffect(() => {
    fetchPriceBooks();
  }, [fetchPriceBooks]);

  const filteredPriceBooks = useMemo(() => {
    return priceBooks.filter(pb =>
      pb.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [priceBooks, search]);

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredPriceBooks.length && filteredPriceBooks.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredPriceBooks.map(pb => pb.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedRows.size} price books?`)) return;
    try {
      const ids = Array.from(selectedRows).join(',');
      const res = await fetch(`/api/inventory/price-books/bulk?ids=${ids}`, { method: 'DELETE' });
      if (res.ok) fetchPriceBooks();
    } catch (e) {
      console.error('Failed to delete price books:', e);
    }
  };

  const priceBookFields = [
    { id: 'name', label: 'Name' },
    { id: 'pricingModel', label: 'Pricing Model' },
    { id: 'active', label: 'Active Status' },
    { id: 'ownerId', label: 'Owner' },
  ];

  if (loading && priceBooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Optimizing pricing strategies...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50">
      {/* Page Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Price Books</h1>
          <div className="h-6 w-[1px] bg-slate-200" />
          <p className="text-sm text-slate-500 font-medium">{total} Books</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="h-8 px-4 shadow-sm font-bold text-xs rounded-md" onClick={() => router.push('/inventory/price-books/new')}>
            New Price Book
          </Button>
          <MassActionsMenu entity="Price Books" selectedCount={selectedRows.size} onAction={(action) => {
            import('@/components/tables/massActionsHandlers').then(mod => {
              const { handleMassAction } = mod;
              handleMassAction(action, 'Price Books', selectedRows, priceBooks as any[]);
            });
            if (action === 'mass_delete') handleBulkDelete();
          }} />
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar Filters */}
        <DataTableFilters
          entity="Price Books"
          fields={priceBookFields}
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
                  placeholder="Find a price book..."
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
                      checked={filteredPriceBooks.length > 0 && selectedRows.size === filteredPriceBooks.length}
                      onCheckedChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Book Strategy</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pricing Logic</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Status</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned Owner</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPriceBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center p-8">
                        <Book className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-[14px] font-bold text-slate-900">No Strategy Records Found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPriceBooks.map(pb => (
                    <tr
                      key={pb.id}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer border-b border-slate-50"
                      onClick={() => toggleSelectRow(pb.id)}
                    >
                      <td className="pl-4 h-10 p-0" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(pb.id)}
                          onCheckedChange={() => toggleSelectRow(pb.id)}
                          className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5" onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/inventory/price-books/${pb.id}`);
                        }}>
                          <span className="text-[13px] font-bold text-blue-600 hover:underline">{pb.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight line-clamp-1">{pb.description || 'No description provided'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-indigo-50/30 text-indigo-600 border-indigo-100 font-bold uppercase text-[9px] px-2 py-0.5 rounded-lg">
                          {pb.pricingModel}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {pb.active ? (
                          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black uppercase text-[10px] tracking-widest px-2.5 py-0.5 rounded-full shadow-none border">Active</Badge>
                        ) : (
                          <Badge className="bg-slate-50 text-slate-500 border-slate-100 font-black uppercase text-[10px] tracking-widest px-2.5 py-0.5 rounded-full shadow-none border">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 uppercase">
                            {pb.owner?.firstName?.[0]}{pb.owner?.lastName?.[0]}
                          </div>
                          <span className="text-[12px] font-bold text-slate-600 truncate">{pb.owner?.firstName} {pb.owner?.lastName}</span>
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
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2" onClick={() => router.push(`/inventory/price-books/${pb.id}`)}>
                              Edit Pricing
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2">
                              Bulk Update
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2">
                              Export as CSV
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2 text-rose-600">
                              Archive Book
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
              <span>{Math.min(filteredPriceBooks.length, limit)} of {total} Price Books</span>
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
