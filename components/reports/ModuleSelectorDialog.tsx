import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useReportStore } from '@/store/reportStore';
import { Search } from 'lucide-react';

const MODULES = [
  { name: 'leads', label: 'Leads' },
  { name: 'contacts', label: 'Contacts' },
  { name: 'accounts', label: 'Accounts' },
  { name: 'deals', label: 'Deals' },
  { name: 'campaigns', label: 'Campaigns' },
  { name: 'cases', label: 'Cases' },
  { name: 'products', label: 'Products' },
  { name: 'quotes', label: 'Quotes' },
  { name: 'invoices', label: 'Invoices' },
  { name: 'orders', label: 'Orders' },
];

export function ModuleSelectorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const setStep = useReportStore((s) => s.setStep);
  const setSelectedModule = useReportStore((s) => s.setSelectedModule);
  const [search, setSearch] = React.useState('');

  const filtered = MODULES.filter((m) => m.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select a Module</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
          {filtered.map((mod) => (
            <button
              key={mod.name}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center gap-2 text-[15px]"
              onClick={() => {
                setSelectedModule({ ...mod, fields: [] });
                setStep(2);
                onOpenChange(false);
              }}
            >
              <span className="font-medium">{mod.label}</span>
              <span className="ml-auto text-xs text-muted-foreground">{mod.name}</span>
            </button>
          ))}
          {filtered.length === 0 && <div className="text-center text-muted-foreground py-6">No modules found.</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
