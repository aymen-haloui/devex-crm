'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEAL_STAGES } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type DealRecord = {
  id: string;
  name: string;
  value: number | string;
  probability: number;
  stage: string;
  expectedCloseDate?: string | null;
};

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String((params as any).id || '');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [deal, setDeal] = useState<DealRecord | null>(null);
  const [form, setForm] = useState<Partial<DealRecord>>({});

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/deals/${id}`, { credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to load deal');
        return;
      }
      setDeal(data.data);
      setForm({
        ...data.data,
        expectedCloseDate: data.data.expectedCloseDate ? String(data.data.expectedCloseDate).slice(0, 10) : '',
      });
    } catch {
      setError('Failed to load deal');
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
      const response = await fetch(`/api/deals/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          value: form.value !== undefined ? Number(form.value) : undefined,
          expectedCloseDate: form.expectedCloseDate ? form.expectedCloseDate : null,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || 'Failed to update deal');
        return;
      }
      setDeal(data.data);
      setEditing(false);
    } catch {
      alert('Failed to update deal');
    }
  };

  const remove = async () => {
    const ok = confirm('Delete this deal?');
    if (!ok) return;
    try {
      const response = await fetch(`/api/deals/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || 'Failed to delete deal');
        return;
      }
      router.push('/deals');
    } catch {
      alert('Failed to delete deal');
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
        <Link href="/deals">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Deals
          </Button>
        </Link>
      </div>
    );
  }

  if (!deal) return <div>Deal not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/deals">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{deal.name}</h1>
            <p className="text-slate-600">{deal.stage.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button onClick={save}>Save</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={remove}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deal Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={form.name ?? ''}
              readOnly={!editing}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Value</label>
            <Input
              type="number"
              value={String(form.value ?? '')}
              readOnly={!editing}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Probability (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={String(form.probability ?? '')}
              readOnly={!editing}
              onChange={(e) => setForm((f) => ({ ...f, probability: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Stage</label>
            <Select
              value={String(form.stage ?? '')}
              onValueChange={(v) => setForm((f) => ({ ...f, stage: v }))}
              disabled={!editing}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEAL_STAGES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Expected Close Date</label>
            <Input
              type="date"
              value={String(form.expectedCloseDate ?? '')}
              readOnly={!editing}
              onChange={(e) => setForm((f) => ({ ...f, expectedCloseDate: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

