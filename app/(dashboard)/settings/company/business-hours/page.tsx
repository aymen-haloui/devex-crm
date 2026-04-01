'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, CalendarDays } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

type ScheduleRow = {
    day: string;
    enabled: boolean;
    start: string;
    end: string;
};

type BusinessHoursProfile = {
    id: string;
    name: string;
    weekStartsOn: string;
    timezone: string;
    schedule: ScheduleRow[];
};

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function buildSchedule(type: string): ScheduleRow[] {
    return DAY_NAMES.map((day, index) => {
        if (type === '24x7') {
            return { day, enabled: true, start: '00:00', end: '23:59' };
        }

        if (type === '24x5') {
            return {
                day,
                enabled: index < 5,
                start: '00:00',
                end: '23:59',
            };
        }

        const saturday = index === 5;
        const sunday = index === 6;

        return {
            day,
            enabled: !sunday,
            start: saturday ? '09:00' : '08:30',
            end: saturday ? '13:00' : '17:30',
        };
    });
}

export default function BusinessHoursPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [hoursType, setHoursType] = useState('24x5');
    const [weekStartsOn, setWeekStartsOn] = useState('monday');
    const [profiles, setProfiles] = useState<BusinessHoursProfile[]>([
        {
            id: 'default-business-hours',
            name: 'Algiers HQ Business Hours',
            weekStartsOn: 'monday',
            timezone: 'Africa/Algiers',
            schedule: buildSchedule('custom'),
        },
    ]);

    const handleCreateProfile = () => {
        setProfiles((current) => [
            {
                id: `business-hours-${current.length + 1}`,
                name: hoursType === 'custom' ? 'Custom Support Hours' : hoursType === '24x7' ? 'Always On Coverage' : 'Weekday Coverage',
                weekStartsOn,
                timezone: 'Africa/Algiers',
                schedule: buildSchedule(hoursType),
            },
            ...current,
        ]);
        setIsOpen(false);
    };

    return (
        <div className="p-8">

            {/* Header Row */}
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h2 className="text-[15px] font-bold text-slate-800">Business hours</h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xl">
                        Business hours define the normal working hours of your organization. Set business hours so that your employees know that their activities are carried out on the normal working hours of your organization.
                    </p>
                </div>
                <Button
                    className="h-8 text-xs font-semibold rounded-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 shadow-sm flex items-center gap-1.5 shrink-0"
                    onClick={() => setIsOpen(true)}
                >
                    <Plus className="w-3.5 h-3.5" />
                    New Business Hours
                </Button>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,2fr)_360px]">
                <div className="space-y-4">
                    {profiles.map((profile) => (
                        <div key={profile.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">{profile.name}</h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Week starts on {profile.weekStartsOn}. Timezone: {profile.timezone}
                                    </p>
                                </div>
                                <div className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                                    Active
                                </div>
                            </div>

                            <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
                                {profile.schedule.map((row) => (
                                    <div key={`${profile.id}-${row.day}`} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-slate-800">{row.day}</p>
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${row.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                                {row.enabled ? 'Open' : 'Closed'}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">
                                            {row.enabled ? `${row.start} - ${row.end}` : 'No coverage'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200">
                            <CalendarDays className="h-5 w-5 text-slate-700" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Coverage summary</h3>
                            <p className="text-xs text-slate-500">Demo schedules are preloaded so SLA and routing settings can be tested immediately.</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        <div className="rounded-xl bg-white p-4 border border-slate-200">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Primary support window</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">Monday to Friday, 08:30 - 17:30</p>
                        </div>
                        <div className="rounded-xl bg-white p-4 border border-slate-200">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Weekend escalation</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">Saturday, 09:00 - 13:00</p>
                        </div>
                        <div className="rounded-xl bg-white p-4 border border-slate-200">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Timezone</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">Africa/Algiers</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Business Hours Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-slate-200">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50">
                        <DialogTitle className="text-sm font-bold text-slate-800">Create Business hours</DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-6 bg-white">
                        <div className="flex items-start gap-4 mb-6">
                            <label className="text-xs font-semibold text-slate-600 w-28 shrink-0 pt-0.5">
                                Business hours
                            </label>
                            <div className="space-y-2.5">
                                {[
                                    { id: '24x7', label: '24 hours 7 days' },
                                    { id: '24x5', label: '24 hours 5 days' },
                                    { id: 'custom', label: 'Custom hours' },
                                ].map((opt) => (
                                    <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer group">
                                        <div
                                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${hoursType === opt.id
                                                    ? 'border-indigo-600 bg-indigo-600'
                                                    : 'border-slate-300 bg-white group-hover:border-indigo-400'
                                                }`}
                                            onClick={() => setHoursType(opt.id)}
                                        >
                                            {hoursType === opt.id && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-700 font-medium select-none">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="text-xs font-semibold text-slate-600 w-28 shrink-0">
                                Week starts on it
                            </label>
                            <Select value={weekStartsOn} onValueChange={setWeekStartsOn}>
                                <SelectTrigger className="h-7 text-xs border-slate-200 w-40 rounded-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                        <SelectItem key={day} value={day.toLowerCase()}>{day}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="h-7 text-xs px-5 border-slate-300 font-semibold text-slate-700 rounded-sm bg-white hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateProfile}
                            className="h-7 text-xs px-6 rounded-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
