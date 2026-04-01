import React from 'react';
// import { Box, Collapse, Typography, Divider, Button, Checkbox, FormControlLabel, Stack } from '@mui/material'; // Uncomment if @mui/material is installed
// import { motion } from 'framer-motion'; // Uncomment if framer-motion is installed

const systemFilters = ['Touched Records', 'Untouched Records', 'Record Action', 'Related Records Action', 'Locked'];
const fieldFilters = ['Company', 'Email', 'Phone', 'Source', 'Status', 'Created Time', 'Modified Time'];

export default function LeadsFiltersPanel({ open, filters, setFilters, onApply, onReset }: {
  open: boolean;
  filters: any;
  setFilters: (filters: any) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  return (
    <div className="leads-filters-motion">
      <div className={`leads-filters-collapse${open ? ' open' : ''}`}>
        <div className="leads-filters-panel">
          <div className="leads-filters-title">Filters</div>
          <div className="leads-filters-divider" />
          <div className="leads-filters-subtitle">System Filters</div>
          <div className="leads-filters-stack">
            {systemFilters.map(item => (
              <label key={item} className="leads-filters-label">
                <input type="checkbox" checked={!!filters.system[item]} onChange={() => setFilters((f: unknown) => ({ ...(f as any), system: { ...(f as any).system, [item]: !(f as any).system[item] } }))} />
                {item}
              </label>
            ))}
          </div>
          <div className="leads-filters-subtitle">Field Filters</div>
          <div className="leads-filters-stack">
            {fieldFilters.map(item => (
              <label key={item} className="leads-filters-label">
                <input type="checkbox" checked={!!filters.fields[item]} onChange={() => setFilters((f: unknown) => ({ ...(f as any), fields: { ...(f as any).fields, [item]: !(f as any).fields[item] } }))} />
                {item}
              </label>
            ))}
          </div>
          <div className="leads-filters-actions">
            <button className="leads-filters-apply" onClick={onApply}>Apply Filters</button>
            <button className="leads-filters-reset" onClick={onReset}>Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}
