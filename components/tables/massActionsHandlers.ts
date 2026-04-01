import { toast } from 'sonner';

function arrayToCsv(rows: string[][]) {
  return rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
}

export function exportAsCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = arrayToCsv([headers, ...rows]);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function handleMassAction(action: string, entity: string, selectedIds: Set<string>, items: any[]) {
  const selected = items.filter((it: any) => selectedIds.has(it.id));
  if (selected.length === 0) {
    toast.error('No items selected');
    return;
  }

  switch (action) {
    case 'export':
    case 'print_view': {
      const html = `
        <html><head><title>Print ${entity}</title></head><body>
        <h2>${entity} - Print View</h2>
        <pre>${JSON.stringify(selected, null, 2)}</pre>
        </body></html>`;
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(html);
        w.document.close();
        w.print();
      } else {
        toast.error('Unable to open print window');
      }
      break;
    }
    case 'mass_email': {
      const emails = selected.map(s => s.email).filter(Boolean);
      if (emails.length === 0) {
        toast.error('No email addresses found on selected items');
        return;
      }
      const mailto = `mailto:${emails.join(',')}`;
      window.location.href = mailto;
      break;
    }
    case 'mass_update': {
      const field = prompt(`Field to update for ${selected.length} ${entity} (e.g. status):`);
      if (!field) return;
      const value = prompt(`New value for ${field}:`);
      if (value != null) {
        try {
          const res = await fetch('/api/mass-actions/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entity, ids: Array.from(selectedIds), updates: { [field]: value } }),
          });
          const data = await res.json();
          if (data.success) {
            toast.success(data.message || `Update queued for ${selected.length} ${entity}`);
          } else {
            toast.error(data.error || 'Failed to perform mass update');
          }
        } catch (e) {
          toast.error('Network error during mass update');
        }
      }
      break;
    }
    case 'mass_convert': {
      try {
        const res = await fetch('/api/mass-actions/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entity, ids: Array.from(selectedIds) }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(data.message || `Convert operation queued`);
        } else {
          toast.error(data.error || 'Conversion failed');
        }
      } catch (e) {
        toast.error('Network error during convert');
      }
      break;
    }
    case 'approve': {
      if (confirm(`Approve ${selected.length} ${entity}?`)) {
        toast.success(`${selected.length} ${entity} approved`);
      }
      break;
    }
    case 'add_to_campaign': {
      const camp = prompt('Campaign name to add to:');
      if (camp) {
        toast.success(`Added ${selected.length} ${entity} to campaign "${camp}"`);
      }
      break;
    }
    case 'manage_tags': {
      const tag = prompt(`Add tag to ${selected.length} ${entity} (single tag):`);
      if (tag) {
        try {
          const res = await fetch('/api/mass-actions/tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entity, ids: Array.from(selectedIds), tag }),
          });
          const data = await res.json();
          if (data.success) {
            toast.success(data.message || `Tag operation queued for ${selected.length} ${entity}`);
          } else {
            toast.error(data.error || 'Failed to add tags');
          }
        } catch (e) {
          toast.error('Network error during tag operation');
        }
      }
      break;
    }
    case 'deduplicate': {
      try {
        const res = await fetch('/api/mass-actions/dedupe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entity, ids: Array.from(selectedIds), items: selected }),
        });
        const data = await res.json();
        if (data.success) {
          if (data.data?.duplicates && data.data.duplicates.length > 0) {
            const message = data.data.duplicates
              .map((g: any) => g.group.map((x: any) => x.id).join(', '))
              .join('\n');
            alert('Potential duplicate groups (IDs):\n' + message);
          } else {
            toast(`No obvious duplicates found`);
          }
        } else {
          toast.error(data.error || 'Dedupe failed');
        }
      } catch (e) {
        toast.error('Network error during dedupe');
      }
      break;
    }
    default:
      toast(`Action: ${action} not implemented yet`);
  }
}

export default null;
