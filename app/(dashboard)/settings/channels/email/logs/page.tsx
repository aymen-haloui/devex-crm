'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Filter, ArrowLeft, RotateCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EmailLogsPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/email-logs${search ? `?recipientEmail=${search}` : ''}`);
            const json = await res.json();
            if (json.success) {
                setLogs(json.data);
                setSummary(json.summary);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [search]);

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'sent': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Sent</Badge>;
            case 'delivered': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Delivered</Badge>;
            case 'opened': return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none">Opened</Badge>;
            case 'clicked': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">Clicked</Badge>;
            case 'bounced': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Bounced</Badge>;
            case 'failed': return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none">Failed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Email Logs</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Track every email sent through the system.</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
                        <RotateCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                {Object.entries(summary).map(([status, count]: [string, any]) => (
                    <div key={status} className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{status}</p>
                        <p className="text-xl font-bold text-slate-900 mt-1">{count}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search recipient email..."
                            className="pl-9 h-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" /> Filter
                    </Button>
                </div>

                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="py-4 px-6 font-bold text-slate-600 text-[11px] uppercase tracking-wider">Recipient</TableHead>
                            <TableHead className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">Campaign / Module</TableHead>
                            <TableHead className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">Status</TableHead>
                            <TableHead className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">Sent At</TableHead>
                            <TableHead className="font-bold text-slate-600 text-[11px] uppercase tracking-wider text-right">Activity</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell colSpan={5} className="h-16 bg-slate-50/10" />
                                </TableRow>
                            ))
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                                    <Mail className="w-8 h-8 mx-auto opacity-20 mb-2" />
                                    <p className="text-sm font-medium">No email logs found</p>
                                </TableCell>
                            </TableRow>
                        ) : logs.map((log) => (
                            <TableRow key={log.id} className="hover:bg-slate-50/50">
                                <TableCell className="px-6 py-4">
                                    <p className="font-medium text-slate-900">{log.recipientEmail}</p>
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm text-slate-600 font-medium">{log.campaign?.name || log.template?.name || 'System Email'}</p>
                                </TableCell>
                                <TableCell>{getStatusBadge(log.status)}</TableCell>
                                <TableCell className="text-sm text-slate-500 font-medium">
                                    {new Date(log.createdAt).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right px-6">
                                    <div className="flex flex-col items-end gap-1">
                                        {log.openedAt && <span className="text-[10px] text-indigo-600 font-bold">Opened: {new Date(log.openedAt).toLocaleTimeString()}</span>}
                                        {log.clickedAt && <span className="text-[10px] text-purple-600 font-bold">Clicked: {new Date(log.clickedAt).toLocaleTimeString()}</span>}
                                        {!log.openedAt && !log.clickedAt && <span className="text-[10px] text-slate-400">No activity</span>}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
