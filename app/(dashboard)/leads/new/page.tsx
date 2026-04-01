'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeadStatus } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, User, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { LEAD_SOURCES } from '@/lib/constants';

// Helper component for horizontal form fields (Label left, Input right)
const FormField = ({ label, required = false, children }: { label: string, required?: boolean, children: React.ReactNode }) => (
  <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] items-center gap-4">
    <Label className="text-right text-sm font-medium text-slate-600">
      {label} {required && <span className="text-rose-500">*</span>}
    </Label>
    <div className="w-full max-w-sm">
      {children}
    </div>
  </div>
);

export default function NewLeadPage() {
  const router = useRouter();
  const t = useTranslations('common');
  const tLeads = useTranslations('leads');
  const [loading, setLoading] = useState(false);

  // We include extra fields for the UI to match Modern CRM, 
  // though the API will only process the ones in its schema.
  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    status: LeadStatus.NEW,
    source: '',
    score: 0,
    title: '',
    mobile: '',
    website: '',
    industry: 'none',
    noOfEmployees: '',
    annualRevenue: '',
    emailOptOut: false,
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'none',
    description: '',
    fax: '',
    customFields: {},
    image: null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<any[]>([]);

  useEffect(() => {
    async function loadCustomFields() {
      const res = await fetch('/api/custom-fields?entityType=leads');
      const json = await res.json();
      if (json.success) setCustomFieldDefinitions(json.data);
    }
    loadCustomFields();
  }, []);

  const handleChange = (field: string, value: any) => {
    if (field.startsWith('cf_')) {
      const key = field.replace('cf_', '');
      setFormData((prev: any) => ({
        ...prev,
        customFields: { ...prev.customFields, [key]: value }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isSaveAndNew = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image;

      // Handle image upload if a new file was selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          imageUrl = uploadData.url;
        }
      }

      // Create payload mapping our state to the API schema expectations
      const payload = {
        firstName: (formData.firstName || '').trim(),
        lastName: (formData.lastName || '').trim(),
        title: (formData.title || '').trim() || null,
        email: (formData.email || '').trim(),
        secondaryEmail: (formData.secondaryEmail || '').trim() || null,
        phone: (formData.phone || '').trim() || null,
        mobile: (formData.mobile || '').trim() || null,
        fax: (formData.fax || '').trim() || null,
        company: (formData.company || '').trim() || null,
        website: (formData.website || '').trim() || null,
        status: formData.status === 'none' ? 'new' : formData.status,
        source: formData.source !== 'none' ? formData.source : null,
        industry: formData.industry !== 'none' ? formData.industry : null,
        employees: formData.noOfEmployees ? parseInt(formData.noOfEmployees) : null,
        annualRevenue: formData.annualRevenue || null,
        rating: formData.rating !== 'none' ? formData.rating : null,
        emailOptOut: !!formData.emailOptOut,
        skypeId: (formData.skypeId || '').trim() || null,
        twitter: (formData.twitter || '').trim() || null,
        street: (formData.street || '').trim() || null,
        city: (formData.city || '').trim() || null,
        state: (formData.state || '').trim() || null,
        zip: (formData.zipCode || '').trim() || null,
        country: formData.country !== 'none' ? formData.country : null,
        description: (formData.description || '').trim() || null,
        score: parseInt(formData.score) || 0,
        image: imageUrl,
        customFields: formData.customFields,
      };

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (isSaveAndNew) {
          // Reset form
          setFormData({
            ...formData,
            firstName: '', lastName: '', email: '', phone: '', company: '',
            title: '', mobile: '', website: '', noOfEmployees: '', annualRevenue: '',
            street: '', city: '', state: '', zipCode: '', description: '', fax: '',
            image: null
          });
          setImageFile(null);
          setImagePreview(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          router.push(`/leads`);
        }
      } else {
        const errorMsg = data.details ? `${data.error}: ${JSON.stringify(data.details)}` : (data.error || t('error'));
        alert(errorMsg);
      }
    } catch (err) {
      alert(t('error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 relative">

      {/* Sticky Top Action Bar */}
      <div className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/leads')} className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">{tLeads('createLead')}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/leads')} disabled={loading} className="text-slate-600 hover:bg-slate-100">
            {t('cancel')}
          </Button>
          <Button variant="outline" onClick={(e) => handleSubmit(e, true)} disabled={loading} className="border-slate-300 text-slate-700 bg-white">
            {t('saveAndNew')}
          </Button>
          <Button onClick={(e) => handleSubmit(e, false)} disabled={loading} className="bg-primary hover:bg-primary/90 text-white shadow-sm px-6">
            {loading ? t('saving') : t('save')}
          </Button>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="max-w-[1200px] mx-auto">
          <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <form id="lead-form" onSubmit={(e) => handleSubmit(e, false)} className="p-8">

              {/* Lead Image Section */}
              <div className="mb-10 flex flex-col items-center sm:items-start">
                <h3 className="text-sm font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2 w-full">
                  {t('sections.image', { entity: tLeads('single') })}
                </h3>
                <div className="flex items-center gap-6">
                  <div
                    className="h-24 w-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-indigo-400 hover:text-indigo-500 transition-colors cursor-pointer group overflow-hidden relative"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 mb-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                  <div className="text-sm text-slate-500 flex flex-col gap-1">
                    <p>{t('placeholders.uploadNote')}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 w-fit"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      {t('browse')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lead Information Section */}
              <div className="mb-10">
                <h3 className="text-sm font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">
                  {t('sections.information', { entity: tLeads('single') })}
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">

                  {/* Left Column */}
                  <div className="space-y-6">
                    <FormField label={t('fields.owner', { entity: tLeads('single') })}>
                      <div className="flex items-center gap-2 px-3 py-1.5 border border-indigo-200 bg-indigo-50/50 rounded-md text-sm text-indigo-900">
                        <User className="h-4 w-4 text-indigo-500" />
                        <span className="font-medium">{t('activeUser')}</span>
                      </div>
                    </FormField>

                    <FormField label={t('fields.firstName')} required>
                      <Input
                        required
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                      />
                    </FormField>

                    <FormField label={t('fields.title')}>
                      <Input
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                      />
                    </FormField>

                    <FormField label={t('fields.phone')}>
                      <Input
                        type="tel"
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    </FormField>

                    <FormField label={t('fields.mobile')}>
                      <Input
                        type="tel"
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.mobile}
                        onChange={(e) => setFormData((f: any) => ({ ...f, mobile: e.target.value }))}
                      />
                    </FormField>

                    <FormField label={t('fields.fax')}>
                      <Input
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.fax}
                        onChange={(e) => setFormData((f: any) => ({ ...f, fax: e.target.value }))}
                      />
                    </FormField>

                    <FormField label={t('fields.source')}>
                      <Select value={formData.source} onValueChange={(val) => handleChange('source', val)}>
                        <SelectTrigger className="h-9 focus-visible:ring-indigo-500">
                          <SelectValue placeholder={t('placeholders.none')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('placeholders.none')}</SelectItem>
                          {LEAD_SOURCES.map(source => (
                            <SelectItem key={source} value={source}>
                              {t(`leadSources.${source}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label={t('fields.industry')}>
                      <Select value={formData.industry} onValueChange={(val) => handleChange('industry', val)}>
                        <SelectTrigger className="h-9 focus-visible:ring-indigo-500">
                          <SelectValue placeholder={t('none')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('none')}</SelectItem>
                          <SelectItem value="technology">{t('industries.technology')}</SelectItem>
                          <SelectItem value="healthcare">{t('industries.healthcare')}</SelectItem>
                          <SelectItem value="finance">{t('industries.finance')}</SelectItem>
                          <SelectItem value="retail">{t('industries.retail')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label={t('fields.rating')}>
                      <Select value={formData.rating} onValueChange={(val) => handleChange('rating', val)}>
                        <SelectTrigger className="h-9 focus-visible:ring-indigo-500">
                          <SelectValue placeholder={t('none')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('none')}</SelectItem>
                          <SelectItem value="Acquired">{t('ratings.acquired') || 'Acquired'}</SelectItem>
                          <SelectItem value="Active">{t('ratings.active') || 'Active'}</SelectItem>
                          <SelectItem value="Market Failed">{t('ratings.marketFailed') || 'Market Failed'}</SelectItem>
                          <SelectItem value="Project Cancelled">{t('ratings.projectCancelled') || 'Project Cancelled'}</SelectItem>
                          <SelectItem value="Shutdown">{t('ratings.shutdown') || 'Shutdown'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label={t('fields.revenue')}>
                      <Input
                        type="number"
                        placeholder={t('placeholders.currency')}
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.annualRevenue}
                        onChange={(e) => handleChange('annualRevenue', e.target.value)}
                      />
                    </FormField>

                    <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] items-start gap-4 pt-2">
                      <Label className="text-right text-sm font-medium text-slate-600 pt-0.5">
                        {t('fields.optOut')}
                      </Label>
                      <div className="w-full max-w-sm flex items-center h-5">
                        <Checkbox
                          checked={formData.emailOptOut}
                          onCheckedChange={(val) => handleChange('emailOptOut', !!val)}
                          className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <FormField label={t('fields.company')}>
                      <Input
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                      />
                    </FormField>

                    <FormField label={t('fields.lastName')}>
                      <Input
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                      />
                    </FormField>

                    <FormField label={t('fields.email')} required>
                      <Input
                        required
                        type="email"
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    </FormField>

                    <FormField label={t('fields.secondaryEmail')}>
                      <Input
                        type="email"
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.secondaryEmail}
                        onChange={(e) => handleChange('secondaryEmail', e.target.value)}
                      />
                    </FormField>

                    <FormField label={t('fields.skype')}>
                      <Input
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.skypeId}
                        onChange={(e) => handleChange('skypeId', e.target.value)}
                      />
                    </FormField>

                    <FormField label={t('fields.twitter')}>
                      <Input
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.twitter}
                        onChange={(e) => handleChange('twitter', e.target.value)}
                      />
                    </FormField>


                    <FormField label={t('fields.website')}>
                      <Input
                        type="url"
                        placeholder={t('placeholders.url')}
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.website}
                        onChange={(e) => handleChange('website', e.target.value)}
                      />
                    </FormField>

                    <FormField label={t('fields.status')}>
                      <Select value={formData.status} onValueChange={(val) => handleChange('status', val)}>
                        <SelectTrigger className="h-9 focus-visible:ring-indigo-500">
                          <SelectValue placeholder={t('placeholders.none')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('placeholders.none')}</SelectItem>
                          {Object.values(LeadStatus).map(status => (
                            <SelectItem key={status} value={status}>
                              {tLeads(`statuses.${status.toLowerCase()}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label={t('fields.employees')}>
                      <Input
                        type="number"
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.noOfEmployees}
                        onChange={(e) => handleChange('noOfEmployees', e.target.value)}
                      />
                    </FormField>

                    <FormField label={t('fields.score')}>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.score}
                        onChange={(e) => handleChange('score', e.target.value)}
                      />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* Custom Fields Section */}
              {customFieldDefinitions.length > 0 && (
                <div className="mb-10 animate-in fade-in slide-in-from-top-2 duration-500">
                  <h3 className="text-sm font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">
                    {t('sections.custom')}
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                    {customFieldDefinitions.map((field) => (
                      <FormField key={field.id} label={field.label} required={field.isRequired}>
                        {field.fieldType === 'select' ? (
                          <Select
                            value={formData.customFields[field.key] || ''}
                            onValueChange={(val) => handleChange(`cf_${field.key}`, val)}
                          >
                            <SelectTrigger className="h-9 focus-visible:ring-indigo-500 border-slate-200">
                              <SelectValue placeholder={t('placeholders.none')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">{t('placeholders.none')}</SelectItem>
                              {(field.options || []).map((opt: any) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : field.fieldType === 'boolean' ? (
                          <div className="flex items-center h-9">
                            <Checkbox
                              checked={!!formData.customFields[field.key]}
                              onCheckedChange={(val) => handleChange(`cf_${field.key}`, !!val)}
                              className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                          </div>
                        ) : field.fieldType === 'date' ? (
                          <Input
                            type="date"
                            className="h-9 focus-visible:ring-indigo-500 border-slate-200"
                            value={formData.customFields[field.key] || ''}
                            onChange={(e) => handleChange(`cf_${field.key}`, e.target.value)}
                          />
                        ) : field.fieldType === 'number' ? (
                          <Input
                            type="number"
                            className="h-9 focus-visible:ring-indigo-500 border-slate-200"
                            value={formData.customFields[field.key] || ''}
                            onChange={(e) => handleChange(`cf_${field.key}`, parseInt(e.target.value) || '')}
                          />
                        ) : (
                          <Input
                            className="h-9 focus-visible:ring-indigo-500 border-slate-200"
                            value={formData.customFields[field.key] || ''}
                            onChange={(e) => handleChange(`cf_${field.key}`, e.target.value)}
                          />
                        )}
                      </FormField>
                    ))}
                  </div>
                </div>
              )}

              {/* Address Information Section */}
              <div className="mb-10">
                <h3 className="text-sm font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">
                  {t('sections.address')}
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                  {/* Left Column Address */}
                  <div className="space-y-6">
                    <FormField label={t('fields.street')}>
                      <Input
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.street}
                        onChange={(e) => handleChange('street', e.target.value)}
                      />
                    </FormField>

                    <FormField label={t('fields.state')}>
                      <Input
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                      />
                    </FormField>

                    <FormField label={t('fields.country')}>
                      <Select value={formData.country} onValueChange={(val) => handleChange('country', val)}>
                        <SelectTrigger className="h-9 focus-visible:ring-indigo-500">
                          <SelectValue placeholder={t('none')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('none')}</SelectItem>
                          <SelectItem value="usa">{t('countries.usa')}</SelectItem>
                          <SelectItem value="uk">{t('countries.uk')}</SelectItem>
                          <SelectItem value="canada">{t('countries.canada')}</SelectItem>
                          <SelectItem value="australia">{t('countries.australia')}</SelectItem>
                          <SelectItem value="algeria">{t('countries.algeria')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  {/* Right Column Address */}
                  <div className="space-y-6">
                    <FormField label={t('fields.city')}>
                      <Input
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                      />
                    </FormField>

                    <FormField label={t('fields.zipCode')}>
                      <Input
                        className="h-9 focus-visible:ring-indigo-500"
                        value={formData.zipCode}
                        onChange={(e) => handleChange('zipCode', e.target.value)}
                      />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* Description Information */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">
                  {t('sections.description')}
                </h3>
                <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] items-start gap-4">
                  <Label className="text-right text-sm font-medium text-slate-600 pt-2">
                    {t('fields.description')}
                  </Label>
                  <div className="w-full max-w-4xl">
                    <Textarea
                      placeholder={t('placeholders.description')}
                      className="min-h-[120px] focus-visible:ring-indigo-500 resize-y"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="hidden" aria-hidden="true"></button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
