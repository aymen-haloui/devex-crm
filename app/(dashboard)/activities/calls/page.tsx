'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Clock,
  Phone,
  PhoneOutgoing,
  PhoneIncoming,
  User,
  Filter,
  Loader2,
  Calendar,
  ArrowUpDown,
  CheckCircle2,
  MessageSquare,
  ChevronDown,
  LayoutGrid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Activity, ActivityStatus, ActivityType } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from 'next-intl';
import CallModal from '@/components/activities/CallModal';
import DataTableFilters from '@/components/tables/DataTableFilters';
import MassActionsMenu from '@/components/tables/MassActionsMenu';

export default function CallsPage() {
  const router = useRouter();
  const t = useTranslations('activities');
  const [calls, setCalls] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'schedule' | 'log'>('schedule');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const fetchCalls = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/activities?type=call&limit=100');
      const json = await res.json();
      if (json.success) {
        setCalls(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch calls:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const filteredCalls = useMemo(() => {
    return calls.filter(c =>
      (c.title?.toLowerCase() || c.subject?.toLowerCase() || '').includes(search.toLowerCase())
    );
  }, [calls, search]);

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredCalls.length && filteredCalls.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredCalls.map(c => c.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const handleBulkDelete = async () => {
    if (!confirm(t('deleteCallsConfirm', { count: selectedRows.size }))) return;
    try {
      const ids = Array.from(selectedRows).join(',');
      const res = await fetch(`/api/activities?ids=${ids}`, { method: 'DELETE' });
      if (res.ok) fetchCalls();
    } catch (e) {
      console.error('Failed to delete calls:', e);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const callFields = [
    { id: 'subject', label: t('subject') },
    { id: 'callType', label: t('callType') },
    { id: 'callResult', label: t('callResult') },
    { id: 'scheduledDate', label: t('callStartTime') },
    { id: 'duration', label: t('duration') },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('gatheringCalls')}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50">
      {/* Page Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{t(`types.call`)}s</h1>
          <div className="h-6 w-[1px] bg-slate-200" />
          <p className="text-sm text-slate-500 font-medium">{t('callsCount', { count: filteredCalls.length })}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Button
              className="h-8 px-4 bg-primary hover:bg-primary/90 text-white shadow-sm font-bold text-xs rounded-l-md"
              onClick={() => {
                setModalMode('schedule');
                setIsModalOpen(true);
              }}
            >
              {t('scheduleCall')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-8 px-2 bg-primary hover:bg-primary/90 text-white border-l border-white/20 rounded-r-md shadow-sm">
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-lg shadow-xl border-slate-100 p-1">
                <DropdownMenuItem className="rounded-md font-bold text-xs py-2" onClick={() => {
                  setModalMode('log');
                  setIsModalOpen(true);
                }}>
                  {t('logCall')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <MassActionsMenu entity="Calls" selectedCount={selectedRows.size} onAction={(action) => {
            import('@/components/tables/massActionsHandlers').then(mod => {
              const { handleMassAction } = mod;
              handleMassAction(action, 'Calls', selectedRows, calls as any[]);
            });
            if (action === 'mass_delete') handleBulkDelete();
          }} />
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar Filters */}
        <DataTableFilters
          entity="Calls"
          fields={callFields}
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
                  placeholder={t('filterCalls')}
                  className="pl-9 h-8 text-[13px] border-none bg-transparent focus-visible:ring-0 shadow-none rtl:text-right"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-10 pl-4 h-10">
                    <Checkbox
                      checked={filteredCalls.length > 0 && selectedRows.size === filteredCalls.length}
                      onCheckedChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                  </TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider rtl:text-right">{t('subject')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider rtl:text-right">{t('callType')} / {t('callResult')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider rtl:text-right">{t('callStartTime')} / {t('duration')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider rtl:text-right">{t('relateTo')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right rtl:text-left">{t('owner')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center p-8">
                        <Phone className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-[14px] font-bold text-slate-900">{t('noCalls')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCalls.map((call) => (
                    <TableRow
                      key={call.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => toggleSelectRow(call.id)}
                    >
                      <TableCell className="pl-4 h-10 p-0" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(call.id)}
                          onCheckedChange={() => toggleSelectRow(call.id)}
                          className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-bold text-blue-600 hover:underline transition-colors" onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/activities/${call.id}`);
                          }}>
                            {call.title || call.subject}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-400 capitalize">{t(`statuses.${call.status.toLowerCase()}`) || call.status}</span>
                            {call.status === ActivityStatus.COMPLETED && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center",
                            call.callType === 'inbound' ? "bg-blue-50 text-blue-600" : "bg-indigo-50 text-indigo-600"
                          )}>
                            {call.callType === 'inbound' ? <PhoneIncoming className="w-3.5 h-3.5" /> : <PhoneOutgoing className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{call.callType || t(`types.call`)}</span>
                            <span className="text-[9px] font-bold text-slate-400">{call.callResult || t('noResult')}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{call.scheduledDate ? format(new Date(call.scheduledDate), 'MMM d, HH:mm') : '-'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 pl-5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{t('duration')}:</span>
                            <span className="text-[9px] font-bold text-slate-500">{formatDuration(call.duration)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{call.relatedToType ? t(`types.${call.relatedToType.toLowerCase()}`) || call.relatedToType : t('internal')}</span>
                            <span className="text-[9px] font-bold text-slate-400">{call.relatedToId || t('systemRecord')}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex flex-col items-end">
                            <span className="text-[11px] font-bold text-slate-900">{t('host')}</span>
                            <span className="text-[9px] font-medium text-slate-400">{t('owner')}</span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm">
                                <MoreHorizontal className="w-4 h-4 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-slate-100 p-1">
                              <DropdownMenuItem className="rounded-lg font-bold text-xs py-2 rtl:flex-row-reverse" onClick={() => router.push(`/activities/${call.id}`)}>
                                {t('viewLogs')}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg font-bold text-xs py-2 text-rose-600 rtl:flex-row-reverse">
                                {t('deleteRecord')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
          <span className="text-[13px] font-bold tracking-tight">{t('bulk.selected', { count: selectedRows.size })}</span>
          <div className="h-4 w-[1px] bg-slate-700 mx-1" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" className="text-white hover:bg-white/10 h-8 px-4 text-[12px] font-bold rounded-full" onClick={() => setSelectedRows(new Set())}>
              {t('bulk.deselectAll')}
            </Button>
            <Button variant="ghost" className="text-rose-400 hover:bg-rose-900/40 h-8 px-4 text-[12px] font-bold rounded-full" onClick={handleBulkDelete}>
              {t('bulk.delete')}
            </Button>
          </div>
        </div>
      )}

      <CallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchCalls();
        }}
      />
    </div>
  );
}
