'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, Filter, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function MyRequestsPage() {
  const t = useTranslations('myRequests');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newRequest, setNewRequest] = useState({
    title: '',
    type: 'approval',
    priority: 'medium',
    description: ''
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/my-requests');
      const json = await res.json();
      if (json.success) setRequests(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async () => {
    if (!newRequest.title || !newRequest.type) {
      toast.error(t('errorRequired'));
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/my-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });
      const json = await res.json();
      if (json.success) {
        toast.success(t('success'));
        setIsDialogOpen(false);
        setNewRequest({ title: '', type: 'approval', priority: 'medium', description: '' });
        fetchRequests();
      } else {
        toast.error(json.error || t('errorFailed'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> {t('status.approved')}</Badge>;
      case 'rejected': return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> {t('status.rejected')}</Badge>;
      case 'pending': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> {t('status.pending')}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-rose-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-blue-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('title')}</h1>
          <p className="text-slate-500 mt-1">{t('description')}</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> {t('newRequest')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('submitNew')}</DialogTitle>
              <DialogDescription>
                {t('fillDetails')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{t('fields.title')}</label>
                <Input
                  placeholder={t('placeholders.title')}
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{t('fields.type')}</label>
                  <Select
                    value={newRequest.type}
                    onValueChange={(val) => setNewRequest({ ...newRequest, type: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('placeholders.type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approval">{t('types.approval')}</SelectItem>
                      <SelectItem value="access">{t('types.access')}</SelectItem>
                      <SelectItem value="reimbursement">{t('types.reimbursement')}</SelectItem>
                      <SelectItem value="other">{t('types.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{t('fields.priority')}</label>
                  <Select
                    value={newRequest.priority}
                    onValueChange={(val) => setNewRequest({ ...newRequest, priority: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('placeholders.priority')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('priorities.low')}</SelectItem>
                      <SelectItem value="medium">{t('priorities.medium')}</SelectItem>
                      <SelectItem value="high">{t('priorities.high')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{t('fields.description')}</label>
                <Textarea
                  placeholder={t('placeholders.description')}
                  className="min-h-[100px]"
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>{t('cancel')}</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSubmit} disabled={submitting}>
                {submitting ? t('submitting') : t('submit')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400", isRtl ? "right-3" : "left-3")} />
          <Input placeholder={t('searchPlaceholder')} className={cn("bg-slate-50 border-none h-10", isRtl ? "pr-9" : "pl-9")} />
        </div>
        <Button variant="outline" className="h-10 gap-2 border-slate-200">
          <Filter className="w-4 h-4" /> {t('filter')}
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm font-medium">{t('loading')}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t('noRequests')}</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">
              {t('noRequestsDescription')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {requests.map((req) => (
              <Card key={req.id} className="border-slate-200 hover:border-indigo-300 transition-all shadow-sm group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{req.title}</h3>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold text-slate-500 border-slate-200">{t(`types.${req.type}`)}</Badge>
                      </div>
                      <p className="text-slate-600 text-sm line-clamp-2 mb-4">{req.description || tCommon('noDescription')}</p>
                      <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className={`w-3.5 h-3.5 ${getPriorityColor(req.priority)}`} />
                          <span className="capitalize">{t('priorities.priority', { priority: t(`priorities.${req.priority}`) })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(req.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      {getStatusBadge(req.status)}
                      <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold text-xs uppercase tracking-wider">
                        {t('viewDetails')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
        }
      </div>
    </div>
  );
}
