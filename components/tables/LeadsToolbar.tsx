import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
// import { Box, Grid } from '@mui/material'; // Uncomment if @mui/material is installed
import Link from 'next/link';

export default function LeadsToolbar({ search, setSearch }: { search: string; setSearch: (v: string) => void }) {
  return (
    <div className="leads-toolbar-container">
      <div className="leads-toolbar-grid">
        <div className="leads-toolbar-title">
          <h1 className="leads-toolbar-heading">Leads</h1>
        </div>
        <div className="leads-toolbar-actions">
          <div className="leads-toolbar-actions-inner">
            <Input
              placeholder="Search leads"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="leads-toolbar-search"
            />
            <Link href="/leads/new">
              <Button variant="secondary" color="primary" className="leads-toolbar-create">
                Create Lead
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
