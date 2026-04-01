'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Circle,
  User,
  Filter,
  LayoutGrid,
  List,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Activity, ActivityStatus, ActivityType } from '@/types';
import DataTableFilters from '@/components/tables/DataTableFilters';
import MassActionsMenu from '@/components/tables/MassActionsMenu';

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high': return 'bg-rose-50 text-rose-700 border-rose-100';
    case 'medium': return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'low': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    default: return 'bg-slate-50 text-slate-700 border-slate-100';
  }
};

export default function TasksKanbanPage() {
  const router = useRouter();
  const t = useTranslations('activities');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const columns = [
    { id: 'open', title: t('statuses.not_started'), color: 'slate' },
    { id: 'deferred', title: t('statuses.deferred'), color: 'amber' },
    { id: 'in_progress', title: t('statuses.in_progress'), color: 'indigo' },
    { id: 'completed', title: t('statuses.completed'), color: 'emerald' },
    { id: 'waiting_for_input', title: t('statuses.waiting_for_input'), color: 'rose' },
  ];

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/activities?type=task&limit=100');
      const json = await res.json();
      if (json.success) {
        setActivities(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = useMemo(() => {
    return activities.filter(tVal =>
      tVal.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [activities, search]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json.success) {
        setActivities(prev => prev.map(a => a.id === id ? { ...a, status: status as ActivityStatus } : a));
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(t('deleteTasksConfirm', { count: selectedRows.size }))) return;
    try {
      const ids = Array.from(selectedRows).join(',');
      const res = await fetch(`/api/activities?ids=${ids}`, { method: 'DELETE' });
      if (res.ok) fetchTasks();
    } catch (e) {
      console.error('Failed to delete tasks:', e);
    }
  };

  const taskFields = [
    { id: 'title', label: t('taskName') },
    { id: 'status', label: t('status') },
    { id: 'priority', label: t('priority') },
    { id: 'dueDate', label: t('dueDate') },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('loadingTasks')}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50">
      {/* Page Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('tasksWorkbench')}</h1>
          <div className="h-6 w-[1px] bg-slate-200" />
          <p className="text-sm text-slate-500 font-medium">{t('tasksCount', { count: filteredTasks.length })}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="h-8 px-4 bg-primary hover:bg-primary/90 text-white shadow-sm font-bold text-xs rounded-md"
            onClick={() => router.push('/activities/new?type=task')}
          >
            {t('createTask')}
          </Button>
          <MassActionsMenu entity="Tasks" selectedCount={selectedRows.size} onAction={(action) => {
            import('@/components/tables/massActionsHandlers').then(mod => {
              const { handleMassAction } = mod;
              handleMassAction(action, 'Tasks', selectedRows, activities as any[]);
            });
            if (action === 'mass_delete') handleBulkDelete();
          }} />
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar Filters */}
        <DataTableFilters
          entity="Tasks"
          fields={taskFields}
          onReset={() => setSearch('')}
          onApply={(f) => console.log('Applying filters:', f)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
          {/* Internal Toolbar */}
          <div className="h-12 px-4 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 w-full max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={t('filterTasks')}
                  className="pl-9 h-8 text-[13px] border-none bg-transparent focus-visible:ring-0 shadow-none w-full rtl:text-right"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <LayoutGrid className="h-4 w-4 text-accent" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => router.push('/activities?type=TASK')}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Kanban Board Container */}
          <div className="flex-1 overflow-x-auto p-6">
            <div className="flex gap-6 min-h-full">
              {columns.map((col) => {
                const tasksInCol = filteredTasks.filter(task => task.status === col.id);
                return (
                  <div key={col.id} className="flex-shrink-0 w-80 flex flex-col gap-4 group/col">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-${col.color}-500 shadow-[0_0_8px] shadow-${col.color}-500/40`} />
                        <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t(`statuses.${col.id}`) || col.title}</h2>
                        <span className="text-[10px] bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded-md font-bold">{tasksInCol.length}</span>
                      </div>
                    </div>

                    <div className="flex-1 bg-slate-100/40 rounded-xl border border-dashed border-slate-200 p-2 space-y-3">
                      {tasksInCol.map((task) => (
                        <Card
                          key={task.id}
                          className={`border-none shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer bg-white ${selectedRows.has(task.id) ? 'ring-2 ring-accent' : ''}`}
                          onClick={() => router.push(`/activities/${task.id}`)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Badge className={`rounded-sm px-1.5 py-0 text-[9px] font-black uppercase tracking-tighter border-none ${getPriorityColor(task.priority)}`}>
                                {task.priority ? t(task.priority.toLowerCase()) || task.priority : t('normal')}
                              </Badge>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={selectedRows.has(task.id)}
                                  onChange={() => {
                                    const next = new Set(selectedRows);
                                    if (next.has(task.id)) next.delete(task.id);
                                    else next.add(task.id);
                                    setSelectedRows(next);
                                  }}
                                  className="h-3 w-3 rounded border-slate-300 accent-accent"
                                />
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="w-5 h-5 rounded-md">
                                      <MoreVertical className="w-3 h-3 text-slate-400" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-40 rounded-lg shadow-xl border-slate-100 p-1">
                                    {columns.filter(c => c.id !== task.status).map(c => (
                                      <DropdownMenuItem
                                        key={c.id}
                                        className="rounded-md font-bold text-[10px] gap-2 py-1.5"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateStatus(task.id, c.id);
                                        }}
                                      >
                                        {t('moveTo')} {t(`statuses.${c.id}`) || c.title}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            <h3 className="text-[13px] font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors mb-3">
                              {task.title}
                            </h3>

                            <div className="space-y-2">
                              {task.dueDate && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                  <Clock className="w-3 h-3" />
                                  <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-1">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                                    <User className="w-2.5 h-2.5 text-slate-400" />
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase">{t('team')}</span>
                                </div>
                                <div className="inline-block h-4 w-4 rounded-full ring-1 ring-white bg-accent flex items-center justify-center text-[7px] text-white font-black">AM</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {tasksInCol.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-24 opacity-20 border-2 border-dashed border-slate-200 rounded-lg m-1">
                          <Circle className="w-6 h-6 text-slate-300 mb-1" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
    </div>
  );
}
