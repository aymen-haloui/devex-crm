import * as React from 'react';
import { useReportStore } from '@/store/reportStore';
import { Button } from '@/components/ui/button';
import { SaveReportDialog } from './SaveReportDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

// Mock fields for modules
type ModuleFieldsMap = { [key: string]: string[] };
const MODULE_FIELDS: ModuleFieldsMap = {
  leads: ['id', 'firstName', 'lastName', 'email', 'status', 'createdAt'],
  accounts: ['id', 'name', 'industry', 'createdAt'],
  contacts: ['id', 'firstName', 'lastName', 'email', 'phone'],
  deals: ['id', 'name', 'amount', 'stage', 'closeDate'],
  campaigns: ['id', 'name', 'type', 'status'],
};

export function ReportCustomizer() {
  const selectedModule = useReportStore((s) => s.selectedModule);
  const relatedModules = useReportStore((s) => s.relatedModules);
  const selectedColumns = useReportStore((s) => s.selectedColumns);
  const setSelectedColumns = useReportStore((s) => s.setSelectedColumns);
  const filters = useReportStore((s) => s.filters);
  const setFilters = useReportStore((s) => s.setFilters);
  const previewData = useReportStore((s) => s.previewData);
  const setPreviewData = useReportStore((s) => s.setPreviewData);
  const setReportName = useReportStore((s) => s.setReportName);
  const setReportFolder = useReportStore((s) => s.setReportFolder);

  // Filters tab logic (simple demo)
  const [filterField, setFilterField] = React.useState('');
  const [filterValue, setFilterValue] = React.useState('');

  // Tabs
  const [tab, setTab] = React.useState<'columns' | 'filters'>('columns');

  const [saveOpen, setSaveOpen] = React.useState(false);

  // Mock preview data
  React.useEffect(() => {
    // In real app, fetch from /api/reports/preview
    if (!selectedModule) return;
    const cols = selectedColumns.length
      ? selectedColumns
      : [
          { module: selectedModule.name, field: MODULE_FIELDS[selectedModule.name][0] },
          { module: selectedModule.name, field: MODULE_FIELDS[selectedModule.name][1] },
        ];
    setPreviewData([
      Object.fromEntries(cols.map((c) => [c.field, `${c.field}_value_1`])),
      Object.fromEntries(cols.map((c) => [c.field, `${c.field}_value_2`])),
    ]);
  }, [selectedModule, selectedColumns, setPreviewData]);

  if (!selectedModule) return null;

  // All available fields
  const allFields = [
    { module: selectedModule.name, label: selectedModule.label, fields: MODULE_FIELDS[selectedModule.name] || [] },
    ...relatedModules.map((mod: { name: string; label: string }) => ({
      module: mod.name,
      label: mod.label,
      fields: MODULE_FIELDS[mod.name] || [],
    })),
  ];

  // Columns tab logic
  const toggleColumn = (module: string, field: string) => {
    const exists = selectedColumns.some((c) => c.module === module && c.field === field);
    if (exists) {
      setSelectedColumns(selectedColumns.filter((c) => !(c.module === module && c.field === field)));
    } else {
      setSelectedColumns([...selectedColumns, { module, field }]);
    }
  };

  const addFilter = () => {
    if (filterField && filterValue) {
      setFilters([...filters, { module: selectedModule.name, field: filterField, operator: 'equals', value: filterValue }]);
      setFilterField('');
      setFilterValue('');
    }
  };

  const handleSave = async (name: string, folder: string) => {
    setReportName(name);
    setReportFolder(folder);
    // TODO: POST to /api/reports/save
    await fetch('/api/reports/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        folder,
        selectedModule,
        relatedModules,
        selectedColumns,
        filters,
      }),
    });
  };

  return (
    <div className="flex h-[80vh] border rounded-lg overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r bg-slate-50 flex flex-col">
        <div className="flex border-b">
          <button
            className={`flex-1 py-2 text-sm font-medium ${tab === 'columns' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500'}`}
            onClick={() => setTab('columns')}
          >
            Columns
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${tab === 'filters' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500'}`}
            onClick={() => setTab('filters')}
          >
            Filters
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'columns' && (
            <>
              {allFields.map((mod) => (
                <div key={mod.module} className="mb-4">
                  <div className="font-semibold text-xs text-slate-500 mb-1">{mod.label}</div>
                  <div className="space-y-1">
                    {mod.fields.map((field: string) => (
                      <label key={field} className="flex items-center gap-2 text-[13px]">
                        <input
                          type="checkbox"
                          checked={selectedColumns.some((c) => c.module === mod.module && c.field === field)}
                          onChange={() => toggleColumn(mod.module, field)}
                        />
                        {field}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
          {tab === 'filters' && (
            <>
              <div className="mb-2 text-xs text-slate-500">Add Filter</div>
              <select
                className="w-full mb-2 border rounded px-2 py-1 text-[13px]"
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                title="Select field for filter"
              >
                <option value="">Select field</option>
                {allFields.flatMap((mod) =>
                  mod.fields.map((field: string) => (
                    <option key={mod.module + field} value={field}>
                      {mod.label}: {field}
                    </option>
                  ))
                )}
              </select>
              <Input
                className="mb-2 h-8 text-[13px]"
                placeholder="Value"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
              <Button size="sm" onClick={addFilter}>
                Add Filter
              </Button>
              <div className="mt-4">
                {filters.map((f, i) => (
                  <div key={i} className="text-[13px] flex items-center gap-2 mb-1">
                    <span>{String(f.field)} = {String(f.value)}</span>
                    <Button size="icon-sm" variant="ghost" onClick={() => setFilters(filters.filter((_, idx) => idx !== i))}>×</Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="p-4 border-t flex justify-end">
        <Button onClick={() => setSaveOpen(true)} className="px-6">Save Report</Button>
        <SaveReportDialog open={saveOpen} onOpenChange={setSaveOpen} onSave={handleSave} />
      </div>
      {/* Live Preview */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="font-semibold mb-2 text-[15px]">Live Preview</div>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-[13px]">
                {selectedColumns.length
                  ? selectedColumns.map((col) => (
                      <TableHead key={col.module + col.field} className="py-1 text-[13px]">{col.field}</TableHead>
                    ))
                  : [<TableHead key="empty" className="py-1 text-[13px]">No columns selected</TableHead>]}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((row, i) => (
                <TableRow key={i} className="text-[13px]">
                  {selectedColumns.length
                    ? selectedColumns.map((col) => (
                        <TableCell key={col.module + col.field} className="py-1 text-[13px]">{(row as Record<string, any>)[col.field]}</TableCell>
                      ))
                    : <TableCell className="py-1 text-[13px]">-</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
