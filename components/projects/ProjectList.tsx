'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, User, BadgeAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ProjectListProps {
    projects: any[];
    onEdit: (project: any) => void;
    onDelete: (id: string) => void;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'planning': return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Planning</Badge>;
        case 'in_progress': return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">In Progress</Badge>;
        case 'completed': return <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Completed</Badge>;
        case 'on_hold': return <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">On Hold</Badge>;
        case 'cancelled': return <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">Cancelled</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

export default function ProjectList({ projects, onEdit, onDelete }: ProjectListProps) {
    const formatCurrency = (val: number | bigint) => {
        return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(Number(val));
    };

    if (projects.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50/50 text-slate-400">
                <p className="font-medium">No projects found.</p>
                <p className="text-xs mt-1">Start tracking your internal or client projects.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 border-b border-slate-200">
                        <TableHead className="h-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Project Name</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Timeline</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Budget</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Owner</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => (
                        <TableRow key={project.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <TableCell className="py-3 px-4">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900 text-sm">{project.name}</span>
                                    {project.account && <span className="text-[11px] text-slate-500">{project.account.name}</span>}
                                </div>
                            </TableCell>
                            <TableCell className="py-3 px-4">{getStatusBadge(project.status)}</TableCell>
                            <TableCell className="py-3 px-4">
                                <div className="flex flex-col text-[11px] text-slate-600">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {project.startDate ? format(new Date(project.startDate), 'MMM dd, yyyy') : 'N/A'}</span>
                                    <span className="flex items-center gap-1 border-t mt-1 pt-1"><Calendar className="w-3 h-3" /> {project.endDate ? format(new Date(project.endDate), 'MMM dd, yyyy') : 'N/A'}</span>
                                </div>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 text-sm">{formatCurrency(project.budget)}</span>
                                    <span className="text-[10px] text-slate-500">Revenue: {formatCurrency(project.revenue)}</span>
                                </div>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                                        {project.owner.firstName[0]}{project.owner.lastName[0]}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{project.owner.firstName}</span>
                                </div>
                            </TableCell>
                            <TableCell className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(project)} className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => onDelete(project.id)} className="h-8 w-8 text-slate-400 hover:text-rose-600">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
