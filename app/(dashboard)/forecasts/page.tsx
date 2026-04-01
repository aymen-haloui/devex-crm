'use client';

import { useState, useEffect, useMemo } from 'react';
import { Target, TrendingUp, BarChart2, Plus, Settings, ChevronDown, Check, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

import { useTranslations, useLocale } from 'next-intl';

export default function ForecastsPage() {
  const t = useTranslations('forecasts');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 });
  }, [locale]);

  const currencySymbol = useMemo(() => {
    return currencyFormatter.format(0).replace(/[0-9\s.,]/g, '');
  }, [currencyFormatter]);
  const [loading, setLoading] = useState(true);

  // Data State
  const [config, setConfig] = useState<any>(null);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [selectedForecast, setSelectedForecast] = useState<any>(null);
  const [achievements, setAchievements] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  // UI State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'target' | 'achievement'>('achievement'); // toggles target vs achievement

  // Forms State
  const [configForm, setConfigForm] = useState({ model: 'bottom_up', hierarchyType: 'roles', metric: 'revenue', fiscalYearType: 'standard', fiscalStartMonth: 1 });
  const [createForm, setCreateForm] = useState({ type: 'quarterly', period: 'Q1', year: new Date().getFullYear().toString(), name: '' });

  // Target Setting State
  const [targetsForm, setTargetsForm] = useState<{ companyTarget: string, userTargets: Record<string, string> }>({ companyTarget: '', userTargets: {} });
  const [savingTargets, setSavingTargets] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [configRes, forecastsRes, usersRes] = await Promise.all([
        fetch('/api/forecasts/config').then(r => r.json()),
        fetch('/api/forecasts').then(r => r.json()),
        fetch('/api/users').then(r => r.json())
      ]);

      if (configRes.success && configRes.data) {
        // config endpoint auto-creates a default if none exists, but let's assume it requires explicit saving if we want to show 'Configure Now'
        // We will check if it was explicitly updated by looking at 'createdAt' vs 'updatedAt' or just assume we show empty state if no forecasts exist
        setConfig(configRes.data);
      }

      if (forecastsRes.success) {
        setForecasts(forecastsRes.data);
        if (forecastsRes.data.length > 0) {
          setSelectedForecast(forecastsRes.data[0]);
        }
      }

      if (usersRes.success) {
        setUsers(usersRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedForecast) {
      fetchAchievements(selectedForecast.id);

      // Populate local target form
      const cTarget = selectedForecast.targets?.find((t: any) => t.isCompanyTarget);
      const uTargets: Record<string, string> = {};
      selectedForecast.targets?.filter((t: any) => !t.isCompanyTarget && t.userId).forEach((t: any) => {
        uTargets[t.userId] = t.targetValue.toString();
      });

      setTargetsForm({
        companyTarget: cTarget ? cTarget.targetValue.toString() : '',
        userTargets: uTargets
      });
    }
  }, [selectedForecast]);

  const fetchAchievements = async (id: string) => {
    try {
      const res = await fetch(`/api/forecasts/achievements?forecastId=${id}`);
      const data = await res.json();
      if (data.success) {
        setAchievements(data.data.metrics);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const res = await fetch('/api/forecasts/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configForm)
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        setIsConfigModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateForecast = async () => {
    try {
      const name = createForm.name || `Forecast ${createForm.period} ${createForm.year}`;
      const res = await fetch('/api/forecasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...createForm, name, targets: [] })
      });
      const data = await res.json();
      if (data.success) {
        setForecasts([data.data, ...forecasts]);
        setSelectedForecast(data.data);
        setViewMode('target'); // Automatically open target assignment
        setIsCreateModalOpen(false);
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveTargets = async () => {
    if (!selectedForecast) return;
    setSavingTargets(true);
    try {
      const payload = [];
      if (targetsForm.companyTarget) {
        payload.push({ isCompanyTarget: true, targetValue: Number(targetsForm.companyTarget) });
      }
      for (const [userId, val] of Object.entries(targetsForm.userTargets)) {
        if (val) {
          payload.push({ isCompanyTarget: false, userId, targetValue: Number(val) });
        }
      }

      const res = await fetch('/api/forecasts/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forecastId: selectedForecast.id, targets: payload })
      });

      const data = await res.json();
      if (data.success) {
        // Reload current forecast by fetching all again to get nested targets
        fetchInitialData();
        setViewMode('achievement');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingTargets(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-tight">{tCommon('loading')}</div>;
  }

  // Formatting currency
  const formatCurrency = (val: number) => currencyFormatter.format(val);

  // --- RENDERS ---

  if (forecasts.length === 0) {
    return (
      <div className="w-full h-full p-8 flex flex-col bg-slate-50 relative">
        <div className="mx-auto flex h-full min-h-[75vh] w-full max-w-5xl flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-14 tracking-tight">{t('welcomeTitle')}</h1>

          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center transition-all hover:shadow-md">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-indigo-100 bg-indigo-50 text-indigo-600">
                <Target className="h-8 w-8" />
              </div>
              <p className="font-semibold text-slate-900 text-[15px]">{t('steps.setTarget.title')}</p>
              <p className="mt-3 text-[13px] text-slate-500 max-w-[200px] leading-relaxed">
                {t('steps.setTarget.desc')}
              </p>
            </div>
            {/* Step 2 */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center transition-all hover:shadow-md">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-100 bg-amber-50 text-amber-500">
                <BarChart2 className="h-8 w-8" />
              </div>
              <p className="font-semibold text-slate-900 text-[15px]">{t('steps.trackAchievement.title')}</p>
              <p className="mt-3 text-[13px] text-slate-500 max-w-[200px] leading-relaxed">
                {t('steps.trackAchievement.desc')}
              </p>
            </div>
            {/* Step 3 */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center transition-all hover:shadow-md">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-100 bg-emerald-50 text-emerald-500">
                <TrendingUp className="h-8 w-8" />
              </div>
              <p className="font-semibold text-slate-900 text-[15px]">{t('steps.predictAnalyse.title')}</p>
              <p className="mt-3 text-[13px] text-slate-500 max-w-[200px] leading-relaxed">
                {t('steps.predictAnalyse.desc')}
              </p>
            </div>
          </div>

          <Button
            className="mt-14 h-10 px-8 bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-sm"
            onClick={() => {
              // If config was never touched (we can assume if targets length is 0 or something), show config, else show create.
              // For simplicity, always show Config if no forecasts exist yet just to be safe, or show Create if config is good.
              setIsCreateModalOpen(true);
            }}
          >
            {t('createForecast')}
          </Button>
        </div>

        {/* Create Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-xl rounded-xl">
            <div className="px-6 py-4 border-b border-slate-100 bg-white">
              <DialogTitle className="text-lg font-bold text-slate-900">{t('createForecast')}</DialogTitle>
            </div>
            <div className="px-6 py-6 space-y-6 bg-slate-50/50">

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-[13px] font-medium text-slate-700 text-right rtl:text-left">{t('forecastType')}</label>
                <div className="col-span-2">
                  <Select value={createForm.type} onValueChange={(v) => setCreateForm({ ...createForm, type: v })}>
                    <SelectTrigger className="h-9 w-full bg-white shadow-sm border-slate-200 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quarterly">{t('quarterly')}</SelectItem>
                      <SelectItem value="monthly">{t('monthly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-[13px] font-medium text-slate-700 text-right rtl:text-left">{t('forecastPeriod')}</label>
                <div className="col-span-2">
                  <div className="flex gap-3">
                    <Select value={createForm.period} onValueChange={(v) => setCreateForm({ ...createForm, period: v })}>
                      <SelectTrigger className="h-9 flex-1 bg-white shadow-sm border-slate-200 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {createForm.type === 'quarterly' ? (
                          <>
                            <SelectItem value="Q1">{t('quarters.q1')}</SelectItem>
                            <SelectItem value="Q2">{t('quarters.q2')}</SelectItem>
                            <SelectItem value="Q3">{t('quarters.q3')}</SelectItem>
                            <SelectItem value="Q4">{t('quarters.q4')}</SelectItem>
                          </>
                        ) : (
                          Array.from({ length: 12 }).map((_, i) => (
                            <SelectItem key={i} value={`M${i + 1}`}>{t('monthLiteral')} {i + 1}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Input
                      className="h-9 w-[100px] bg-white shadow-sm border-slate-200 text-sm"
                      value={createForm.year}
                      onChange={(e) => setCreateForm({ ...createForm, year: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-[13px] font-medium text-slate-700 text-right rtl:text-left">{t('forecastName')}</label>
                <div className="col-span-2">
                  <Input
                    className="h-9 w-full bg-white shadow-sm border-slate-200 text-sm"
                    placeholder={t('placeholders.forecastName')}
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  />
                </div>
              </div>

            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
              <Button variant="ghost" className="h-9 text-[13px] font-medium" onClick={() => setIsCreateModalOpen(false)}>{tCommon('cancel')}</Button>
              <Button className="h-9 text-[13px] font-medium bg-indigo-600 hover:bg-indigo-700" onClick={handleCreateForecast}>{tCommon('create')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // MAIN PIPELINE / TARGET VIEW
  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">

      {/* Header Bar */}
      <div className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Forecast Selector */}
          <Select
            value={selectedForecast?.id}
            onValueChange={(id) => setSelectedForecast(forecasts.find(f => f.id === id))}
          >
            <SelectTrigger className="w-[200px] h-9 border-none bg-slate-100/80 hover:bg-slate-200/60 focus:ring-0 font-bold text-slate-800 text-[15px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {forecasts.map(f => (
                <SelectItem key={f.id} value={f.id} className="font-medium">{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-5 w-[1px] bg-slate-200 mx-1"></div>

          {/* Target vs Achievement Toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200 shadow-inner rtl:flex-row-reverse">
            <button
              className={`px-4 py-1.5 text-[13px] font-semibold rounded-sm transition-colors ${viewMode === 'achievement' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setViewMode('achievement')}
            >
              {t('achievement')}
            </button>
            <button
              className={`px-4 py-1.5 text-[13px] font-semibold rounded-sm transition-colors ${viewMode === 'target' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setViewMode('target')}
            >
              {t('target')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-8 px-3 text-[13px] font-medium text-slate-600 border-slate-200 bg-white hover:bg-slate-50" onClick={() => setIsConfigModalOpen(true)}>
            <Settings className="w-4 h-4 mr-2 ml-2 text-slate-400" />
            {t('configure')}
          </Button>
          <Button variant="outline" className="h-8 px-3 text-[13px] font-medium text-slate-600 border-slate-200 bg-white hover:bg-slate-50" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1 ml-1 text-slate-400" />
            {t('newForecast')}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {viewMode === 'target' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-[15px] font-bold text-slate-800">{t('setTargetsFor', { name: selectedForecast?.name })}</h2>
                <Button
                  className="h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 px-6 shadow-sm"
                  onClick={handleSaveTargets}
                  disabled={savingTargets}
                >
                  {savingTargets ? tCommon('saving') : t('saveTargets')}
                </Button>
              </div>

              <div className="p-6">
                <div className="max-w-xl">

                  {/* Company Target */}
                  <div className="flex items-center mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-32 text-sm font-semibold text-slate-900 shrink-0 rtl:text-right rtl:pl-4">{t('companyTarget')}</div>
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-2 text-sm font-medium text-slate-500 rtl:left-auto rtl:right-3">{currencySymbol}</span>
                      <Input
                        type="number"
                        className="h-9 pl-7 pr-4 border-slate-300 font-semibold focus-visible:ring-indigo-500 shadow-sm rtl:pl-4 rtl:pr-7"
                        value={targetsForm.companyTarget}
                        onChange={(e) => setTargetsForm({ ...targetsForm, companyTarget: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Hierarchy Tree Visual */}
                  <div className="pl-4 space-y-4">
                    {users.map((user, idx) => (
                      <div key={user.id} className="relative flex items-center group">
                        {/* Tree Lines */}
                        <div className="absolute -left-[27px] top-1/2 w-5 border-t-2 border-slate-200"></div>
                        {idx !== users.length - 1 && <div className="absolute -left-[27px] top-1/2 bottom-[-24px] border-l-2 border-slate-200"></div>}
                        {idx === users.length - 1 && <div className="absolute -left-[27px] -top-12 bottom-1/2 border-l-2 border-slate-200"></div>}
                        {idx === 0 && <div className="absolute -left-[27px] -top-12 bottom-1/2 border-l-2 border-slate-200"></div>}
                        {idx > 0 && idx < users.length - 1 && <div className="absolute -left-[27px] -top-12 bottom-1/2 border-l-2 border-slate-200"></div>}

                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm border border-indigo-200 z-10">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div className="ml-4 mr-4 w-40 rtl:text-right">
                          <div className="text-sm font-bold text-slate-900 truncate">{user.firstName} {user.lastName}</div>
                          <div className="text-[11px] font-medium text-slate-500 truncate">{user.role?.name || t('userLiteral')}</div>
                        </div>
                        <div className="ml-auto mr-auto w-48 relative">
                          <span className="absolute left-3 top-2 text-[13px] font-medium text-slate-500 rtl:left-auto rtl:right-3">{currencySymbol}</span>
                          <Input
                            type="number"
                            className="h-9 pl-7 pr-4 text-[13px] border-slate-200 font-medium focus-visible:ring-indigo-500 transition-all bg-slate-50 group-hover:bg-white focus:bg-white rtl:pl-4 rtl:pr-7"
                            value={targetsForm.userTargets[user.id] || ''}
                            onChange={(e) => setTargetsForm({ ...targetsForm, userTargets: { ...targetsForm.userTargets, [user.id]: e.target.value } })}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          )}

          {viewMode === 'achievement' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('companyTarget')}</div>
                  <div className="text-2xl font-black text-slate-900">{formatCurrency(achievements?.target || 0)}</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('achieved')}</div>
                  <div className="text-2xl font-black text-emerald-600">{formatCurrency(achievements?.achieved || 0)}</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">{tCommon('sidebar.deals')}</div>
                  <div className="text-2xl font-black text-indigo-600">{formatCurrency(achievements?.pipeline || 0)}</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('shortage')}</div>
                  <div className="text-2xl font-black text-rose-600">{formatCurrency(achievements?.shortage || 0)}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="py-3 px-5 text-[12px] font-bold text-slate-500 tracking-wider w-[300px] text-left rtl:text-right">{t('usersTable.user')}</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-slate-500 tracking-wider text-left rtl:text-right">{t('usersTable.target')}</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-slate-500 tracking-wider text-left rtl:text-right">{t('usersTable.achieved')}</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-slate-500 tracking-wider text-left rtl:text-right">{t('usersTable.pipeline')}</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-slate-500 tracking-wider text-left rtl:text-right">{t('usersTable.progress')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {achievements?.userAchievements?.map((ua: any, idx: number) => {
                        const progress = Math.min(100, (ua.achieved / (ua.target || 1)) * 100);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-5 text-left rtl:text-right">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                                  {ua.userName[0]}
                                </div>
                                <span className="font-semibold text-slate-900 text-sm">{ua.userName}</span>
                              </div>
                            </td>
                            <td className="py-4 px-5 font-semibold text-slate-900 text-sm text-left rtl:text-right">{formatCurrency(ua.target)}</td>
                            <td className="py-4 px-5 font-bold text-emerald-600 text-sm text-left rtl:text-right">{formatCurrency(ua.achieved)}</td>
                            <td className="py-4 px-5 font-medium text-slate-600 text-sm text-left rtl:text-right">{formatCurrency(ua.pipeline)}</td>
                            <td className="py-4 px-5 text-left rtl:text-right">
                              <div className="flex items-center gap-3">
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-slate-500 w-10 text-right rtl:text-left">{progress.toFixed()}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {(!achievements?.userAchievements || achievements.userAchievements.length === 0) && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-sm font-medium text-slate-500">
                            {t('usersTable.noData')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Config Modal */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 shadow-xl rounded-xl">
          <div className="px-6 py-4 border-b border-slate-100 bg-white">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-500" />
              {t('config.title')}
            </DialogTitle>
          </div>

          <div className="px-6 py-6 space-y-8 bg-slate-50/50">

            {/* Model */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 rtl:text-right">{t('config.model.title')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${configForm.model === 'top_down' ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  onClick={() => setConfigForm({ ...configForm, model: 'top_down' })}
                >
                  <div className="flex items-center gap-3 rtl:flex-row-reverse">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${configForm.model === 'top_down' ? 'border-indigo-600' : 'border-slate-300'}`}>
                      {configForm.model === 'top_down' && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                    </div>
                    <span className="font-bold text-slate-900 text-sm">{t('config.model.topDown.title')}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed pl-7 rtl:pl-0 rtl:pr-7 rtl:text-right">{t('config.model.topDown.desc')}</p>
                </div>

                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${configForm.model === 'bottom_up' ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  onClick={() => setConfigForm({ ...configForm, model: 'bottom_up' })}
                >
                  <div className="flex items-center gap-3 rtl:flex-row-reverse">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${configForm.model === 'bottom_up' ? 'border-indigo-600' : 'border-slate-300'}`}>
                      {configForm.model === 'bottom_up' && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                    </div>
                    <span className="font-bold text-slate-900 text-sm">{t('config.model.bottomUp.title')}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed pl-7 rtl:pl-0 rtl:pr-7 rtl:text-right">{t('config.model.bottomUp.desc')}</p>
                </div>
              </div>
            </div>

            {/* Metric */}
            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-semibold text-slate-700 rtl:text-right">{t('config.metric.title')}</label>
                <div className="flex gap-4 rtl:flex-row-reverse">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" className="text-indigo-600 focus:ring-indigo-600" checked={configForm.metric === 'revenue'} onChange={() => setConfigForm({ ...configForm, metric: 'revenue' })} />
                    <span className="text-sm font-medium text-slate-900">{t('config.metric.revenue')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" className="text-indigo-600 focus:ring-indigo-600" checked={configForm.metric === 'quantity'} onChange={() => setConfigForm({ ...configForm, metric: 'quantity' })} />
                    <span className="text-sm font-medium text-slate-900">{t('config.metric.quantity')}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Fiscal Year */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900 rtl:text-right">{t('config.fiscal.title')}</h3>
              </div>
              <div className="space-y-4 p-5 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                  <label className="text-[13px] font-medium text-slate-600 rtl:text-right">{t('config.fiscal.type')}</label>
                  <Select value={configForm.fiscalYearType} onValueChange={(v) => setConfigForm({ ...configForm, fiscalYearType: v })}>
                    <SelectTrigger className="h-9 w-[200px] bg-slate-50 shadow-sm border-slate-200 text-[13px] font-medium text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">{t('config.fiscal.standard')}</SelectItem>
                      <SelectItem value="custom">{t('config.fiscal.custom')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                  <label className="text-[13px] font-medium text-slate-600 rtl:text-right">{t('config.fiscal.begins')}</label>
                  <Select value={configForm.fiscalStartMonth.toString()} onValueChange={(v) => setConfigForm({ ...configForm, fiscalStartMonth: parseInt(v) })}>
                    <SelectTrigger className="h-9 w-[200px] bg-slate-50 shadow-sm border-slate-200 text-[13px] font-medium text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t('months.jan')}</SelectItem>
                      <SelectItem value="2">{t('months.feb')}</SelectItem>
                      <SelectItem value="3">{t('months.mar')}</SelectItem>
                      <SelectItem value="4">{t('months.apr')}</SelectItem>
                      <SelectItem value="5">{t('months.may')}</SelectItem>
                      <SelectItem value="6">{t('months.jun')}</SelectItem>
                      <SelectItem value="7">{t('months.jul')}</SelectItem>
                      <SelectItem value="8">{t('months.aug')}</SelectItem>
                      <SelectItem value="9">{t('months.sep')}</SelectItem>
                      <SelectItem value="10">{t('months.oct')}</SelectItem>
                      <SelectItem value="11">{t('months.nov')}</SelectItem>
                      <SelectItem value="12">{t('months.dec')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
            <Button variant="ghost" className="h-9 text-[13px] font-medium" onClick={() => setIsConfigModalOpen(false)}>{tCommon('cancel')}</Button>
            <Button className="h-9 text-[13px] font-medium px-6 bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveConfig}>{tCommon('save')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Modal is shared with Zero State, so let's render it here as well if we are no longer in zero state */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 shadow-xl rounded-xl">
          <div className="px-6 py-4 border-b border-slate-100 bg-white">
            <DialogTitle className="text-lg font-bold text-slate-900">{t('createForecast')}</DialogTitle>
          </div>
          <div className="px-6 py-6 space-y-5 bg-slate-50/50">

            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[13px] font-medium text-slate-600 text-right rtl:text-left">{t('forecastType')}</label>
              <Select value={createForm.type} onValueChange={(v) => setCreateForm({ ...createForm, type: v })}>
                <SelectTrigger className="h-9 w-full bg-white shadow-sm border-slate-200 text-sm font-medium text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarterly">{t('quarterly')}</SelectItem>
                  <SelectItem value="monthly">{t('monthly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[13px] font-medium text-slate-600 text-right rtl:text-left">{t('forecastPeriod')}</label>
              <div className="flex gap-3">
                <Select value={createForm.period} onValueChange={(v) => setCreateForm({ ...createForm, period: v })}>
                  <SelectTrigger className="h-9 flex-1 bg-white shadow-sm border-slate-200 text-[13px] font-medium text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {createForm.type === 'quarterly' ? (
                      <>
                        <SelectItem value="Q1">{t('quarters.q1')}</SelectItem>
                        <SelectItem value="Q2">{t('quarters.q2')}</SelectItem>
                        <SelectItem value="Q3">{t('quarters.q3')}</SelectItem>
                        <SelectItem value="Q4">{t('quarters.q4')}</SelectItem>
                      </>
                    ) : (
                      Array.from({ length: 12 }).map((_, i) => (
                        <SelectItem key={i} value={`M${i + 1}`}>{t('monthLiteral')} {i + 1}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Select value={createForm.year} onValueChange={(v) => setCreateForm({ ...createForm, year: v })}>
                  <SelectTrigger className="h-9 w-[100px] bg-white shadow-sm border-slate-200 text-[13px] font-medium text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[13px] font-medium text-slate-600 text-right rtl:text-left">{t('forecastName')}</label>
              <Input
                className="h-9 w-full bg-white shadow-sm border-slate-200 text-[13px] font-medium text-slate-900 placeholder:font-normal"
                placeholder={t('placeholders.forecastName')}
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>

          </div>
          <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
            <Button variant="ghost" className="h-9 px-4 text-[13px] font-medium text-slate-600 hover:bg-slate-50" onClick={() => setIsCreateModalOpen(false)}>{tCommon('cancel')}</Button>
            <Button className="h-9 px-6 text-[13px] font-medium bg-indigo-600 hover:bg-indigo-700 shadow-sm" onClick={handleCreateForecast}>{t('nextStepLiteral')}</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
