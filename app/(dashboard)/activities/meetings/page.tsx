'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Clock,
  Calendar,
  User,
  Filter,
  ChevronRight,
  Loader2,
  MapPin,
  Video,
  Users,
  MoreHorizontal,
  ArrowUpDown,
  CheckCircle2,
  LayoutGrid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
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
import MeetingModal from '@/components/activities/MeetingModal';
import DataTableFilters from '@/components/tables/DataTableFilters';
import MassActionsMenu from '@/components/tables/MassActionsMenu';

export default function MeetingsPage() {
  const router = useRouter();
  const t = useTranslations('activities');
  const [meetings, setMeetings] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/activities?type=meeting&limit=100');
      const json = await res.json();
      if (json.success) {
        setMeetings(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const filteredMeetings = useMemo(() => {
    return meetings.filter(m =>
      m.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [meetings, search]);

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredMeetings.length && filteredMeetings.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredMeetings.map(m => m.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const handleBulkDelete = async () => {
    if (!confirm(t('deleteMeetingsConfirm', { count: selectedRows.size }))) return;
    try {
      const ids = Array.from(selectedRows).join(',');
      const res = await fetch(`/api/activities?ids=${ids}`, { method: 'DELETE' });
      if (res.ok) fetchMeetings();
    } catch (e) {
      console.error('Failed to delete meetings:', e);
    }
  };

  const meetingFields = [
    { id: 'title', label: t('meetingTitle') },
    { id: 'status', label: t('status') },
    { id: 'scheduledDate', label: t('scheduledDate') },
    { id: 'location', label: t('location') },
    { id: 'venue', label: t('venue') },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('syncingMeetings')}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50">
      {/* Page Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{t(`types.meeting`)}</h1>
          <div className="h-6 w-[1px] bg-slate-200" />
          <p className="text-sm text-slate-500 font-medium">{t('meetingsCount', { count: filteredMeetings.length })}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="h-8 px-4 bg-primary hover:bg-primary/90 text-white shadow-sm font-bold text-xs rounded-md"
            onClick={() => setIsModalOpen(true)}
          >
            {t('createMeeting')}
          </Button>
          <MassActionsMenu entity="Meetings" selectedCount={selectedRows.size} onAction={(action) => {
            import('@/components/tables/massActionsHandlers').then(mod => {
              const { handleMassAction } = mod;
              handleMassAction(action, 'Meetings', selectedRows, meetings as any[]);
            });
            if (action === 'mass_delete') handleBulkDelete();
          }} />
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar Filters */}
        <DataTableFilters
          entity="Meetings"
          fields={meetingFields}
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
                  placeholder={t('filterMeetings')}
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
                      checked={filteredMeetings.length > 0 && selectedRows.size === filteredMeetings.length}
                      onCheckedChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                  </TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider rtl:text-right">{t('meetingTitle')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider rtl:text-right">{t('fromTo')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider rtl:text-right">{t('location')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider rtl:text-right">{t('relateTo')}</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right rtl:text-left">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center p-8">
                        <Calendar className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-[14px] font-bold text-slate-900">{t('noMeetings')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMeetings.map((meeting) => (
                    <TableRow
                      key={meeting.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => toggleSelectRow(meeting.id)}
                    >
                      <TableCell className="pl-4 h-10 p-0" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(meeting.id)}
                          onCheckedChange={() => toggleSelectRow(meeting.id)}
                          className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-bold text-blue-600 hover:underline transition-colors" onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/activities/${meeting.id}`);
                          }}>
                            {meeting.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-400 capitalize">{t(`statuses.${meeting.status.toLowerCase()}`) || meeting.status}</span>
                            {meeting.status === ActivityStatus.COMPLETED && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{meeting.scheduledDate ? format(new Date(meeting.scheduledDate), 'MMM d, HH:mm') : '-'}</span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-400 pl-5">{t('to')} {meeting.dueDate ? format(new Date(meeting.dueDate), 'HH:mm') : '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 rtl:flex-row-reverse">
                            {meeting.venue === 'online' ? <Video className="w-3.5 h-3.5 text-blue-400" /> : <MapPin className="w-3.5 h-3.5 text-rose-400" />}
                            <span>{meeting.location || t('notSpecified')}</span>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter pl-5 rtl:pl-0 rtl:pr-5 italic">{meeting.venue || t('noVenue')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{meeting.relatedToType ? t(`types.${meeting.relatedToType.toLowerCase()}`) || meeting.relatedToType : t('internal')}</span>
                            <span className="text-[9px] font-bold text-slate-400">{meeting.relatedToId || t('systemEvent')}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm">
                              <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-slate-100 p-1">
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2 rtl:flex-row-reverse" onClick={() => router.push(`/activities/${meeting.id}`)}>
                              {t('viewDetails')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2 text-rose-600 rtl:flex-row-reverse">
                              {t('cancelMeeting')}
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

      <MeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchMeetings();
        }}
      />
    </div>
  );
}
