import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useReportStore } from '@/store/reportStore';

export function SaveReportDialog({ open, onOpenChange, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; onSave: (name: string, folder: string) => void }) {
  const [name, setName] = React.useState('');
  const [folder, setFolder] = React.useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Save Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Report Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9"
          />
          <Input
            placeholder="Folder (e.g. Email Reports)"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="h-9"
          />
          <Button className="w-full" onClick={() => { onSave(name, folder); onOpenChange(false); }} disabled={!name || !folder}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
