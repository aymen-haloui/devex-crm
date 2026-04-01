'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const t = useTranslations('analytics');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [period, setPeriod] = useState('this-month');
  const [scope, setScope] = useState('org-overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const res = await fetch(`/api/analytics?period=${period}&scope=${scope}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [period, scope]);

  const dealStagesData = data?.dealStagesData || [];
  const revenueData = data?.revenueData || [];
  const leadSourceData = data?.leadSourceData || [];
  const teamPerformanceData = data?.teamPerformanceData || [];
  const kpiData = data?.kpiData || {
    pipeline: '0 DZD',
    activeDeals: '0',
    winRate: '0%',
    dealSize: '0 DZD',
    dealSizeGrowth: 'No data',
  };

  const getPerformanceWidth = (value: number) => {
    const ratio = (value / 750000) * 100;
    if (ratio >= 95) return 'w-full';
    if (ratio >= 85) return 'w-11/12';
    if (ratio >= 75) return 'w-10/12';
    if (ratio >= 65) return 'w-8/12';
    if (ratio >= 50) return 'w-6/12';
    if (ratio >= 35) return 'w-4/12';
    return 'w-2/12';
  };

  const translatedRevenueData = useMemo(() => {
    return (data?.revenueData || []).map((item: any) => ({
      ...item,
      monthName: t(`months.${item.month.toLowerCase()}`) || item.month
    }));
  }, [data?.revenueData, t]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t('title')}</h1>
      </div>

      <div className="rounded-md border border-gray-200 bg-gray-50/70 p-2.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-8 w-[130px] bg-white text-xs">
                <SelectValue placeholder={t('period')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">{t('thisMonth')}</SelectItem>
                <SelectItem value="last-month">{t('lastMonth')}</SelectItem>
                <SelectItem value="year-to-date">{t('yearToDate')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger className="h-8 w-[160px] bg-white text-xs">
                <SelectValue placeholder={t('scope')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="org-overview">{t('orgOverview')}</SelectItem>
                <SelectItem value="sales-overview">{t('salesOverview')}</SelectItem>
                <SelectItem value="marketing-overview">{t('marketingOverview')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs">{t('addComponent')}</Button>
            <Button size="sm" className="h-8 text-xs">{t('createDashboard')}</Button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-12 bg-white rounded-md border border-gray-200 shadow-sm animate-pulse">
          <p className="text-gray-500 font-medium">{t('loading')}</p>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="rounded-none border-slate-200 shadow-none">
          <CardHeader className="pb-1.5 p-4">
            <CardTitle className="text-sm font-medium text-gray-600">{t('totalPipeline')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-xl font-bold">{kpiData.pipeline}</div>
            <p className="text-xs text-green-600 mt-1">{kpiData.pipelineGrowth}</p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-slate-200 shadow-none">
          <CardHeader className="pb-1.5 p-4">
            <CardTitle className="text-sm font-medium text-gray-600">{t('winRate')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-xl font-bold">{kpiData.winRate}</div>
            <p className="text-xs text-gray-500 mt-1">{t('industryAvg')}</p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-slate-200 shadow-none">
          <CardHeader className="pb-1.5 p-4">
            <CardTitle className="text-sm font-medium text-gray-600">{t('avgDealSize')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-xl font-bold">{kpiData.dealSize}</div>
            <p className="text-xs text-green-600 mt-1">{kpiData.dealSizeGrowth}</p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-slate-200 shadow-none">
          <CardHeader className="pb-1.5 p-4">
            <CardTitle className="text-sm font-medium text-gray-600">{t('salesCycle')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-xl font-bold">45{t('units.days')}</div>
            <p className="text-xs text-gray-500 mt-1">{t('avgLength')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Pipeline */}
        <Card className="rounded-none border-slate-200 shadow-none">
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800">{t('pipelineByStage')}</CardTitle>
            <CardDescription className="text-xs text-slate-500">{t('dealsAndValue')}</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dealStagesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip formatter={(value: number | string) => `$${value}K`} />
                <Legend />
                <Bar dataKey="deals" fill="#3B82F6" name={t('dealsCount')} />
                <Bar dataKey="value" fill="#10B981" name={t('value')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="rounded-none border-slate-200 shadow-none">
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800">{t('revenueTrend')}</CardTitle>
            <CardDescription className="text-xs text-slate-500">{t('lastSixMonths')}</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={translatedRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthName" />
                <YAxis />
                <Tooltip formatter={(value: number | string) => `$${value}K`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name={t('revenue')} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card className="rounded-none border-slate-200 shadow-none">
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800">{t('leadSources')}</CardTitle>
            <CardDescription className="text-xs text-slate-500">{t('leadDistribution') || 'Distribution of leads'}</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leadSourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }: { name: string; value: number }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leadSourceData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number | string) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card className="rounded-none border-slate-200 shadow-none">
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800">{t('teamPerformance')}</CardTitle>
            <CardDescription className="text-xs text-slate-500">{t('salesRepMetrics') || 'Sales rep metrics'}</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {teamPerformanceData.map((rep: any) => (
                <div key={rep.name} className="p-3 border border-slate-100 rounded-none bg-slate-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-slate-800 text-[14px]">{rep.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {rep.deals} {t('dealsCount')} | {rep.closed} {t('closedCount')}
                      </p>
                    </div>
                    <p className="font-bold text-slate-900 text-[14px]">${(rep.value / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-none overflow-hidden">
                    <div className={cn("h-full bg-blue-600", getPerformanceWidth(rep.value))}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Period Selector */}
      <Card className="rounded-none border-slate-200 shadow-none">
        <CardHeader className="p-4 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-800">{t('dateRangeTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: t('thisMonth'), value: 'this-month' },
              { label: t('lastMonth'), value: 'last-month' },
              { label: t('lastQuarter'), value: 'last-quarter' },
              { label: t('yearToDate'), value: 'ytd' },
              { label: t('customRange'), value: 'custom' },
            ].map((option) => (
              <button
                key={option.value}
                className={cn(
                  "px-4 py-1.5 text-[13px] font-bold transition-all border rounded-none",
                  period === option.value
                    ? "bg-blue-600 border-blue-600 text-white shadow-md"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
                onClick={() => setPeriod(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
