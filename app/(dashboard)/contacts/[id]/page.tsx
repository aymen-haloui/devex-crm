'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ContactRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  title?: string | null;
  status: string;
  createdAt: string | Date;
};

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String((params as any).id || '');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [contact, setContact] = useState<ContactRecord | null>(null);
  const [form, setForm] = useState<Partial<ContactRecord>>({});

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/contacts/${id}`, { credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to load contact');
        return;
      }
      setContact(data.data);
      setForm(data.data);
    } catch {
      setError('Failed to load contact');
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
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || 'Failed to update contact');
        return;
      }
      setContact(data.data);
      setEditing(false);
    } catch {
      alert('Failed to update contact');
    }
  };

  const remove = async () => {
    const ok = confirm('Delete this contact?');
    if (!ok) return;
    try {
      const response = await fetch(`/api/contacts/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || 'Failed to delete contact');
        return;
      }
      router.push('/contacts');
    } catch {
      alert('Failed to delete contact');
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
        <Link href="/contacts">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Contacts
          </Button>
        </Link>
      </div>
    );
  }

  if (!contact) return <div>Contact not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/contacts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {contact.firstName} {contact.lastName}
            </h1>
            <p className="text-slate-600">{contact.title || '—'}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First name</label>
                  <Input
                    value={form.firstName ?? ''}
                    readOnly={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last name</label>
                  <Input
                    value={form.lastName ?? ''}
                    readOnly={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={form.email ?? ''}
                    readOnly={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={form.phone ?? ''}
                    readOnly={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={form.title ?? ''}
                    readOnly={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <span>{contact.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <a className="text-blue-600 hover:underline" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{contact.phone || '—'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

