'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ServiceListProps {
    services: any[];
    onEdit: (service: any) => void;
    onDelete: (id: string) => void;
}

export default function ServiceList({ services, onEdit, onDelete }: ServiceListProps) {
    const formatCurrency = (val: number | bigint) => {
        return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(val));
    };

    if (services.length === 0) {
        return (
            <div className="text-center py-10 border-2 border-dashed rounded-lg bg-gray-50 text-gray-500">
                No services found. Get started by creating one.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50">
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {services.map((service) => (
                        <TableRow key={service.id}>
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell>{formatCurrency(service.price)}</TableCell>
                            <TableCell>{service.duration || '-'}</TableCell>
                            <TableCell>{service.location || '-'}</TableCell>
                            <TableCell>
                                {service.isActive ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-gray-500 border-gray-300">
                                        <XCircle className="w-3 h-3 mr-1" /> Inactive
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(service)} className="h-8 w-8 text-slate-500">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => onDelete(service.id)} className="h-8 w-8 text-rose-500">
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
