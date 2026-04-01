'use client';

import React, { useState } from 'react';
import {
    X,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Video,
    User,
    Users,
    ChevronDown,
    Save,
    ShieldCheck,
    Globe
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ActivityStatus, ActivityType } from '@/types';
import { useTranslations } from 'next-intl';

interface MeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function MeetingModal({ isOpen, onClose, onSuccess }: MeetingModalProps) {
    const t = useTranslations('activities');
    const tCommon = useTranslations('common');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        location: '',
        venue: 'client_location',
        allDay: false,
        scheduledDate: '',
        dueDate: '',
        description: '',
        relatedToId: '',
        relatedToType: 'contact',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    type: ActivityType.MEETING,
                    status: ActivityStatus.OPEN,
                }),
            });

            if (res.ok) {
                onSuccess();
            } else {
                alert(tCommon('error'));
            }
        } catch (error) {
            console.error('Error creating meeting:', error);
            alert(tCommon('error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white">
                <DialogHeader className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
                    <div>
                        <DialogTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-500" /> {t('meetingInformation')}
                        </DialogTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('highImpactEvent')}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-xl" onClick={onClose}>
                        <X className="w-4 h-4 text-slate-400" />
                    </Button>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Primary Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                {t('subject')} <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                className="h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-bold focus:ring-2 focus:ring-indigo-500/10 placeholder:font-medium"
                                placeholder={t('subjectPlaceholder')}
                                value={form.title}
                                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('meetingVenue')}</label>
                            <Select value={form.venue} onValueChange={(v) => setForm(f => ({ ...f, venue: v }))}>
                                <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-xl p-1">
                                    <SelectItem value="client_location" className="rounded-xl font-bold py-2"><MapPin className="w-3.5 h-3.5 inline mr-2 text-rose-500" /> {t('clientLocation')}</SelectItem>
                                    <SelectItem value="online" className="rounded-xl font-bold py-2"><Video className="w-3.5 h-3.5 inline mr-2 text-blue-500" /> {t('onlineMeeting')}</SelectItem>
                                    <SelectItem value="office" className="rounded-xl font-bold py-2"><Globe className="w-3.5 h-3.5 inline mr-2 text-emerald-500" /> {t('hqOffice')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tCommon('fields.location')}</label>
                            <Input
                                className="h-11 rounded-2xl border-slate-200 bg-white font-bold"
                                placeholder={t('locationPlaceholder')}
                                value={form.location}
                                onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                            />
                        </div>
                    </div>

                    <Separator className="bg-slate-50" />

                    {/* Time Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {t('scheduledFrom')}
                            </label>
                            <Input
                                type="datetime-local"
                                className="h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-bold"
                                value={form.scheduledDate}
                                onChange={(e) => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {t('scheduledTo')}
                            </label>
                            <Input
                                type="datetime-local"
                                className="h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-bold"
                                value={form.dueDate}
                                onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <Separator className="bg-slate-50" />

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tCommon('fields.description')}</label>
                        <Textarea
                            className="min-h-[100px] rounded-2xl border-slate-200 p-4 font-medium italic text-slate-600 focus:ring-indigo-500/10"
                            placeholder={t('meetingDescriptionPlaceholder')}
                            value={form.description}
                            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                        />
                    </div>
                </form>

                <DialogFooter className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex-row gap-2 justify-end">
                    <Button variant="ghost" className="font-bold rounded-xl text-slate-500" onClick={onClose}>
                        {tCommon('cancel')}
                    </Button>
                    <Button
                        className="bg-primary hover:bg-primary/90 text-white font-bold px-8 rounded-xl shadow-lg shadow-primary/20 gap-2"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        <Save className="w-4 h-4" /> {loading ? tCommon('loading') : t('createMeeting')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
