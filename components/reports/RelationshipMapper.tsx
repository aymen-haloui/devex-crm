import * as React from 'react';
import { useReportStore } from '@/store/reportStore';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type ModuleRelation = { name: string; label: string };
type ModuleRelationMap = { [key: string]: ModuleRelation[] };
const MODULE_RELATIONS: ModuleRelationMap = {
  leads: [
    { name: 'accounts', label: 'Accounts' },
    { name: 'contacts', label: 'Contacts' },
    { name: 'deals', label: 'Deals' },
    { name: 'campaigns', label: 'Campaigns' },
  ],
  contacts: [
    { name: 'accounts', label: 'Accounts' },
    { name: 'deals', label: 'Deals' },
  ],
  // ...add more as needed
};

export function RelationshipMapper() {
  const selectedModule = useReportStore((s) => s.selectedModule);
  const relatedModules = useReportStore((s) => s.relatedModules);
  const setRelatedModules = useReportStore((s) => s.setRelatedModules);
  const setStep = useReportStore((s) => s.setStep);

  const [addOpen, setAddOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  if (!selectedModule) return null;

  const available = (MODULE_RELATIONS[selectedModule.name] || []).filter(
    (mod: ModuleRelation) => !relatedModules.some((r: ModuleRelation) => r.name === mod.name)
  ).filter((mod: ModuleRelation) => mod.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-lg mx-auto mt-10">
      <div className="flex flex-col items-center">
        <div className="relative flex flex-col items-center">
          <div className="rounded bg-blue-600 text-white px-4 py-2 font-semibold text-[15px] shadow">{selectedModule.label}</div>
          <div className="w-1 h-8 bg-blue-200" />
          <div className="flex flex-col gap-2 items-center">
            {relatedModules.map((mod) => (
              <div key={mod.name} className="flex items-center gap-2">
                <div className="rounded bg-blue-100 text-blue-800 px-3 py-1 text-[14px] font-medium shadow-sm border border-blue-200">{mod.label}</div>
                <Button size="icon-sm" variant="ghost" onClick={() => setRelatedModules(relatedModules.filter((r) => r.name !== mod.name))}>
                  ×
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <Button size="icon-sm" variant="outline" onClick={() => setAddOpen((v) => !v)}>
                <Plus className="w-4 h-4" />
              </Button>
              {addOpen && (
                <div className="relative z-10 bg-white border border-slate-200 rounded shadow p-2 min-w-[180px]">
                  <input
                    className="w-full border px-2 py-1 rounded text-sm mb-2"
                    placeholder="Search related modules..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {available.length === 0 && <div className="text-xs text-slate-400">No modules found</div>}
                  {available.map((mod: ModuleRelation) => (
                    <button
                      key={mod.name}
                      className="block w-full text-left px-2 py-1 hover:bg-blue-50 rounded text-[14px]"
                      onClick={() => {
                        setRelatedModules([...relatedModules, { ...mod, relation: mod.name }]);
                        setAddOpen(false);
                        setSearch('');
                      }}
                    >
                      {mod.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <Button className="mt-8" onClick={() => setStep(3)}>
          Next: Customize Report
        </Button>
      </div>
    </div>
  );
}
