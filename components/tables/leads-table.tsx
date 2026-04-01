'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Lead, LeadStatus } from '@/types';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LeadsTableProps {
  leads: Lead[];
  onEdit?: (lead: Lead) => void;
  onDelete?: (id: string) => void;
}

const statusColors: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'bg-blue-100 text-blue-800',
  [LeadStatus.CONTACTED]: 'bg-purple-100 text-purple-800',
  [LeadStatus.QUALIFIED]: 'bg-indigo-100 text-indigo-800',
  [LeadStatus.PROPOSAL_SENT]: 'bg-yellow-100 text-yellow-800',
  [LeadStatus.NEGOTIATION]: 'bg-orange-100 text-orange-800',
  [LeadStatus.CLOSED_WON]: 'bg-green-100 text-green-800',
  [LeadStatus.CLOSED_LOST]: 'bg-red-100 text-red-800',
};

const scoreWidthClass = (score: number) => {
  if (score >= 90) return 'w-full';
  if (score >= 75) return 'w-10/12';
  if (score >= 60) return 'w-8/12';
  if (score >= 45) return 'w-6/12';
  if (score >= 30) return 'w-4/12';
  if (score >= 15) return 'w-2/12';
  return 'w-1/12';
};

export default function LeadsTable({ leads, onEdit, onDelete }: LeadsTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const allSelected = useMemo(
    () => leads.length > 0 && leads.every((lead) => selectedRows.includes(lead.id)),
    [leads, selectedRows]
  );

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedRows((prev) => prev.filter((id) => !leads.some((lead) => lead.id === id)));
      return;
    }
    setSelectedRows((prev) => Array.from(new Set([...prev, ...leads.map((lead) => lead.id)])));
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  };

  return (
    <div className="shadow-sm rounded-xl bg-card p-0 overflow-hidden min-h-[320px] border">
      {selectedRows.length > 0 && (
        <div className="bg-primary/10 color-primary px-6 py-4 text-[15px] font-medium border-b">
          {selectedRows.length} lead(s) selected
        </div>
      )}
      <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="bg-muted/50 sticky top-0 z-[2]">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  title="Select all leads"
                  aria-label="Select all leads"
                  style={{ accentColor: '#1976d2' }}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-20">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-lg font-semibold text-muted-foreground text-center">No leads found</p>
                  </motion.div>
                </TableCell>
              </TableRow>
            ) : leads.map((lead) => (
              <motion.tr
                key={lead.id}
                whileHover={{ scale: 1.01, backgroundColor: '#f5f7fa' }}
                style={{ transition: 'all 0.2s', cursor: 'pointer' }}
              >
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(lead.id)}
                    onChange={() => toggleSelectRow(lead.id)}
                    title={`Select lead ${lead.firstName} ${lead.lastName}`}
                    aria-label={`Select lead ${lead.firstName} ${lead.lastName}`}
                    style={{ accentColor: '#1976d2' }}
                  />
                </TableCell>
                <TableCell className="font-medium">{lead.firstName} {lead.lastName}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.company || '-'}</TableCell>
                <TableCell>
                  <span style={{ fontSize: 13, padding: '2px 10px', borderRadius: 12, fontWeight: 600, background: '#e3e8f0', color: '#2d3a4b' }}>
                    {lead.status.replace(/_/g, ' ')}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{lead.score}</span>
                    <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${lead.score}%` }} />
                    </div>
                  </div>
                </TableCell>
                <TableCell>{lead.source || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/leads/${lead.id}`}>
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    {onEdit && (
                      <Button size="sm" variant="ghost" onClick={() => onEdit(lead)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button size="sm" variant="ghost" onClick={() => onDelete(lead.id)}>
                        <Trash2 className="w-4 h-4" style={{ color: '#e53935' }} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
