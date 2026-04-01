'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Activity, ActivityType, ActivityStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { Plus, Search, Phone, Mail, Calendar, CheckSquare, Filter, LayoutGrid, List as ListIcon, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import DataTableFilters from '@/components/tables/DataTableFilters';
import MassActionsMenu from '@/components/tables/MassActionsMenu';

export default function ActivitiesPage() {
  const t = useTranslations('activities');
  const tCommon = useTranslations('common');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/activities', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setActivities(data.data);
        setSelectedRows(new Set());
      } else {
        setError(data.error || tCommon('errorFailed'));
      }
    } catch (err) {
      setError(tCommon('error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const matchesSearch = a.title?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || a.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [activities, search, typeFilter, statusFilter]);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.CALL: return <Phone className="w-3.5 h-3.5 text-blue-500" />;
      case ActivityType.EMAIL: return <Mail className="w-3.5 h-3.5 text-indigo-500" />;
      case ActivityType.MEETING: return <Calendar className="w-3.5 h-3.5 text-emerald-500" />;
      case ActivityType.TASK: return <CheckSquare className="w-3.5 h-3.5 text-amber-500" />;
      default: return null;
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredActivities.length && filteredActivities.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredActivities.map(a => a.id)));
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
      const res = await fetch(`/api/activities?ids=${ids}`, { method: 'DELETE' });
      if (res.ok) fetchActivities();
    } catch (e) { console.error(e); }
  };

  const activityFields = [
    { id: 'title', label: t('subject') },
    { id: 'type', label: t('activityType') },
    { id: 'status', label: t('status') },
    { id: 'dueDate', label: t('dueDate') },
    { id: 'priority', label: t('priority') },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50">
      {/* Page Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('title')}</h1>
          <div className="h-6 w-[1px] bg-slate-200" />
          <p className="text-sm text-slate-500 font-medium">{filteredActivities.length} {t('title')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/activities/new">
            <Button className="h-8 px-4 bg-primary hover:bg-primary/90 text-white shadow-sm font-bold text-xs rounded-md">
              {t('newActivity')}
            </Button>
          </Link>
          <MassActionsMenu entity="Activities" selectedCount={selectedRows.size} onAction={(action) => {
            import('@/components/tables/massActionsHandlers').then(mod => {
              const { handleMassAction } = mod;
              handleMassAction(action, 'Activities', selectedRows, activities as any[]);
            });
            if (action === 'mass_delete') handleBulkDelete();
          }} />
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar Filters */}
        <DataTableFilters
          entity="Activities"
          fields={activityFields}
          onReset={() => {
            setSearch('');
            setTypeFilter('all');
            setStatusFilter('all');
          }}
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
                  placeholder={tCommon('searchPlaceholder')}
                  className="pl-9 h-8 text-[13px] border-none bg-transparent focus-visible:ring-0 shadow-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-8 border-none bg-transparent shadow-none text-xs font-bold text-slate-600 focus:ring-0">
                  <Filter className="mr-2 h-3.5 w-3.5 text-slate-500" />
                  <SelectValue placeholder={t('activityType')} />
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-xl border-slate-200">
                  <SelectItem value="all" className="text-xs font-medium">{tCommon('all')}</SelectItem>
                  {Object.values(ActivityType).map(type => (
                    <SelectItem key={type} value={type} className="text-xs font-medium">
                      {t(`types.${type.toLowerCase()}`) || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Table Container */}
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
                      checked={filteredActivities.length > 0 && selectedRows.size === filteredActivities.length}
                      onCheckedChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                  </TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('subject')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('activityType')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('status')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('dueDate')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">{tCommon('modified_time')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-slate-50">
                      <TableCell colSpan={6} className="h-10 p-0">
                        <div className="h-10 w-full bg-white animate-pulse border-b border-slate-50" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center p-8">
                        <p className="text-[14px] font-bold text-slate-900">{tCommon('noRecordsFound')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity) => (
                    <TableRow
                      key={activity.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => toggleSelectRow(activity.id)}
                    >
                      <TableCell className="pl-4 h-10 p-0" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(activity.id)}
                          onCheckedChange={() => toggleSelectRow(activity.id)}
                          className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-2 text-[13px] font-medium text-blue-600 hover:underline">
                        <Link href={`/activities/${activity.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                          {getActivityIcon(activity.type)}
                          {activity.title}
                        </Link>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-[13px] text-slate-700 capitalize">{t(`types.${activity.type.toLowerCase()}`) || activity.type}</TableCell>
                      <TableCell className="px-4 py-2 text-[13px]">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-tight ${activity.status === ActivityStatus.COMPLETED ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                          {t(`statuses.${activity.status.toLowerCase()}`) || activity.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-[13px] text-slate-700">
                        {activity.dueDate ? format(new Date(activity.dueDate), 'MM/dd/yyyy') : '-'}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-[12px] text-slate-500 font-medium text-right">
                        {format(new Date(activity.updatedAt || activity.createdAt), 'MM/dd/yyyy hh:mm a')}
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
            <Button className="bg-primary hover:bg-primary/90 text-white h-8 px-5 text-[12px] font-bold rounded-full shadow-lg shadow-primary/20">
              {t('bulk.bulkUpdate')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
