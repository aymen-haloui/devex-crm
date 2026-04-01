'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, CheckCircle2, XCircle, Clock, ArrowLeft, RotateCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkflowHistoryPage() {
    const router = useRouter();
    const [executions, setExecutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/workflows/history');
            const json = await res.json();
            if (json.success) setExecutions(json.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success':
            case 'completed':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Completed</Badge>;
            case 'failed':
                return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Failed</Badge>;
            case 'pending':
            case 'active':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Processing</Badge>;
            default:
                return <Badge variant="outline" className="flex items-center gap-1 w-fit">{status}</Badge>;
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/workflows')} className="text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Execution History</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Audit log of all automated workflow runs.</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchHistory} disabled={loading}>
                        <RotateCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="py-4 px-6 font-bold text-slate-600 text-[11px] uppercase tracking-wider">Workflow Name</TableHead>
                            <TableHead className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">Trigger Type</TableHead>
                            <TableHead className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">Target ID</TableHead>
                            <TableHead className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">Status</TableHead>
                            <TableHead className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">Execution Date</TableHead>
                            <TableHead className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">Message</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell colSpan={6} className="h-16 bg-slate-50/10" />
                                </TableRow>
                            ))
                        ) : executions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-slate-400">
                                    <Play className="w-10 h-10 mx-auto opacity-10 mb-2" />
                                    <p className="text-sm font-medium">No workflow executions found</p>
                                </TableCell>
                            </TableRow>
                        ) : executions.map((exec) => (
                            <TableRow key={exec.id} className="hover:bg-slate-50/50">
                                <TableCell className="px-6 py-4">
                                    <p className="font-semibold text-slate-900">{exec.workflow?.name}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">ID: {exec.id.slice(-8)}</p>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase tracking-wider">{exec.workflow?.triggerType}</span>
                                </TableCell>
                                <TableCell className="font-mono text-[11px] text-slate-600">{exec.targetId || '-'}</TableCell>
                                <TableCell>{getStatusBadge(exec.status)}</TableCell>
                                <TableCell className="text-sm text-slate-500 font-medium">
                                    {new Date(exec.createdAt).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-xs text-slate-600 max-w-[200px] truncate" title={exec.message}>
                                    {exec.message || 'Workflow executed successfully'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
