'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Search, MapPin, Building2, Phone, Mail, Link as LinkIcon, Calendar, Twitter, Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EntityAutocomplete from '@/components/ui/EntityAutocomplete';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DEAL_STAGES } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslations, useLocale } from 'next-intl';

const FieldLabel = ({ children, required, icon: Icon }: { children: React.ReactNode, required?: boolean, icon?: any }) => (
  <label className="text-[13px] font-medium text-slate-700 w-full sm:w-[160px] shrink-0 sm:text-right sm:pr-4 pt-2.5 flex sm:justify-end items-center gap-1.5">
    {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
    {children} {required && <span className="text-rose-500">*</span>}
  </label>
);

export default function NewDealPage() {
  const router = useRouter();
  const t = useTranslations('common');
  const tDeals = useTranslations('deals');
  const locale = useLocale();
  const currencySymbol = useMemo(() => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'DZD' })
      .format(0)
      .replace(/[0-9\s.,]/g, '');
  }, [locale]);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'' | 'save' | 'saveNew'>('');

  // Core API fields mapped
  const [form, setForm] = useState({
    name: '',
    accountId: '',
    contactId: '',
    campaignId: '',
    amount: '',
    closingDate: '',
    stage: 'Qualification',
    type: '-None-',
    source: '-None-',
    probability: '',
    nextStep: '',
    expectedRevenue: '',
    description: '',
  });

  const submit = async (e: React.FormEvent, action: 'save' | 'saveNew' = 'save') => {
    e.preventDefault();
    setLoading(true);
    setLoadingAction(action);

    try {
      const payload = {
        ...form,
        accountId: form.accountId || null,
        contactId: form.contactId || null,
        amount: form.amount || null,
        closingDate: form.closingDate ? new Date(form.closingDate).toISOString() : null,
        stage: form.stage,
        type: form.type === '-None-' ? null : form.type,
        source: form.source === '-None-' ? null : form.source,
        probability: form.probability ? parseInt(form.probability) : null,
        nextStep: form.nextStep || null,
        expectedRevenue: form.expectedRevenue || null,
        description: form.description || null,
      };

      const response = await fetch('/api/deals', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error || t('error'));
        setLoading(false);
        setLoadingAction('');
        return;
      }

      if (action === 'save') {
        router.push('/deals');
      } else {
        setForm({
          name: '',
          accountId: '',
          contactId: '',
          campaignId: '',
          amount: '',
          closingDate: '',
          stage: 'Qualification',
          type: '-None-',
          source: '-None-',
          probability: '',
          nextStep: '',
          expectedRevenue: '',
          description: '',
        });
        setLoading(false);
        setLoadingAction('');
        window.scrollTo(0, 0);
      }
    } catch {
      alert(t('error'));
      setLoading(false);
      setLoadingAction('');
    }
  };
  return (
    <div className="w-full h-full flex flex-col bg-slate-50 relative pb-12">

      {/* Sticky Top Header / Action Bar */}
      <div className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/deals">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rtl:rotate-180">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">{tDeals('createDeal')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/deals">
            <Button type="button" variant="outline" className="h-8 text-xs font-semibold px-4 text-slate-700 border-slate-300 hover:bg-slate-50">
              {t('cancel')}
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            className="h-8 text-xs font-semibold px-4 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
            disabled={loading}
            onClick={(e) => submit(e, 'saveNew')}
          >
            {loadingAction === 'saveNew' ? t('saving') : t('saveAndNew')}
          </Button>
          <Button
            type="button"
            className="h-8 text-xs font-semibold px-6 bg-primary hover:bg-primary/90 text-white shadow-sm"
            disabled={loading}
            onClick={(e) => submit(e, 'save')}
          >
            {loadingAction === 'save' ? t('saving') : t('save')}
          </Button>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <form id="deal-form" className="space-y-12">

          {/* Section: Deal Information */}
          <section>
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-900 mb-6 border-b border-slate-200 pb-2">{tDeals('sections.dealInfo')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">

              {/* Left Column */}
              <div className="space-y-6">
                {/* Read-only Owner placeholder */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tDeals('fields.owner')}</FieldLabel>
                  <div className="flex-1 relative">
                    <Input readOnly value={t('activeUser')} className="h-9 text-sm border-blue-200 bg-blue-50/50 text-blue-900 font-medium cursor-default rtl:pr-4" />
                    <User className="absolute right-3 top-2.5 h-4 w-4 text-blue-500 rtl:right-auto rtl:left-3" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel required>{tDeals('fields.name')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      required
                      placeholder={t('placeholders.dealName')}
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel icon={Building2}>{tDeals('fields.account')}</FieldLabel>
                  <div className="flex-1 relative">
                    <EntityAutocomplete
                      endpoint="/api/accounts"
                      placeholder={t('placeholders.searchAccounts')}
                      value={form.accountId}
                      onChange={(id) => setForm(f => ({ ...f, accountId: id }))}
                    />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 rtl:right-auto rtl:left-3" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tDeals('fields.type')}</FieldLabel>
                  <div className="flex-1">
                    <Select
                      value={form.type}
                      onValueChange={(v) => setForm(f => ({ ...f, type: v }))}
                    >
                      <SelectTrigger className="h-9 text-sm focus:ring-indigo-500 shadow-sm">
                        <SelectValue placeholder={t('none')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-None-">{t('none')}</SelectItem>
                        <SelectItem value="Existing Business">{t('types.existing') || 'Existing Business'}</SelectItem>
                        <SelectItem value="New Business">{t('types.new') || 'New Business'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tDeals('fields.nextStep')}</FieldLabel>
                  <div className="flex-1">
                    <Input
                      value={form.nextStep}
                      onChange={(e) => setForm(f => ({ ...f, nextStep: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tDeals('fields.leadSource')}</FieldLabel>
                  <div className="flex-1">
                    <Select
                      value={form.source}
                      onValueChange={(v) => setForm(f => ({ ...f, source: v }))}
                    >
                      <SelectTrigger className="h-9 text-sm focus:ring-indigo-500 shadow-sm">
                        <SelectValue placeholder={t('none')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-None-">{t('none')}</SelectItem>
                        <SelectItem value="Advertisement">{t('leadSources.advertisement')}</SelectItem>
                        <SelectItem value="Cold Call">{t('leadSources.coldCall')}</SelectItem>
                        <SelectItem value="Employee Referral">{t('leadSources.employeeReferral')}</SelectItem>
                        <SelectItem value="External Referral">{t('leadSources.externalReferral')}</SelectItem>
                        <SelectItem value="Online Store">{t('leadSources.onlineStore')}</SelectItem>
                        <SelectItem value="Partner">{t('leadSources.partner')}</SelectItem>
                        <SelectItem value="Public Relations">{t('leadSources.publicRelations')}</SelectItem>
                        <SelectItem value="Sales Email Alias">{t('leadSources.salesEmailAlias')}</SelectItem>
                        <SelectItem value="Seminar Partner">{t('leadSources.seminarPartner')}</SelectItem>
                        <SelectItem value="Internal Seminar">{t('leadSources.internalSeminar')}</SelectItem>
                        <SelectItem value="Trade Show">{t('leadSources.tradeShow')}</SelectItem>
                        <SelectItem value="Web Download">{t('leadSources.webDownload')}</SelectItem>
                        <SelectItem value="Web Research">{t('leadSources.webResearch')}</SelectItem>
                        <SelectItem value="Chat">{t('leadSources.chat')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel icon={User}>{tDeals('fields.contact')}</FieldLabel>
                  <div className="flex-1 relative">
                    <EntityAutocomplete
                      endpoint="/api/contacts"
                      placeholder={t('placeholders.searchContacts')}
                      value={form.contactId}
                      onChange={(id) => setForm(f => ({ ...f, contactId: id }))}
                    />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 rtl:right-auto rtl:left-3" />
                  </div>
                </div>

              </div>

              {/* Right Column */}
              <div className="space-y-6">

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tDeals('fields.amount')}</FieldLabel>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2.5 text-sm text-slate-500 font-medium rtl:left-auto rtl:right-3">{currencySymbol}</span>
                    <Input
                      type="number"
                      className="h-9 pl-7 pr-4 text-sm focus-visible:ring-indigo-500 shadow-sm font-semibold text-slate-900 rtl:pl-4 rtl:pr-7"
                      value={form.amount}
                      onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel required>{tDeals('fields.closingDate')}</FieldLabel>
                  <div className="flex-1 relative">
                    <Input
                      type="date"
                      value={form.closingDate}
                      onChange={(e) => setForm(f => ({ ...f, closingDate: e.target.value }))}
                      className="h-9 text-sm focus-visible:ring-indigo-500 shadow-sm pr-9 pl-4 text-slate-900 rtl:pr-4 rtl:pl-9"
                      required
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none rtl:right-auto rtl:left-3" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tDeals('fields.stage')}</FieldLabel>
                  <div className="flex-1">
                    <Select
                      value={form.stage}
                      onValueChange={(v) => {
                        // Automatically set probability based on stage
                        let newProb = '50';
                        if (v === 'prospecting') newProb = '10';
                        if (v === 'qualification') newProb = '20';
                        if (v === 'needs_analysis') newProb = '30';
                        if (v === 'value_proposition') newProb = '40';
                        if (v === 'id_decision_makers') newProb = '60';
                        if (v === 'perception_analysis') newProb = '70';
                        if (v === 'proposal') newProb = '75';
                        if (v === 'negotiation') newProb = '90';
                        if (v === 'closed_won') newProb = '100';
                        if (v === 'closed_lost') newProb = '0';

                        setForm(f => ({ ...f, stage: v, probability: newProb }));
                      }}
                    >
                      <SelectTrigger className="h-9 text-[13px] font-semibold tracking-wide text-slate-700 bg-white focus:ring-indigo-500 shadow-sm border-l-4 border-l-indigo-500 border-y-slate-200 border-r-slate-200 rtl:border-l-0 rtl:border-r-4 rtl:border-r-indigo-500">
                        <SelectValue placeholder={t('none')} />
                      </SelectTrigger>
                      <SelectContent>
                        {DEAL_STAGES.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {t(`dealStages.${s.id}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tDeals('fields.probability')}</FieldLabel>
                  <div className="flex-1 relative">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={form.probability}
                      onChange={(e) => setForm(f => ({ ...f, probability: e.target.value }))}
                      className="h-9 pr-7 text-sm focus-visible:ring-indigo-500 shadow-sm font-medium"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">%</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tDeals('fields.expectedRevenue')}</FieldLabel>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2.5 text-sm text-slate-500">{currencySymbol}</span>
                    <Input
                      type="number"
                      readOnly
                      value={(Number(form.amount) * (Number(form.probability) / 100)).toFixed(2)}
                      className="h-9 pl-7 text-sm bg-slate-50 border-slate-200 text-slate-500 cursor-default shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <FieldLabel>{tDeals('fields.campaignSource')}</FieldLabel>
                  <div className="flex-1 relative">
                    <EntityAutocomplete
                      endpoint="/api/campaigns"
                      placeholder={t('placeholders.searchCampaigns')}
                      value={form.campaignId}
                      onChange={(id) => setForm(f => ({ ...f, campaignId: id }))}
                    />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 rtl:right-auto rtl:left-3" />
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Section: Description Information */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-2">
              <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-900">{t('descriptionInfo')}</h2>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                <FieldLabel>{t('description')}</FieldLabel>
                <div className="flex-1 max-w-4xl">
                  <Textarea
                    placeholder={t('placeholders.description')}
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
