'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ArrowLeft, Settings2, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type CustomField = {
    id: string;
    key: string;
    label: string;
    fieldType: string;
    isRequired: boolean;
    options?: any;
};

export default function ModuleFieldsPage() {
    const { moduleName } = useParams();
    const router = useRouter();
    const [fields, setFields] = useState<CustomField[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        label: '',
        key: '',
        fieldType: 'text',
        isRequired: false,
    });

    const fetchFields = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/custom-fields?entityType=${moduleName}`);
            const json = await res.json();
            if (json.success) setFields(json.data);
        } finally {
            setLoading(false);
        }
    }, [moduleName]);

    useEffect(() => {
        fetchFields();
    }, [fetchFields]);

    const handleCreate = async () => {
        if (!form.label || !form.key) return;
        setSaving(true);
        try {
            const res = await fetch('/api/custom-fields', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    entityType: moduleName,
                    ...form,
                }),
            });
            const json = await res.json();
            if (json.success) {
                toast.success('Custom field added');
                setIsAddOpen(false);
                setForm({ label: '', key: '', fieldType: 'text', isRequired: false });
                fetchFields();
            } else {
                toast.error(json.error || 'Failed to add field');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight capitalize">{moduleName} Fields</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage standard and custom fields for this module.</p>
                </div>
                <Button className="ml-auto bg-indigo-600 hover:bg-indigo-700 font-bold" onClick={() => setIsAddOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Custom Field
                </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="py-4 px-6 font-bold text-slate-600 text-[11px] uppercase tracking-wider">Field Label</TableHead>
                            <TableHead className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">API Name (Key)</TableHead>
                            <TableHead className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">Data Type</TableHead>
                            <TableHead className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">Required</TableHead>
                            <TableHead className="text-right px-6"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell colSpan={5} className="h-16 bg-slate-50/20" />
                                </TableRow>
                            ))
                        ) : fields.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <Settings2 className="w-8 h-8 opacity-20" />
                                        <p className="text-sm font-medium">No custom fields found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : fields.map((field) => (
                            <TableRow key={field.id} className="hover:bg-slate-50/50">
                                <TableCell className="px-6 py-4 font-semibold text-slate-900">{field.label}</TableCell>
                                <TableCell className="font-mono text-[12px] text-slate-600 font-medium bg-slate-100/50 px-2 py-1 rounded inline-block mt-3">{field.key}</TableCell>
                                <TableCell>
                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded capitalize">{field.fieldType}</span>
                                </TableCell>
                                <TableCell>
                                    {field.isRequired ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="text-slate-300">-</span>}
                                </TableCell>
                                <TableCell className="text-right px-6">
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>New Custom Field</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Field Label</label>
                            <Input
                                placeholder="e.g. Preferred Contact Time"
                                value={form.label}
                                onChange={(e) => {
                                    const label = e.target.value;
                                    const key = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                                    setForm({ ...form, label, key });
                                }}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">API Name (Key)</label>
                            <Input
                                placeholder="preferred_contact_time"
                                value={form.key}
                                onChange={(e) => setForm({ ...form, key: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Data Type</label>
                            <Select value={form.fieldType} onValueChange={(v) => setForm({ ...form, fieldType: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">Single Line Text</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="boolean">Checkbox</SelectItem>
                                    <SelectItem value="select">Pick List</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isRequired"
                                checked={form.isRequired}
                                onChange={(e) => setForm({ ...form, isRequired: e.target.checked })}
                                className="rounded border-slate-300"
                            />
                            <label htmlFor="isRequired" className="text-sm font-medium text-slate-700">Mark as Required</label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button disabled={saving} onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 font-bold">
                            {saving ? 'Saving...' : 'Save Field'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
