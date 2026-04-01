'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { CommandSelect } from '@/components/ui/command-select';
import { ModuleSelectorDialog } from '@/components/reports/ModuleSelectorDialog';
import { useReportStore } from '@/store/reportStore';
import { RelationshipMapper } from '@/components/reports/RelationshipMapper';
import { ReportCustomizer } from '@/components/reports/ReportCustomizer';

const REPORTS = [
  { name: 'Top 10 Templates by Click Rate', description: 'Top templates based on click-through percentage', folder: 'Email Reports', createdBy: '-', starred: true },
  { name: 'Top 10 Templates by Open Rate', description: 'Top templates based on open percentage', folder: 'Email Reports', createdBy: '-', starred: false },
  { name: 'Email and Activities Analytics Report', description: 'Summary of sent, replied, called, and activity metrics', folder: 'Email Reports', createdBy: '-', starred: true },
  { name: 'Bounce Report', description: 'Bounce reason and timeline summary', folder: 'Email Reports', createdBy: '-', starred: false },
  { name: 'Overall Sales Duration Across Lead Sources', description: 'Average conversion time by source', folder: 'Sales Metrics Reports', createdBy: '-', starred: false },
];

export default function ReportsPage() {
  const [folderFilter, setFolderFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const step = useReportStore((s) => s.step);
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Only show table if step === 1
  if (step === 2) {
    return <RelationshipMapper />;
  }
  if (step === 3) {
    return <ReportCustomizer />;
  }

  const filteredReports = REPORTS.filter((r) => {
    if (folderFilter !== 'all' && r.folder.toLowerCase().indexOf(folderFilter) === -1) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function toggleSelectRow(name: string) {
    setSelectedRows((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
      </div>

      <div className="rounded-md border border-gray-200 bg-gray-50/60 p-2.5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CommandSelect
            value={folderFilter}
            onChange={setFolderFilter}
            placeholder="All Reports"
            options={[
              { value: 'all', label: 'All Reports' },
              { value: 'email', label: 'Email Reports' },
              { value: 'sales', label: 'Sales Reports' },
            ]}
          />
          <div className="flex w-full gap-2 md:w-auto md:min-w-[380px]">
            <div className="relative flex-1">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search All Reports"
                className="h-8 bg-white"
              />
            </div>
            <Button className="h-8" onClick={() => setDialogOpen(true)}>Create Report</Button>
            <ModuleSelectorDialog open={dialogOpen && step === 1} onOpenChange={setDialogOpen} />
          </div>
        </div>
      </div>

      {selectedRows.length > 0 ? (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          {selectedRows.length} report(s) selected
        </div>
      ) : null}

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 text-[13px] py-1">
              <TableHead className="w-12 py-1 text-[13px]">Select</TableHead>
              <TableHead className="py-1 text-[13px]">Report Name</TableHead>
              <TableHead className="py-1 text-[13px]">Description</TableHead>
              <TableHead className="py-1 text-[13px]">Folder</TableHead>
              <TableHead className="py-1 text-[13px]">Last Accessed Date</TableHead>
              <TableHead className="py-1 text-[13px]">Created By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report.name}>
                <TableCell>
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-gray-300"
                    checked={selectedRows.includes(report.name)}
                    onChange={() => toggleSelectRow(report.name)}
                    title={`Select report ${report.name}`}
                    aria-label={`Select report ${report.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium text-blue-600 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <span className={report.starred ? 'text-amber-400' : 'text-gray-300'}>★</span>
                    {report.name}
                  </span>
                </TableCell>
                <TableCell className="text-gray-600 text-sm">{report.description}</TableCell>
                <TableCell className="text-sm">{report.folder}</TableCell>
                <TableCell className="text-sm">-</TableCell>
                <TableCell className="text-sm">{report.createdBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
