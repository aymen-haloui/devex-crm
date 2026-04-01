'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Layers, Search, Trash2 } from 'lucide-react';

type Segment = {
    id: string;
    name: string;
    entityType: string;
    description?: string | null;
    isActive: boolean;
    createdAt: string;
};

export default function SegmentsPage() {
    const [segments, setSegments] = useState<Segment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [entityFilter, setEntityFilter] = useState('all');
    const [createOpen, setCreateOpen] = useState(false);
    const [form, setForm] = useState({ name: '', entityType: 'contacts', description: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchSegments = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (entityFilter !== 'all') params.set('entityType', entityFilter);
            const res = await fetch(`/api/segments?${params}`, { credentials: 'include' });
            const json = await res.json();
            if (json.success) {
                const items = json.data as Segment[];
                setSegments(search
                    ? items.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
                    : items
                );
            }
        } finally {
            setLoading(false);
        }
    }, [entityFilter, search]);

    useEffect(() => {
        const t = setTimeout(fetchSegments, 250);
        return () => clearTimeout(t);
    }, [fetchSegments]);

    const handleCreate = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/segments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: form.name,
                    entityType: form.entityType,
                    description: form.description || null,
                    rulesJson: { conditions: [] },
                }),
            });
            const json = await res.json();
            if (json.success) {
                setCreateOpen(false);
                setForm({ name: '', entityType: 'contacts', description: '' });
                fetchSegments();
            } else {
                setError(json.error || 'Failed to create segment');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full flex flex-col bg-slate-50/50">
            <div className="px-6 py-5 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Segments</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Group contacts, leads, or accounts by shared properties.</p>
                </div>
                <Button
                    className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                    onClick={() => setCreateOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" /> New Segment
                </Button>
            </div>

            <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search segments..."
                            className="pl-9 bg-white border-slate-200 h-10 rounded-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={entityFilter} onValueChange={setEntityFilter}>
                        <SelectTrigger className="w-[160px] h-10 bg-white border-slate-200 rounded-xl font-medium text-slate-700">
                            <SelectValue placeholder="All Entities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Entities</SelectItem>
                            <SelectItem value="contacts">Contacts</SelectItem>
                            <SelectItem value="leads">Leads</SelectItem>
                            <SelectItem value="accounts">Accounts</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-b border-slate-100">
                                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-widest py-4 px-5">Name</TableHead>
                                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-widest">Entity</TableHead>
                                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-widest">Description</TableHead>
                                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-widest">Status</TableHead>
                                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-widest">Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={5} className="h-14 bg-slate-50/50" />
                                    </TableRow>
                                ))
                            ) : segments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Layers className="w-10 h-10 text-slate-200" />
                                            <p className="text-slate-500 font-medium">No segments found</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => setCreateOpen(true)}
                                            >
                                                Create your first segment
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : segments.map((seg) => (
                                <TableRow key={seg.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                    <TableCell className="px-5 font-semibold text-slate-900">{seg.name}</TableCell>
                                    <TableCell>
                                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 capitalize">
                                            {seg.entityType}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500">{seg.description || '—'}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${seg.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {seg.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500">{new Date(seg.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">New Segment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Segment Name *</label>
                            <Input
                                placeholder="e.g. High-Value Contacts"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="border-slate-200"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Entity Type</label>
                            <Select value={form.entityType} onValueChange={(v) => setForm({ ...form, entityType: v })}>
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="contacts">Contacts</SelectItem>
                                    <SelectItem value="leads">Leads</SelectItem>
                                    <SelectItem value="accounts">Accounts</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Description</label>
                            <Input
                                placeholder="Optional description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="border-slate-200"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 font-bold"
                            onClick={handleCreate}
                            disabled={saving || !form.name.trim()}
                        >
                            {saving ? 'Creating...' : 'Create Segment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
