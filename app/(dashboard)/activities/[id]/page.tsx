'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityStatus, ActivityType } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';

type ActivityRecord = {
  id: string;
  type: ActivityType;
  title: string;
  description?: string | null;
  status: ActivityStatus;
  dueDate?: string | null;
  scheduledDate?: string | null;
};

export default function ActivityDetailPage() {
  const t = useTranslations('activities');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const id = String((params as any).id || '');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [activity, setActivity] = useState<ActivityRecord | null>(null);
  const [form, setForm] = useState<Partial<ActivityRecord>>({});

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/activities/${id}`, { credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || t('errorLoad'));
        return;
      }
      setActivity(data.data);
      setForm({
        ...data.data,
        dueDate: data.data.dueDate ? String(data.data.dueDate).slice(0, 10) : '',
        scheduledDate: data.data.scheduledDate ? String(data.data.scheduledDate).slice(0, 16) : '',
      });
    } catch {
      setError(t('errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const save = async () => {
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dueDate: form.dueDate ? form.dueDate : null,
          scheduledDate: form.scheduledDate ? form.scheduledDate : null,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || t('errorUpdate'));
        return;
      }
      setActivity(data.data);
      setEditing(false);
    } catch {
      alert(t('errorUpdate'));
    }
  };

  const remove = async () => {
    const ok = confirm(t('deleteConfirm'));
    if (!ok) return;
    try {
      const response = await fetch(`/api/activities/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || t('errorDelete'));
        return;
      }
      router.push('/activities');
    } catch {
      alert(t('errorDelete'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        <Link href="/activities">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('backTo')}
          </Button>
        </Link>
      </div>
    );
  }

  if (!activity) return <div>{t('notFound')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/activities">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{activity.title}</h1>
            <p className="text-slate-600">{t(`types.${activity.type.toLowerCase()}`) || activity.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button onClick={save}>{tCommon('save')}</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                {tCommon('cancel')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                {tCommon('edit')}
              </Button>
              <Button variant="destructive" onClick={remove}>
                {tCommon('delete')}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('detailTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('activityType')}</label>
            <Select
              value={String(form.type ?? '')}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v as ActivityType }))}
              disabled={!editing}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ActivityType).map((tVal) => (
                  <SelectItem key={tVal} value={tVal}>
                    {t(`types.${tVal.toLowerCase()}`) || tVal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('status')}</label>
            <Select
              value={String(form.status ?? '')}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v as ActivityStatus }))}
              disabled={!editing}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ActivityStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`statuses.${s.toLowerCase()}`) || s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">{t('subject')}</label>
            <Input
              value={String(form.title ?? '')}
              readOnly={!editing}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">{t('description')}</label>
            <Textarea
              value={String(form.description ?? '')}
              readOnly={!editing}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('dueDate')}</label>
            <Input
              type="date"
              value={String(form.dueDate ?? '')}
              readOnly={!editing}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('scheduled')}</label>
            <Input
              type="datetime-local"
              value={String(form.scheduledDate ?? '')}
              readOnly={!editing}
              onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

