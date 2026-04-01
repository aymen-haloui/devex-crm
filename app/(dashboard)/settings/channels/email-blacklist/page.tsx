'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Shield, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

type BlacklistEntry = {
    id: string;
    email: string;
    reason?: string | null;
    source: string;
    createdAt: string;
};

export default function EmailBlacklistPage() {
    const [entries, setEntries] = useState<BlacklistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [form, setForm] = useState({ email: '', reason: '' });
    const [saving, setSaving] = useState(false);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('email', search);
            const res = await fetch(`/api/email-blacklist?${params}`, { credentials: 'include' });
            const json = await res.json();
            if (json.success) setEntries(json.data);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const t = setTimeout(fetch_, 300);
        return () => clearTimeout(t);
    }, [fetch_]);

    const handleAdd = async () => {
        if (!form.email.trim()) return;
        setSaving(true);
        try {
            const res = await fetch('/api/email-blacklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: form.email, reason: form.reason || null }),
            });
            const json = await res.json();
            if (json.success) {
                toast.success(`${form.email} added to blacklist`);
                setCreateOpen(false);
                setForm({ email: '', reason: '' });
                fetch_();
            } else {
                toast.error(json.error || 'Failed to add');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full flex flex-col">
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Email Blacklist</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Emails in this list will never receive campaign messages.</p>
                </div>
                <Button
                    className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                    onClick={() => setCreateOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Email
                </Button>
            </div>

            <div className="p-6 space-y-4">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by email..."
                        className="pl-9 bg-white border-slate-200 h-10 rounded-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-b border-slate-100">
                                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-widest py-4 px-5">Email</TableHead>
                                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-widest">Reason</TableHead>
                                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-widest">Source</TableHead>
                                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-widest">Added</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={4} className="h-14 bg-slate-50/50" />
                                    </TableRow>
                                ))
                            ) : entries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Shield className="w-10 h-10 text-slate-200" />
                                            <p className="text-slate-500 font-medium">Blacklist is empty</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : entries.map((e) => (
                                <TableRow key={e.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                    <TableCell className="px-5 font-medium text-slate-900">{e.email}</TableCell>
                                    <TableCell className="text-sm text-slate-500">{e.reason || '—'}</TableCell>
                                    <TableCell>
                                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 capitalize">
                                            {e.source}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500">{new Date(e.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-[380px] rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Add to Blacklist</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Email Address *</label>
                            <Input
                                type="email"
                                placeholder="user@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="border-slate-200"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Reason (optional)</label>
                            <Input
                                placeholder="e.g. Unsubscribed, Spam complaint"
                                value={form.reason}
                                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                className="border-slate-200"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 font-bold"
                            onClick={handleAdd}
                            disabled={saving || !form.email.trim()}
                        >
                            {saving ? 'Adding...' : 'Add to Blacklist'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
