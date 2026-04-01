'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Repeat,
  User,
  Briefcase,
  Link as LinkIcon,
  ShieldCheck,
  FileText,
  Bell,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityStatus, ActivityType } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

export default function NewActivityPage() {
  const t = useTranslations('activities');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as ActivityType) || ActivityType.TASK;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: initialType,
    title: '',
    description: '',
    status: ActivityStatus.OPEN,
    priority: 'normal',
    dueDate: '',
    scheduledDate: '',
    remindAt: '',
    relatedToId: '',
    relatedToType: 'contact',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dueDate: form.dueDate || null,
          scheduledDate: form.scheduledDate || null,
          remindAt: form.remindAt || null,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || t('errorCreate'));
        setLoading(false);
        return;
      }

      router.push(form.type === ActivityType.TASK ? '/activities/tasks' : '/activities');
    } catch {
      alert(t('errorCreate'));
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      {/* Top Bar Navigation */}
      <div className="px-8 py-4 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5 text-slate-600 rtl:rotate-180" />
          </Button>
          <div className="rtl:text-right text-left">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{t('title_new', { type: t(`types.${form.type.toLowerCase()}`) })}</h1>
            <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{t('workbench', { type: t(`types.${form.type.toLowerCase()}`) })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rtl:flex-row-reverse">
          <Button variant="outline" className="h-9 px-4 border-slate-200 text-slate-600 font-bold rounded-xl" onClick={() => router.back()}>
            {t('cancel')}
          </Button>
          <Button
            className="h-9 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20"
            onClick={submit}
            disabled={loading}
          >
            {loading ? t('saving') : t('save', { type: t(`types.${form.type.toLowerCase()}`) })}
          </Button>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-8 max-w-5xl mx-auto w-full">
        {/* Information Grid */}
        <div className="grid grid-cols-1 gap-8">
          {/* Task Information Section */}
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 rtl:flex-row-reverse text-left rtl:text-right">
                <ShieldCheck className="w-4 h-4 text-indigo-500" /> {t('taskInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 rtl:flex-row-reverse text-left rtl:text-right">
                      {t('activityType')} <span className="text-rose-500">*</span>
                    </label>
                    <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as ActivityType }))}>
                      <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 font-bold focus:ring-indigo-500/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl p-1">
                        {Object.values(ActivityType).map((typeVal) => (
                          <SelectItem key={typeVal} value={typeVal} className="rounded-lg font-bold py-2 rtl:flex-row-reverse">
                            {t(`types.${typeVal.toLowerCase()}`).toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 rtl:flex-row-reverse text-left rtl:text-right">
                      {t('subject')} <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      className="h-10 rounded-xl border-slate-200 bg-white font-bold placeholder:font-medium transition-all focus:ring-2 focus:ring-indigo-500/10 rtl:text-right text-left"
                      placeholder={t('subjectPlaceholder')}
                      value={form.title}
                      onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 rtl:flex-row-reverse text-left rtl:text-right">
                      {t('priority')}
                    </label>
                    <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
                      <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 font-bold focus:ring-indigo-500/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl p-1">
                        <SelectItem value="high" className="rounded-lg font-bold py-2 text-rose-600 rtl:flex-row-reverse">{t('high')}</SelectItem>
                        <SelectItem value="normal" className="rounded-lg font-bold py-2 text-slate-600 rtl:flex-row-reverse">{t('normal')}</SelectItem>
                        <SelectItem value="low" className="rounded-lg font-bold py-2 text-emerald-600 rtl:flex-row-reverse">{t('low')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 rtl:flex-row-reverse text-left rtl:text-right">
                      {t('status')}
                    </label>
                    <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as ActivityStatus }))}>
                      <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 font-bold focus:ring-indigo-500/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl p-1">
                        {Object.values(ActivityStatus).map((s) => (
                          <SelectItem key={s} value={s} className="rounded-lg font-bold py-2 rtl:flex-row-reverse">
                            {t(`statuses.${s.toLowerCase()}`).toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-50" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 rtl:flex-row-reverse text-left rtl:text-right">
                    <CalendarIcon className="w-3 h-3" /> {t('dueDate')}
                  </label>
                  <Input
                    type="date"
                    className="h-10 rounded-xl border-slate-200 bg-slate-50/50 font-bold focus:ring-indigo-500/10"
                    value={form.dueDate}
                    onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 rtl:flex-row-reverse text-left rtl:text-right">
                    <Bell className="w-3 h-3" /> {t('reminder')}
                  </label>
                  <Input
                    type="datetime-local"
                    className="h-10 rounded-xl border-slate-200 bg-slate-50/50 font-bold focus:ring-indigo-500/10"
                    value={form.remindAt}
                    onChange={(e) => setForm(f => ({ ...f, remindAt: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description and Associations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-2 border-none shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 rtl:flex-row-reverse text-left rtl:text-right">
                  <FileText className="w-4 h-4 text-emerald-500" /> {t('descriptionInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <Textarea
                  className="min-h-[160px] rounded-2xl border-slate-200 p-4 font-medium italic text-slate-600 focus:ring-indigo-500/10 transition-all rtl:text-right text-left"
                  placeholder={t('descriptionPlaceholder')}
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 rtl:flex-row-reverse text-left rtl:text-right">
                  <LinkIcon className="w-4 h-4 text-amber-500" /> {t('associations')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left rtl:text-right block">{t('relateTo')}</label>
                  <Select value={form.relatedToType} onValueChange={(v) => setForm(f => ({ ...f, relatedToType: v }))}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 font-bold rtl:flex-row-reverse">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold p-1">
                      <SelectItem value="contact" className="rounded-lg rtl:flex-row-reverse">{t('contact')}</SelectItem>
                      <SelectItem value="account" className="rounded-lg rtl:flex-row-reverse">{t('account')}</SelectItem>
                      <SelectItem value="deal" className="rounded-lg rtl:flex-row-reverse">{t('deal')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left rtl:text-right block">{t('recordId')}</label>
                  <Input
                    className="h-10 rounded-xl border-slate-200 bg-white font-bold placeholder:font-medium rtl:text-right text-left"
                    placeholder={t('recordIdPlaceholder')}
                    value={form.relatedToId}
                    onChange={(e) => setForm(f => ({ ...f, relatedToId: e.target.value }))}
                  />
                  <p className="text-[10px] text-slate-400 italic font-medium pt-1 text-left rtl:text-right">{t('linkHint')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
