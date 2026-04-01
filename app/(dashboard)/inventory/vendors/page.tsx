'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Plus, Search, Building2, Phone, Mail, Globe, RefreshCw, Edit, Trash2, MoreHorizontal, ChevronDown, ChevronRight, Settings2, Download,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Vendor } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import DataTableFilters from '@/components/tables/DataTableFilters';
import MassActionsMenu from '@/components/tables/MassActionsMenu';

export default function VendorsPage() {
  const t = useTranslations('inventory.vendors');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const limit = 50;

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      const res = await fetch(`/api/inventory/vendors?${params}`);
      const data = await res.json();
      if (data.success) {
        setVendors(data.data);
        setTotal(data.meta.total);
      }
    } catch {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  }, [page, search, limit]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const filteredVendors = useMemo(() => {
    return vendors.filter(v =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [vendors, search]);

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredVendors.length && filteredVendors.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredVendors.map(v => v.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedRows.size} vendors?`)) return;
    try {
      const ids = Array.from(selectedRows).join(',');
      const res = await fetch(`/api/inventory/vendors/bulk?ids=${ids}`, { method: 'DELETE' });
      if (res.ok) fetchVendors();
    } catch (e) {
      console.error('Failed to delete vendors:', e);
    }
  };

  const vendorFields = [
    { id: 'name', label: 'Vendor Name' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'category', label: 'Category' },
    { id: 'website', label: 'Website' },
  ];

  if (loading && vendors.length === 0) {
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Vendors</h1>
          <div className="h-6 w-[1px] bg-slate-200" />
          <p className="text-sm text-slate-500 font-medium">{total} Vendors</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="h-8 px-4 shadow-sm font-bold text-xs rounded-md" onClick={() => router.push('/inventory/vendors/new')}>
            {tCommon('create', { entity: t('single') })}
          </Button>
          <MassActionsMenu entity="Vendors" selectedCount={selectedRows.size} onAction={(action) => {
            import('@/components/tables/massActionsHandlers').then(mod => {
              const { handleMassAction } = mod;
              handleMassAction(action, 'Vendors', selectedRows, vendors as any[]);
            });
            if (action === 'mass_delete') handleBulkDelete();
          }} />
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar Filters */}
        <DataTableFilters
          entity="Vendors"
          fields={vendorFields}
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
                  placeholder="Find a vendor..."
                  className="pl-9 h-8 text-[13px] border-none bg-transparent focus-visible:ring-0 shadow-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-10 bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="w-10 pl-4 py-3">
                    <Checkbox
                      checked={filteredVendors.length > 0 && selectedRows.size === filteredVendors.length}
                      onCheckedChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vendor Info</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact Details</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Business Presence</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Owner</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center p-8">
                        <Building2 className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-[14px] font-bold text-slate-900">No Partnerships Found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map(vendor => (
                    <tr
                      key={vendor.id}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer border-b border-slate-50"
                      onClick={() => toggleSelectRow(vendor.id)}
                    >
                      <td className="pl-4 h-10 p-0" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(vendor.id)}
                          onCheckedChange={() => toggleSelectRow(vendor.id)}
                          className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5" onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/inventory/vendors/${vendor.id}`);
                        }}>
                          <span className="text-[13px] font-bold text-primary hover:underline">{vendor.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">ID: {vendor.id.substring(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {vendor.email && (
                            <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {vendor.email}
                            </div>
                          )}
                          {vendor.phone && (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                              <Phone className="w-3.5 h-3.5" />
                              {vendor.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {vendor.website ? (
                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 w-fit">
                            <Globe className="w-3 h-3 text-indigo-500" />
                            <span className="text-[11px] font-bold text-slate-700 truncate max-w-[150px]">{vendor.website}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-300 italic">No web presence</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 uppercase">
                            {vendor.owner?.firstName?.[0]}{vendor.owner?.lastName?.[0]}
                          </div>
                          <span className="text-[12px] font-bold text-slate-600 truncate">{vendor.owner?.firstName} {vendor.owner?.lastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm">
                              <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-100 p-1">
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2" onClick={() => router.push(`/inventory/vendors/${vendor.id}`)}>
                              Vendor Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2">
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2 text-rose-600">
                              Terminate Partnership
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
              <span>{Math.min(filteredVendors.length, limit)} of {total} Vendors</span>
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
                disabled={page * limit >= total}
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
