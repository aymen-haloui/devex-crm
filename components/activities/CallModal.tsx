'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    Phone,
    Clock,
    User,
    Save,
    ShieldCheck,
    MessageSquare,
    PhoneCall,
    Target,
    ClipboardCheck,
    Calendar as CalendarIcon
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

interface CallModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    mode: 'schedule' | 'log';
}

export default function CallModal({ isOpen, onClose, onSuccess, mode }: CallModalProps) {
    const t = useTranslations('activities');
    const tCommon = useTranslations('common');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        callType: 'outbound',
        callPurpose: 'prospecting',
        callResult: '',
        duration: '',
        scheduledDate: '',
        description: '',
        relatedToId: '',
        relatedToType: 'contact',
    });

    useEffect(() => {
        if (isOpen) {
            setForm(prev => ({
                ...prev,
                title: mode === 'schedule' ? 'Call scheduled' : 'Call logged',
                scheduledDate: new Date().toISOString().slice(0, 16)
            }));
        }
    }, [isOpen, mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    type: ActivityType.CALL,
                    status: mode === 'schedule' ? ActivityStatus.OPEN : ActivityStatus.COMPLETED,
                    duration: form.duration ? parseInt(form.duration) : null,
                }),
            });

            if (res.ok) {
                onSuccess();
            } else {
                alert(tCommon('error'));
            }
        } catch (error) {
            console.error('Error with call record:', error);
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
                            <ShieldCheck className="w-5 h-5 text-indigo-500" />
                            {mode === 'schedule' ? t('scheduleACall_modal') : t('logACall_modal')}
                        </DialogTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('communicationEngine')}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-xl" onClick={onClose}>
                        <X className="w-4 h-4 text-slate-400" />
                    </Button>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Call Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                {t('subject')} <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                className="h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-bold focus:ring-2 focus:ring-indigo-500/10"
                                placeholder={t('callSubjectPlaceholder')}
                                value={form.title}
                                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('callType')}</label>
                            <Select value={form.callType} onValueChange={(v) => setForm(f => ({ ...f, callType: v }))}>
                                <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-xl p-1">
                                    <SelectItem value="outbound" className="rounded-xl font-bold py-2">Outbound</SelectItem>
                                    <SelectItem value="inbound" className="rounded-xl font-bold py-2">Inbound</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('callPurpose')}</label>
                            <Select value={form.callPurpose} onValueChange={(v) => setForm(f => ({ ...f, callPurpose: v }))}>
                                <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-xl p-1">
                                    <SelectItem value="prospecting" className="rounded-xl font-bold py-2">{t('prospecting')}</SelectItem>
                                    <SelectItem value="administrative" className="rounded-xl font-bold py-2">{t('administrative')}</SelectItem>
                                    <SelectItem value="negotiation" className="rounded-xl font-bold py-2">{t('negotiation')}</SelectItem>
                                    <SelectItem value="demo" className="rounded-xl font-bold py-2">{t('demo')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator className="bg-slate-50" />

                    {/* Timeline Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" /> {t('callStartTime')}
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
                                <Clock className="w-3 h-3" /> {t('durationSeconds')}
                            </label>
                            <Input
                                type="number"
                                className="h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-bold"
                                placeholder="..."
                                value={form.duration}
                                onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))}
                            />
                        </div>
                    </div>

                    <Separator className="bg-slate-50" />

                    {/* Result and Description */}
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('callResult')}</label>
                            <Input
                                className="h-11 rounded-2xl border-slate-200 bg-white font-bold"
                                placeholder={t('callResultPlaceholder')}
                                value={form.callResult}
                                onChange={(e) => setForm(f => ({ ...f, callResult: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" /> {t('callAgenda')}
                            </label>
                            <Textarea
                                className="min-h-[100px] rounded-2xl border-slate-200 p-4 font-medium italic text-slate-600 focus:ring-indigo-500/10"
                                placeholder={t('callAgendaPlaceholder')}
                                value={form.description}
                                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                            />
                        </div>
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
                        <Save className="w-4 h-4" />
                        {loading ? tCommon('loading') : mode === 'schedule' ? t('scheduleCall') : t('saveCallRecord')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
