'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Mail, Pause, Play, XCircle, Clock3, Upload } from 'lucide-react';

type Campaign = {
  id: string;
  name: string;
  channel: string;
  status: string;
  sentCount: number;
  failedCount: number;
  openCount: number;
  clickCount: number;
  unsubscribeCount: number;
  totalRecipients: number;
  scheduledAt?: string | null;
  emailsPerMinute: number;
  timezone?: string | null;
  templateId?: string | null;
  segmentId?: string | null;
};

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  previewText?: string | null;
  htmlContent: string;
  imageUrls?: string[];
};

type Segment = {
  id: string;
  name: string;
  entityType: string;
  rulesJson: unknown;
};

type CustomField = {
  id: string;
  entityType: string;
  key: string;
  label: string;
  fieldType: string;
};

type AnalyticsData = {
  id: string;
  name: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  openCount: number;
  clickCount: number;
  unsubscribeCount: number;
};

const VARIABLE_HINT = '{{firstName}}, {{lastName}}, {{fullName}}, {{email}}, {{company}}, {{custom.favoriteColor}}';

export default function MarketingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [fields, setFields] = useState<CustomField[]>([]);

  const [analyticsCampaignId, setAnalyticsCampaignId] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderReplyTo, setSenderReplyTo] = useState('');
  const [orgTimezone, setOrgTimezone] = useState('UTC');
  const [blacklistEmail, setBlacklistEmail] = useState('');

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    channel: 'email',
    status: 'draft',
    timezone: 'UTC',
    emailsPerMinute: '60',
    scheduledAt: '',
    startDate: '',
    endDate: '',
    budget: '',
    description: '',
    templateId: '',
    segmentId: '',
  });

  const [templateForm, setTemplateForm] = useState({
    id: '',
    name: '',
    subject: '',
    previewText: '',
    htmlContent: '<p>Hello {{firstName}},</p><p>Your update is here.</p>',
    imageUrls: [] as string[],
  });

  const [fieldForm, setFieldForm] = useState({
    entityType: 'lead',
    key: '',
    label: '',
    fieldType: 'text',
  });

  const [segmentForm, setSegmentForm] = useState({
    name: '',
    entityType: 'lead',
    rulesJson: {
      combinator: 'and',
      conditions: [{ source: 'standard', field: 'status', operator: 'eq', value: 'new' }],
    },
  });

  const totals = useMemo(
    () =>
      campaigns.reduce(
        (acc, campaign) => {
          acc.total += 1;
          acc.sent += campaign.sentCount || 0;
          acc.failed += campaign.failedCount || 0;
          acc.opens += campaign.openCount || 0;
          acc.clicks += campaign.clickCount || 0;
          return acc;
        },
        { total: 0, sent: 0, failed: 0, opens: 0, clicks: 0 }
      ),
    [campaigns]
  );

  const api = async <T,>(url: string, options: RequestInit = {}): Promise<T | null> => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Request failed');
    return data as T;
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      const [campaignRes, templateRes, segmentRes, fieldRes, senderRes] = await Promise.all([
        api<{ data: Campaign[] }>('/api/campaigns'),
        api<{ data: EmailTemplate[] }>('/api/email-templates'),
        api<{ data: Segment[] }>('/api/segments'),
        api<{ data: CustomField[] }>('/api/custom-fields'),
        api<{ data: { senderName?: string | null; senderEmail?: string | null; senderReplyTo?: string | null; timezone?: string | null } }>('/api/organizations/sender'),
      ]);

      setCampaigns(campaignRes?.data || []);
      setTemplates(templateRes?.data || []);
      setSegments(segmentRes?.data || []);
      setFields(fieldRes?.data || []);
      setSenderName(senderRes?.data?.senderName || '');
      setSenderEmail(senderRes?.data?.senderEmail || '');
      setSenderReplyTo(senderRes?.data?.senderReplyTo || '');
      setOrgTimezone(senderRes?.data?.timezone || 'UTC');
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load marketing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const createCampaign = async () => {
    try {
      await api('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          ...campaignForm,
          emailsPerMinute: Number(campaignForm.emailsPerMinute || 60),
          scheduledAt: campaignForm.scheduledAt || null,
          templateId: campaignForm.templateId || null,
          segmentId: campaignForm.segmentId || null,
        }),
      });
      setCampaignForm({
        name: '',
        channel: 'email',
        status: 'draft',
        timezone: orgTimezone || 'UTC',
        emailsPerMinute: '60',
        scheduledAt: '',
        startDate: '',
        endDate: '',
        budget: '',
        description: '',
        templateId: '',
        segmentId: '',
      });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    }
  };

  const controlCampaign = async (id: string, action: 'pause' | 'resume' | 'cancel') => {
    try {
      await api(`/api/campaigns/${id}/control`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Control action failed');
    }
  };

  const launchCampaign = async (id: string) => {
    const target = campaigns.find((c) => c.id === id);
    if (!target?.templateId || !target?.segmentId) {
      setError('Campaign needs both a template and a segment before sending');
      return;
    }

    try {
      await api(`/api/campaigns/${id}/send-email`, {
        method: 'POST',
        body: JSON.stringify({
          templateId: target.templateId,
          segmentId: target.segmentId,
          timezone: target.timezone || orgTimezone,
          emailsPerMinute: target.emailsPerMinute,
          sendNow: true,
        }),
      });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Launch failed');
    }
  };

  const saveTemplate = async () => {
    try {
      if (templateForm.id) {
        await api(`/api/email-templates/${templateForm.id}`, {
          method: 'PUT',
          body: JSON.stringify(templateForm),
        });
      } else {
        await api('/api/email-templates', {
          method: 'POST',
          body: JSON.stringify(templateForm),
        });
      }

      setTemplateForm({
        id: '',
        name: '',
        subject: '',
        previewText: '',
        htmlContent: '<p>Hello {{firstName}},</p><p>Your update is here.</p>',
        imageUrls: [],
      });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Template save failed');
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/email/upload-image', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Upload failed');

    setTemplateForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, data.data.url] }));
    setTemplateForm((prev) => ({ ...prev, htmlContent: `${prev.htmlContent}<p><img src="${data.data.url}" alt="image" /></p>` }));
  };

  const saveField = async () => {
    try {
      await api('/api/custom-fields', { method: 'POST', body: JSON.stringify(fieldForm) });
      setFieldForm({ entityType: 'lead', key: '', label: '', fieldType: 'text' });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Field save failed');
    }
  };

  const saveSegment = async () => {
    try {
      await api('/api/segments', { method: 'POST', body: JSON.stringify(segmentForm) });
      setSegmentForm({
        name: '',
        entityType: 'lead',
        rulesJson: { combinator: 'and', conditions: [{ source: 'standard', field: 'status', operator: 'eq', value: 'new' }] },
      });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Segment save failed');
    }
  };

  const loadAnalytics = async () => {
    if (!analyticsCampaignId) return;
    try {
      const res = await api<{ analytics: AnalyticsData | null }>(`/api/email-logs?campaignId=${analyticsCampaignId}`);
      setAnalytics(res?.analytics || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analytics load failed');
    }
  };

  const saveCompliance = async () => {
    try {
      await api('/api/organizations/sender', {
        method: 'PUT',
        body: JSON.stringify({
          senderName,
          senderEmail,
          senderReplyTo,
          timezone: orgTimezone,
        }),
      });

      if (blacklistEmail.trim()) {
        await api('/api/email-blacklist', {
          method: 'POST',
          body: JSON.stringify({ email: blacklistEmail.trim().toLowerCase(), reason: 'Manual block from control center' }),
        });
        setBlacklistEmail('');
      }
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Compliance save failed');
    }
  };

  if (loading) {
    return <div className="py-10 text-sm text-gray-500">Loading marketing control center...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Marketing Control Center</h1>
        <p className="text-slate-500 mt-1 font-medium">Campaign lifecycle management, dynamic segmentation, and templates.</p>
      </div>

      {error ? <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-6"><p className="text-xs text-gray-500">Campaigns</p><p className="text-2xl font-bold">{totals.total}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-gray-500">Sent</p><p className="text-2xl font-bold">{totals.sent}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-gray-500">Failed</p><p className="text-2xl font-bold">{totals.failed}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-gray-500">Opens</p><p className="text-2xl font-bold">{totals.opens}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-gray-500">Clicks</p><p className="text-2xl font-bold">{totals.clicks}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Create Campaign</CardTitle><CardDescription>Draft, schedule, throttle, and assign template + segment</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input placeholder="Campaign name" value={campaignForm.name} onChange={(e) => setCampaignForm((p) => ({ ...p, name: e.target.value }))} />
              <Select value={campaignForm.status} onValueChange={(v) => setCampaignForm((p) => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="sending">Sending</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Input type="datetime-local" value={campaignForm.scheduledAt} onChange={(e) => setCampaignForm((p) => ({ ...p, scheduledAt: e.target.value }))} />
              <Input type="number" placeholder="Emails / minute" value={campaignForm.emailsPerMinute} onChange={(e) => setCampaignForm((p) => ({ ...p, emailsPerMinute: e.target.value }))} />

              <Select value={campaignForm.templateId || 'none'} onValueChange={(v) => setCampaignForm((p) => ({ ...p, templateId: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Template" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No template</SelectItem>
                  {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={campaignForm.segmentId || 'none'} onValueChange={(v) => setCampaignForm((p) => ({ ...p, segmentId: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Segment" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No segment</SelectItem>
                  {segments.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Input placeholder="Timezone" value={campaignForm.timezone} onChange={(e) => setCampaignForm((p) => ({ ...p, timezone: e.target.value }))} />

              <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</p>
                  <Input type="date" value={campaignForm.startDate} onChange={(e) => setCampaignForm((p) => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</p>
                  <Input type="date" value={campaignForm.endDate} onChange={(e) => setCampaignForm((p) => ({ ...p, endDate: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Budget</p>
                  <Input type="number" placeholder="Budget" value={campaignForm.budget} onChange={(e) => setCampaignForm((p) => ({ ...p, budget: e.target.value }))} />
                </div>
              </div>

              <div className="md:col-span-4">
                <Textarea
                  placeholder="Campaign Description"
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm((p) => ({ ...p, description: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <Button className="md:col-span-4 gap-2" onClick={createCampaign}><Plus className="w-4 h-4" />Create</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Campaign Controls</CardTitle><CardDescription>Pause, resume, cancel, or launch campaign batches</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {campaigns.map((c) => (
                <div key={c.id} className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.status} • {c.sentCount}/{c.totalRecipients} sent • {c.emailsPerMinute}/min</p>
                    {c.scheduledAt ? <p className="text-xs text-gray-500">Scheduled: {new Date(c.scheduledAt).toLocaleString()} ({c.timezone || 'UTC'})</p> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => launchCampaign(c.id)}><Mail className="w-3 h-3" />Launch</Button>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => controlCampaign(c.id, 'pause')}><Pause className="w-3 h-3" />Pause</Button>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => controlCampaign(c.id, 'resume')}><Play className="w-3 h-3" />Resume</Button>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => controlCampaign(c.id, 'cancel')}><XCircle className="w-3 h-3" />Cancel</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Advanced Template Builder</CardTitle><CardDescription>WYSIWYG-style HTML editing with dynamic variables and image uploads</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Template name" value={templateForm.name} onChange={(e) => setTemplateForm((p) => ({ ...p, name: e.target.value }))} />
              <Input placeholder="Subject (supports variables)" value={templateForm.subject} onChange={(e) => setTemplateForm((p) => ({ ...p, subject: e.target.value }))} />
              <Input placeholder="Preview text" value={templateForm.previewText} onChange={(e) => setTemplateForm((p) => ({ ...p, previewText: e.target.value }))} />
              <Textarea rows={10} value={templateForm.htmlContent} onChange={(e) => setTemplateForm((p) => ({ ...p, htmlContent: e.target.value }))} />
              <p className="text-xs text-gray-500">Variables: {VARIABLE_HINT}</p>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-md cursor-pointer hover:bg-gray-50">
                  <Upload className="w-4 h-4" /> Upload image
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                </label>
                <Button onClick={saveTemplate}>Save Template</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Template Library</CardTitle><CardDescription>Save, edit, and deactivate templates</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.subject}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setTemplateForm({
                      id: t.id,
                      name: t.name,
                      subject: t.subject,
                      previewText: t.previewText || '',
                      htmlContent: t.htmlContent,
                      imageUrls: t.imageUrls || [],
                    })}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={async () => { await api(`/api/email-templates/${t.id}`, { method: 'DELETE' }); await loadAll(); }}>Delete</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Segmentation Engine</CardTitle><CardDescription>Visual filter builder with standard/custom/campaign history filters</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Segment name" value={segmentForm.name} onChange={(e) => setSegmentForm((p) => ({ ...p, name: e.target.value }))} />
              <Select value={segmentForm.entityType} onValueChange={(v) => setSegmentForm((p) => ({ ...p, entityType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Leads</SelectItem>
                  <SelectItem value="contact">Contacts</SelectItem>
                </SelectContent>
              </Select>
              <Textarea rows={8} value={JSON.stringify(segmentForm.rulesJson, null, 2)} onChange={(e) => {
                try {
                  setSegmentForm((p) => ({ ...p, rulesJson: JSON.parse(e.target.value) }));
                } catch {
                  setError('Segment rules must be valid JSON');
                }
              }} />
              <p className="text-xs text-gray-500">Use source = standard/custom/campaign with operators eq, contains, gt, in, etc.</p>
              <Button onClick={saveSegment}>Save Segment</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Reusable Segments</CardTitle><CardDescription>Saved audience definitions</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {segments.map((s) => (
                <div key={s.id} className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.entityType}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={async () => { const r = await api<{ data: { count: number } }>(`/api/segments/${s.id}/preview`); alert(`Segment preview: ${r?.data.count || 0} recipients`); }}>Preview</Button>
                    <Button size="sm" variant="outline" onClick={async () => { await api(`/api/segments/${s.id}`, { method: 'DELETE' }); await loadAll(); }}>Delete</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Custom Fields</CardTitle><CardDescription>Create lead/contact dynamic fields used in segmentation and templates</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Select value={fieldForm.entityType} onValueChange={(v) => setFieldForm((p) => ({ ...p, entityType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="lead">Lead</SelectItem><SelectItem value="contact">Contact</SelectItem></SelectContent>
              </Select>
              <Input placeholder="key (e.g. favoriteColor)" value={fieldForm.key} onChange={(e) => setFieldForm((p) => ({ ...p, key: e.target.value }))} />
              <Input placeholder="Label" value={fieldForm.label} onChange={(e) => setFieldForm((p) => ({ ...p, label: e.target.value }))} />
              <Select value={fieldForm.fieldType} onValueChange={(v) => setFieldForm((p) => ({ ...p, fieldType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                </SelectContent>
              </Select>
              <Button className="md:col-span-4" onClick={saveField}>Add Custom Field</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Field Registry</CardTitle><CardDescription>Organization-level custom field definitions</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {fields.map((f) => (
                <div key={f.id} className="p-2 border rounded text-sm flex justify-between">
                  <span>{f.entityType}.{f.key} ({f.fieldType}) - {f.label}</span>
                  <Button size="sm" variant="outline" onClick={async () => { await api(`/api/custom-fields/${f.id}`, { method: 'DELETE' }); await loadAll(); }}>Disable</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Campaign Analytics</CardTitle><CardDescription>Delivery, open, click and unsubscribe performance</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Select value={analyticsCampaignId || 'none'} onValueChange={(v) => setAnalyticsCampaignId(v === 'none' ? '' : v)}>
                  <SelectTrigger className="max-w-md"><SelectValue placeholder="Select campaign" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select campaign</SelectItem>
                    {campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button className="gap-2" onClick={loadAnalytics}><Clock3 className="w-4 h-4" />Refresh</Button>
              </div>

              {analytics ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Recipients</p><p className="font-bold text-xl">{analytics.totalRecipients}</p></CardContent></Card>
                  <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Sent</p><p className="font-bold text-xl">{analytics.sentCount}</p></CardContent></Card>
                  <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Open</p><p className="font-bold text-xl">{analytics.openCount}</p></CardContent></Card>
                  <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Click</p><p className="font-bold text-xl">{analytics.clickCount}</p></CardContent></Card>
                  <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Unsub</p><p className="font-bold text-xl">{analytics.unsubscribeCount}</p></CardContent></Card>
                </div>
              ) : <p className="text-sm text-gray-500">Select a campaign to view analytics.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Sender Configuration</CardTitle><CardDescription>Organization-level sender identity + blacklist management</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Sender name" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
              <Input placeholder="Sender email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} />
              <Input placeholder="Reply-to email" value={senderReplyTo} onChange={(e) => setSenderReplyTo(e.target.value)} />
              <Input placeholder="Timezone" value={orgTimezone} onChange={(e) => setOrgTimezone(e.target.value)} />
              <Input className="md:col-span-2" placeholder="Blacklist email" value={blacklistEmail} onChange={(e) => setBlacklistEmail(e.target.value)} />
              <Button className="md:col-span-2" onClick={saveCompliance}>Save Compliance Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
