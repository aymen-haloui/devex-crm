'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Search, MapPin, Building2, Phone, Mail, Link as LinkIcon, Calendar, Twitter, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EntityAutocomplete from '@/components/ui/EntityAutocomplete';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useTranslations } from 'next-intl';

const FieldLabel = ({ children, required }: { children: React.ReactNode, required?: boolean }) => (
  <label className="text-[13px] font-medium text-slate-700 w-full sm:w-[160px] shrink-0 sm:text-right sm:pr-4 pt-2.5">
    {children} {required && <span className="text-rose-500">*</span>}
  </label>
);

export default function NewContactPage() {
  const router = useRouter();
  const tCommon = useTranslations('common');
  const tContacts = useTranslations('contacts');
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'' | 'save' | 'saveNew'>('');

  // Core API fields mapped
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    homePhone: '',
    otherPhone: '',
    assistant: '',
    asstPhone: '',
    title: '',
    department: '',
    dob: '',
    fax: '',
    skypeId: '',
    twitter: '',
    secondaryEmail: '',
    emailOptOut: false,
    source: '-None-',
    reportingTo: '',
    accountId: '',
    vendorName: '',
    mailingStreet: '',
    mailingCity: '',
    mailingState: '',
    mailingZip: '',
    mailingCountry: '',
    otherStreet: '',
    otherCity: '',
    otherState: '',
    otherZip: '',
    otherCountry: '',
    description: '',
  });

  const submit = async (e: React.FormEvent, action: 'save' | 'saveNew' = 'save') => {
    e.preventDefault();
    setLoading(true);
    setLoadingAction(action);

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          lastName: form.lastName || null,
          phone: form.phone || null,
          mobile: form.mobile || null,
          homePhone: form.homePhone || null,
          otherPhone: form.otherPhone || null,
          assistant: form.assistant || null,
          asstPhone: form.asstPhone || null,
          title: form.title || null,
          department: form.department || null,
          dob: form.dob || null,
          fax: form.fax || null,
          skypeId: form.skypeId || null,
          twitter: form.twitter || null,
          secondaryEmail: form.secondaryEmail || null,
          source: form.source === '-None-' ? null : form.source,
          reportingTo: form.reportingTo || null,
          accountId: form.accountId || null,
          vendorName: form.vendorName || null,
          mailingStreet: form.mailingStreet || null,
          mailingCity: form.mailingCity || null,
          mailingState: form.mailingState || null,
          mailingZip: form.mailingZip || null,
          mailingCountry: form.mailingCountry || null,
          otherStreet: form.otherStreet || null,
          otherCity: form.otherCity || null,
          otherState: form.otherState || null,
          otherZip: form.otherZip || null,
          otherCountry: form.otherCountry || null,
          description: form.description || null,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || tCommon('error'));
        setLoading(false);
        setLoadingAction('');
        return;
      }

      if (action === 'save') {
        router.push('/contacts');
      } else {
        // saveNew: reset form
        setForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          mobile: '',
          homePhone: '',
          otherPhone: '',
          assistant: '',
          asstPhone: '',
          title: '',
          department: '',
          dob: '',
          fax: '',
          skypeId: '',
          twitter: '',
          secondaryEmail: '',
          emailOptOut: false,
          source: '-None-',
          reportingTo: '',
          accountId: '',
          vendorName: '',
          mailingStreet: '',
          mailingCity: '',
          mailingState: '',
          mailingZip: '',
          mailingCountry: '',
          otherStreet: '',
          otherCity: '',
          otherState: '',
          otherZip: '',
          otherCountry: '',
          description: '',
        });
        setLoading(false);
        setLoadingAction('');
        window.scrollTo(0, 0);
      }
    } catch {
      alert(tCommon('error'));
      setLoading(false);
      setLoadingAction('');
    }
  };
  return (
    <div className="w-full h-full flex flex-col bg-slate-50 relative pb-12">

      {/* Sticky Top Header / Action Bar */}
      <div className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/contacts">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">{tContacts('createContact')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/contacts">
            <Button type="button" variant="outline" className="h-8 text-xs font-semibold px-4 text-slate-700 border-slate-300 hover:bg-slate-50">
              {tCommon('cancel')}
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            className="h-8 text-xs font-semibold px-4 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
            disabled={loading}
            onClick={(e) => submit(e, 'saveNew')}
          >
            {loadingAction === 'saveNew' ? tCommon('saving') : tCommon('saveAndNew')}
          </Button>
          <Button
            type="button"
            className="h-8 text-xs font-semibold px-6 bg-primary hover:bg-primary/90 text-white shadow-sm"
            disabled={loading}
            onClick={(e) => submit(e, 'save')}
          >
            {loadingAction === 'save' ? tCommon('saving') : tCommon('save')}
          </Button>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <form id="contact-form" className="space-y-12">

          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-6 border-b border-slate-200 pb-2">{tContacts('sections.contactImage')}</h2>
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-slate-100 border border-slate-200 border-dashed flex items-center justify-center relative overflow-hidden group cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-colors shadow-sm">
                <User className="h-8 w-8 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                <div className="absolute inset-x-0 bottom-0 bg-black/50 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-white font-medium uppercase tracking-wider">{tCommon('upload')}</span>
                </div>
              </div>
              <div className="text-sm text-slate-500 max-w-sm">
                <p>{tContacts('uploadPhoto')}</p>
                <p className="text-xs mt-1">{tCommon('acceptableFormats')}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-6 border-b border-slate-200 pb-2">{tContacts('sections.contactInfo')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">

              {/* Left Column */}
              <div className="space-y-6">
                {/* Read-only Owner placeholder */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.owner')}</FieldLabel>
                  <div className="flex-1 relative">
                    <Input readOnly value={tCommon('activeUser')} className="h-9 text-sm border-blue-200 bg-blue-50/50 text-blue-900 font-medium" />
                    <User className="absolute right-3 top-2.5 h-4 w-4 text-blue-500" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel required>{tContacts('fields.firstName')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      required
                      placeholder={tCommon('placeholders.firstName')}
                      value={form.firstName}
                      onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.accountName')}</FieldLabel>
                  <div className="flex-1 relative">
                    <EntityAutocomplete
                      endpoint="/api/accounts"
                      placeholder={tCommon('placeholders.searchAccounts')}
                      value={form.accountId}
                      onChange={(id) => setForm(f => ({ ...f, accountId: id }))}
                    />
                    <Building2 className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel required>{tContacts('fields.email')}</FieldLabel>
                  <div className="flex-1 relative">
                    <Input
                      required
                      type="email"
                      placeholder={tCommon('placeholders.email')}
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm pr-9"
                    />
                    <Mail className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.phone')}</FieldLabel>
                  <div className="flex-1 relative">
                    <Input
                      type="tel"
                      placeholder={tCommon('placeholders.phone')}
                      value={form.phone}
                      onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm pr-9"
                    />
                    <Phone className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.otherPhone')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      value={form.otherPhone}
                      onChange={(e) => setForm(f => ({ ...f, otherPhone: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.mobile')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      value={form.mobile}
                      onChange={(e) => setForm(f => ({ ...f, mobile: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.assistant')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      value={form.assistant}
                      onChange={(e) => setForm(f => ({ ...f, assistant: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.leadSource')}</FieldLabel>
                  <div className="flex-1">
                    <Select
                      value={form.source}
                      onValueChange={(v) => setForm(f => ({ ...f, source: v }))}
                    >
                      <SelectTrigger className="h-9 text-sm focus:ring-indigo-500 shadow-sm">
                        <SelectValue placeholder={tCommon('none')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-None-">{tCommon('none')}</SelectItem>
                        <SelectItem value="Advertisement">{tCommon('sources.advertisement')}</SelectItem>
                        <SelectItem value="Cold Call">{tCommon('sources.coldCall')}</SelectItem>
                        <SelectItem value="Employee Referral">{tCommon('sources.employeeReferral')}</SelectItem>
                        <SelectItem value="External Referral">{tCommon('sources.externalReferral')}</SelectItem>
                        <SelectItem value="Partner">{tCommon('sources.partner')}</SelectItem>
                        <SelectItem value="Public Relations">{tCommon('sources.publicRelations')}</SelectItem>
                        <SelectItem value="Trade Show">{tCommon('sources.tradeShow')}</SelectItem>
                        <SelectItem value="WebForm">{tCommon('sources.webForm')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.lastName')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      placeholder={tCommon('placeholders.lastName')}
                      value={form.lastName}
                      onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.vendorName')}</FieldLabel>
                  <div className="flex-1 relative">
                    <Input className="h-9 text-sm pr-9 focus-visible:ring-indigo-500 shadow-sm" />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.title')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      placeholder={tCommon('placeholders.title')}
                      value={form.title}
                      onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.department')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      value={form.department}
                      onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.homePhone')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      value={form.homePhone}
                      onChange={(e) => setForm(f => ({ ...f, homePhone: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.fax')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      value={form.fax}
                      onChange={(e) => setForm(f => ({ ...f, fax: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.dob')}</FieldLabel>
                  <div className="flex-1 position-relative">
                    <Input
                      type="date"
                      value={form.dob}
                      onChange={(e) => setForm(f => ({ ...f, dob: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.asstPhone')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      value={form.asstPhone}
                      onChange={(e) => setForm(f => ({ ...f, asstPhone: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.emailOptOut')}</FieldLabel>
                  <div className="flex-1 flex items-center h-9">
                    <Checkbox
                      checked={form.emailOptOut}
                      onCheckedChange={(c) => setForm(f => ({ ...f, emailOptOut: !!c }))}
                      className="border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.skypeId')}</FieldLabel>
                  <div className="flex-1 relative">
                    <Input
                      value={form.skypeId}
                      onChange={(e) => setForm(f => ({ ...f, skypeId: e.target.value }))}
                      className="h-9 text-sm pr-9 focus-visible:ring-indigo-500 shadow-sm"
                    />
                    <LinkIcon className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.secondaryEmail')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      type="email"
                      value={form.secondaryEmail}
                      onChange={(e) => setForm(f => ({ ...f, secondaryEmail: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.twitter')}</FieldLabel>
                  <div className="flex-1 relative">
                    <Input
                      value={form.twitter}
                      onChange={(e) => setForm(f => ({ ...f, twitter: e.target.value }))}
                      className="h-9 text-sm pr-9 focus-visible:ring-indigo-500 shadow-sm"
                    />
                    <Twitter className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tContacts('fields.reportingTo')}</FieldLabel>
                  <div className="flex-1 relative">
                    <Input
                      value={form.reportingTo}
                      onChange={(e) => setForm(f => ({ ...f, reportingTo: e.target.value }))}
                      className="h-9 text-sm pr-9 focus-visible:ring-indigo-500 shadow-sm"
                    />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-2">
              <h2 className="text-sm font-semibold text-slate-900">{tCommon('addressInformation')}</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs px-3"
                onClick={() => setForm(f => ({
                  ...f,
                  otherStreet: f.mailingStreet,
                  otherCity: f.mailingCity,
                  otherState: f.mailingState,
                  otherZip: f.mailingZip,
                  otherCountry: f.mailingCountry,
                }))}
              >
                {tCommon('copyAddress')}
              </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

              {/* Mailing Address Block */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{tCommon('mailingAddress')}</h3>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tCommon('countryRegion')}</FieldLabel>
                  <div className="flex-1">
                    <Select
                      value={form.mailingCountry}
                      onValueChange={(v) => setForm(f => ({ ...f, mailingCountry: v }))}
                    >
                      <SelectTrigger className="h-9 text-sm focus:ring-indigo-500">
                        <SelectValue placeholder={tCommon('none')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-None-">{tCommon('none')}</SelectItem>
                        <SelectItem value="US">{tCommon('countries.us')}</SelectItem>
                        <SelectItem value="CA">{tCommon('countries.ca')}</SelectItem>
                        <SelectItem value="GB">{tCommon('countries.gb')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tCommon('streetAddress')}</FieldLabel>
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder={tCommon('placeholders.houseBuilding')}
                      value={form.mailingStreet}
                      onChange={(e) => setForm(f => ({ ...f, mailingStreet: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tCommon('city')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      value={form.mailingCity}
                      onChange={(e) => setForm(f => ({ ...f, mailingCity: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tCommon('stateProvince')}</FieldLabel>
                  <div className="flex-1">
                    <Select
                      value={form.mailingState}
                      onValueChange={(v) => setForm(f => ({ ...f, mailingState: v }))}
                    >
                      <SelectTrigger className="h-9 text-sm focus:ring-indigo-500">
                        <SelectValue placeholder={tCommon('none')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-None-">{tCommon('none')}</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tCommon('zipPostalCode')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      value={form.mailingZip}
                      onChange={(e) => setForm(f => ({ ...f, mailingZip: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Other Address Block */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{tCommon('otherAddress')}</h3>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tCommon('countryRegion')}</FieldLabel>
                  <div className="flex-1">
                    <Select
                      value={form.otherCountry}
                      onValueChange={(v) => setForm(f => ({ ...f, otherCountry: v }))}
                    >
                      <SelectTrigger className="h-9 text-sm focus:ring-indigo-500">
                        <SelectValue placeholder={tCommon('none')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-None-">{tCommon('none')}</SelectItem>
                        <SelectItem value="US">{tCommon('countries.us')}</SelectItem>
                        <SelectItem value="CA">{tCommon('countries.ca')}</SelectItem>
                        <SelectItem value="GB">{tCommon('countries.gb')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tCommon('streetAddress')}</FieldLabel>
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder={tCommon('placeholders.houseBuilding')}
                      value={form.otherStreet}
                      onChange={(e) => setForm(f => ({ ...f, otherStreet: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tCommon('city')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      value={form.otherCity}
                      onChange={(e) => setForm(f => ({ ...f, otherCity: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tCommon('stateProvince')}</FieldLabel>
                  <div className="flex-1">
                    <Select
                      value={form.otherState}
                      onValueChange={(v) => setForm(f => ({ ...f, otherState: v }))}
                    >
                      <SelectTrigger className="h-9 text-sm focus:ring-indigo-500">
                        <SelectValue placeholder={tCommon('none')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-None-">{tCommon('none')}</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tCommon('zipPostalCode')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      value={form.otherZip}
                      onChange={(e) => setForm(f => ({ ...f, otherZip: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-2">
              <h2 className="text-sm font-semibold text-slate-900">{tCommon('descriptionInformation')}</h2>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                <FieldLabel>{tCommon('description')}</FieldLabel>
                <div className="flex-1 max-w-4xl">
                  <Textarea
                    placeholder={tCommon('placeholders.description')}
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    className="min-h-[120px] text-sm focus-visible:ring-indigo-500 shadow-sm resize-y"
                  />
                </div>
              </div>
            </div>
          </section>

        </form>
      </div>

    </div>
  );
}
