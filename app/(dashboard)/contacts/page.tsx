'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Contact } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus, Search, SlidersHorizontal, RefreshCw, FileText, Filter, MoreHorizontal, ChevronRight, Mail, Phone, MapPin, Building2, UserPlus,
  Loader2, Download, Users, ArrowUpDown, List, LayoutGrid
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
import { format } from 'date-fns';
import DataTableFilters from '@/components/tables/DataTableFilters';
import MassActionsMenu from '@/components/tables/MassActionsMenu';

interface Meta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

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

const getStatusBadge = (status: string, t: any) => {
  const norm = (status || 'active').toLowerCase();
  switch (norm) {
    case 'active':
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none rounded-md px-2 py-0.5 shadow-none font-medium">{t('statuses.active')}</Badge>;
    case 'inactive':
      return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200 border-none rounded-md px-2 py-0.5 shadow-none font-medium">{t('statuses.inactive')}</Badge>;
    case 'lead':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none rounded-md px-2 py-0.5 shadow-none font-medium">{t('statuses.lead')}</Badge>;
    case 'customer':
      return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-none rounded-md px-2 py-0.5 shadow-none font-medium">{t('statuses.customer')}</Badge>;
    default:
      return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200 border-none rounded-md px-2 py-0.5 shadow-none font-medium capitalize">{status}</Badge>;
  }
};

export default function ContactsPage() {
  const t = useTranslations('contacts');
  const tCommon = useTranslations('common');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 15, total: 0, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [advancedFilters, setAdvancedFilters] = useState<any>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchContacts = useCallback(async (page: number, search: string, advFilters?: any) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: meta.limit.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (search) params.append('search', search);

      if (advFilters) {
        if (advFilters.systemFilters) {
          advFilters.systemFilters.forEach((f: any) => {
            if (f.checked) params.append(`sys_${f.id}`, 'true');
          });
        }
        if (advFilters.fieldFilters) {
          advFilters.fieldFilters.forEach((f: any) => {
            params.append(`filter_${f.id}`, 'true');
          });
        }
      }

      const response = await fetch(`/api/contacts?${params.toString()}`, { credentials: 'include' });
      const data = await response.json();

      if (response.ok && data.success) {
        setContacts(data.data);
        setMeta(data.meta);
        setSelectedRows(new Set()); // reset selection on new data
      } else {
        setError(data.error || 'Failed to fetch contacts');
      }
    } catch (err) {
      setError('An error occurred while fetching contacts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [meta.limit]);

  useEffect(() => {
    fetchContacts(1, debouncedSearch, advancedFilters);
  }, [debouncedSearch, advancedFilters, fetchContacts]);

  const handlePageChange = (newPage: number) => {
    fetchContacts(newPage, debouncedSearch, advancedFilters);
  };

  const allSelected = useMemo(
    () => contacts.length > 0 && selectedRows.size === contacts.length,
    [contacts.length, selectedRows.size]
  );

  const toggleSelectAll = () => {
    if (allSelected && contacts.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(contacts.map((c) => c.id)));
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

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    try {
      const res = await fetch(`/api/contacts?ids=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchContacts(meta.page, debouncedSearch);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedRows.size;
    if (!confirm(tCommon('deleteConfirmBatch', { count }))) return;
    try {
      const ids = Array.from(selectedRows).join(',');
      const res = await fetch(`/api/contacts?ids=${ids}`, { method: 'DELETE' });
      if (res.ok) {
        fetchContacts(1, debouncedSearch);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const contactFields = [
    { id: 'firstName', label: t('fields.firstName') },
    { id: 'lastName', label: t('fields.lastName') },
    { id: 'email', label: t('fields.email') },
    { id: 'phone', label: t('fields.phone') },
    { id: 'jobTitle', label: t('fields.jobTitle') },
    { id: 'department', label: t('fields.department') },
    { id: 'source', label: t('fields.source') },
    { id: 'status', label: t('fields.status') },
    { id: 'city', label: t('fields.city') },
    { id: 'country', label: t('fields.country') },
  ];

  const tMass = useTranslations('common.mass_actions');

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50">
      {/* Page Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('title')}</h1>
          {!loading && (
            <>
              <div className="h-6 w-[1px] bg-slate-200" />
              <p className="text-sm text-slate-500 font-medium">{meta.total} {t('title')}</p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/contacts/new">
            <Button className="h-8 px-4 shadow-sm font-bold text-xs rounded-md">
              {t('createContact')}
            </Button>
          </Link>
          <MassActionsMenu entity={t('title')} entityType="contacts" selectedCount={selectedRows.size} onAction={(action) => {
            import('@/components/tables/massActionsHandlers').then(mod => {
              const { handleMassAction } = mod;
              handleMassAction(action, t('title'), selectedRows, contacts as any[]);
            });
            if (action === 'mass_delete') handleBulkDelete();
          }} />
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar Filters */}
        <DataTableFilters
          entity={t('title')}
          fields={contactFields}
          onReset={() => {
            setSearchQuery('');
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
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  className="ps-9 h-8 text-[13px] border-none bg-transparent focus-visible:ring-0 shadow-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 border-none bg-transparent shadow-none text-xs font-bold text-slate-600 focus:ring-0">
                  <Filter className="mr-2 h-3.5 w-3.5 text-slate-500" />
                  <SelectValue placeholder={tCommon('filter')} />
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-xl border-slate-200">
                  <SelectItem value="all" className="text-xs font-medium">{t('statuses.all')}</SelectItem>
                  <SelectItem value="active" className="text-xs font-medium">{t('statuses.active')}</SelectItem>
                  <SelectItem value="inactive" className="text-xs font-medium">{t('statuses.inactive')}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Table Container - Flat Devex Style */}
          <div className="flex-1 overflow-auto">
            {error && (
              <div className="m-4 p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 font-medium text-center">
                {error}
              </div>
            )}
            <Table className="border-collapse">
              <TableHeader className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-10 pl-4 h-10">
                    <Checkbox
                      checked={contacts.length > 0 && selectedRows.size === contacts.length}
                      onCheckedChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                  </TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-800">
                      {t('fields.firstName')} {t('fields.lastName')} <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.email')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.phone')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.jobTitle')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.accountId')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.status')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('fields.createdAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-slate-50">
                      <TableCell colSpan={8} className="h-10 p-0">
                        <div className="h-10 w-full bg-white animate-pulse border-b border-slate-50" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : contacts.length === 0 && !error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center p-8">
                        <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                          <Search className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-[14px] font-bold text-slate-900">{t('noContacts')}</p>
                        <p className="text-[13px] text-slate-500">{t('noContactsDescription')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  contacts.map((contact) => (
                    <TableRow
                      key={contact.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => toggleSelectRow(contact.id)}
                    >
                      <TableCell className="pl-4 h-10 w-10 p-0" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(contact.id)}
                          onCheckedChange={() => toggleSelectRow(contact.id)}
                          className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-2 text-[13px] font-medium text-primary hover:underline">
                        {contact.firstName} {contact.lastName}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-[13px] text-slate-700">{contact.email}</TableCell>
                      <TableCell className="px-4 py-2 text-[13px] text-slate-700">{contact.phone || '-'}</TableCell>
                      <TableCell className="px-4 py-2 text-[13px] text-slate-700">{contact.title || '-'}</TableCell>
                      <TableCell className="px-4 py-2 text-[13px] text-slate-700">{contact.accountId || '-'}</TableCell>
                      <TableCell className="px-4 py-2 text-[13px]">
                        {getStatusBadge(contact.status || 'Active', t)}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-[12px] text-slate-500 font-medium">
                        {format(new Date(contact.createdAt), 'MM/dd/yyyy hh:mm a')}
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
              <span>{tCommon('totalCount')}: {meta.total}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[12px] font-bold text-slate-400 mr-2">{tCommon('pageOf', { page: meta.page, total: Math.ceil(meta.total / meta.limit) })}</span>
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
          <span className="text-[13px] font-bold tracking-tight">{tMass('selected', { count: selectedRows.size })}</span>
          <div className="h-4 w-[1px] bg-slate-700 mx-1" />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 h-8 px-4 text-[12px] font-bold rounded-full"
              onClick={() => setSelectedRows(new Set())}
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
