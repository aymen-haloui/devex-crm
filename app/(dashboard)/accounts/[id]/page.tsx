'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Building2, Globe, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type AccountRecord = {
  id: string;
  name: string;
  website?: string | null;
  industry?: string | null;
  type?: string | null;
  employees?: number | null;
  phone?: string | null;
  address?: string | null;
  status: string;
  createdAt: string | Date;
};

export default function AccountDetailPage() {
  const t = useTranslations('common');
  const tAccounts = useTranslations('accounts');
  const params = useParams();
  const router = useRouter();
  const id = String((params as any).id || '');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [account, setAccount] = useState<AccountRecord | null>(null);
  const [form, setForm] = useState<Partial<AccountRecord>>({});

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/accounts/${id}`, { credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || tAccounts('errorLoad'));
        return;
      }
      setAccount(data.data);
      setForm(data.data);
    } catch {
      setError(tAccounts('errorLoad'));
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
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || tAccounts('errorUpdate'));
        return;
      }
      setAccount(data.data);
      setEditing(false);
    } catch {
      alert(tAccounts('errorUpdate'));
    }
  };

  const remove = async () => {
    const ok = confirm(t('confirmDelete', { entity: tAccounts('single') }));
    if (!ok) return;
    try {
      const response = await fetch(`/api/accounts/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || tAccounts('errorDelete'));
        return;
      }
      router.push('/accounts');
    } catch {
      alert(tAccounts('errorDelete'));
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
        <Link href="/accounts">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Button>
        </Link>
      </div>
    );
  }

  if (!account) return <div>{tAccounts('notFound')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/accounts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{account.name}</h1>
            <p className="text-slate-600">{account.industry || '—'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button onClick={save}>{t('save')}</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                {t('cancel')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                {t('edit')}
              </Button>
              <Button variant="destructive" onClick={remove}>
                {t('delete')}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{tAccounts('sections.accountInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-left rtl:text-right">
                  <label className="text-sm font-medium">{tAccounts('fields.name')}</label>
                  <Input
                    value={form.name ?? ''}
                    readOnly={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 text-left rtl:text-right">
                  <label className="text-sm font-medium">{tAccounts('fields.website')}</label>
                  <Input
                    value={form.website ?? ''}
                    readOnly={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 text-left rtl:text-right">
                  <label className="text-sm font-medium">{tAccounts('fields.industry')}</label>
                  <Input
                    value={form.industry ?? ''}
                    readOnly={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 text-left rtl:text-right">
                  <label className="text-sm font-medium">{tAccounts('fields.type')}</label>
                  <Input
                    value={form.type ?? ''}
                    readOnly={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 text-left rtl:text-right">
                  <label className="text-sm font-medium">{tAccounts('fields.employees')}</label>
                  <Input
                    type="number"
                    value={String(form.employees ?? '')}
                    readOnly={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, employees: e.target.value ? Number(e.target.value) : null }))}
                  />
                </div>
                <div className="space-y-2 text-left rtl:text-right">
                  <label className="text-sm font-medium">{tAccounts('fields.phone')}</label>
                  <Input
                    value={form.phone ?? ''}
                    readOnly={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2 text-left rtl:text-right">
                  <label className="text-sm font-medium">{t('sections.address')}</label>
                  <Input
                    value={form.address ?? ''}
                    readOnly={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('overview')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span>{account.type || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-400" />
                {account.website ? (
                  <a className="text-blue-600 hover:underline" href={account.website} target="_blank" rel="noreferrer">
                    {account.website}
                  </a>
                ) : (
                  <span>—</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{account.phone || '—'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
