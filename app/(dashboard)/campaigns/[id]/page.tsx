'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Calendar,
    Target,
    BarChart3,
    Megaphone,
    Clock,
    Users,
    Mail,
    Edit3,
    MoreVertical,
    TrendingUp,
    ShieldCheck,
    History,
    FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface Campaign {
    id: string;
    name: string;
    status: string;
    channel: string;
    budget: string | number;
    spent: string | number;
    revenue: string | number;
    leadsGenerated: number;
    startDate: string | null;
    endDate: string | null;
    description: string | null;
    emailsPerMinute: number;
    timezone: string;
    owner: {
        firstName: string;
        lastName: string;
        email: string;
    };
    template?: {
        name: string;
        subject: string;
    };
    segment?: {
        name: string;
        entityType: string;
    };
}

const getStatusBadge = (status: string, t: any) => {
    const norm = status.toLowerCase();
    switch (norm) {
        case 'active':
        case 'sending':
            return <Badge className="bg-emerald-100 text-emerald-800 border-none rounded-md px-3 py-1 shadow-none font-bold whitespace-nowrap">{t(`statuses.${norm}`)}</Badge>;
        case 'completed':
            return <Badge className="bg-blue-100 text-blue-800 border-none rounded-md px-3 py-1 shadow-none font-bold whitespace-nowrap">{t('statuses.completed')}</Badge>;
        case 'draft':
            return <Badge className="bg-slate-100 text-slate-800 border-none rounded-md px-3 py-1 shadow-none font-bold whitespace-nowrap">{t('statuses.draft')}</Badge>;
        case 'scheduled':
            return <Badge className="bg-indigo-100 text-indigo-800 border-none rounded-md px-3 py-1 shadow-none font-bold whitespace-nowrap">{t('statuses.scheduled')}</Badge>;
        case 'paused':
            return <Badge className="bg-amber-100 text-amber-800 border-none rounded-md px-3 py-1 shadow-none font-bold whitespace-nowrap">{t('statuses.paused')}</Badge>;
        default:
            return <Badge className="bg-indigo-100 text-indigo-800 border-none rounded-md px-3 py-1 shadow-none font-bold capitalize whitespace-nowrap">{status}</Badge>;
    }
};

export default function CampaignDetailsPage({ params }: { params: { id: string } }) {
    const t = useTranslations('campaigns');
    const tCommon = useTranslations('common');
    const router = useRouter();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCampaign = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/campaigns/${params.id}`);
            const json = await res.json();
            if (json.success) {
                setCampaign(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch campaign details:', error);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchCampaign();
    }, [fetchCampaign]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-slate-900">{t('campaignNotFound')}</h2>
                <Button variant="link" onClick={() => router.push('/campaigns')}>{t('backToCampaigns')}</Button>
            </div>
        );
    }

    const roi = Number(campaign.spent) > 0
        ? ((Number(campaign.revenue) - Number(campaign.spent)) / Number(campaign.spent) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="flex flex-col h-full bg-slate-50/30">
            {/* Top Bar Navigation */}
            <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-20 rtl:flex-row-reverse">
                <div className="flex items-center gap-4 rtl:flex-row-reverse">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50 rtl:rotate-180" onClick={() => router.push('/campaigns')}>
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div className="text-left rtl:text-right">
                        <div className="flex items-center gap-3 rtl:flex-row-reverse">
                            <h1 className="text-xl font-black text-slate-900">{campaign.name}</h1>
                            {getStatusBadge(campaign.status, t)}
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-widest">
                            {t('single')} • {tCommon('createdBy')} {campaign.owner.firstName} {campaign.owner.lastName}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 rtl:flex-row-reverse">
                    <Button variant="outline" className="h-9 px-4 border-slate-200 text-slate-600 font-bold rounded-xl gap-2 hover:bg-slate-50 transition-all rtl:flex-row-reverse">
                        <Edit3 className="w-4 h-4" /> {t('edit')}
                    </Button>
                    <Button className="h-9 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
                        {t('manageCampaign')}
                    </Button>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2 rtl:flex-row-reverse">
                                <div className="p-2 bg-indigo-50 rounded-xl">
                                    <Target className="w-5 h-5 text-indigo-600" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('roi')}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 text-left rtl:text-right">{roi}%</h3>
                            <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1 rtl:flex-row-reverse rtl:justify-end">
                                <TrendingUp className="w-3 h-3" /> {t('healthyPerformance')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2 rtl:flex-row-reverse">
                                <div className="p-2 bg-emerald-50 rounded-xl">
                                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('efficiency')}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 text-left rtl:text-right">${(Number(campaign.spent) / (campaign.leadsGenerated || 1)).toFixed(2)}</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest text-left rtl:text-right">{t('costPerLead')}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2 rtl:flex-row-reverse">
                                <div className="p-2 bg-blue-50 rounded-xl">
                                    <Megaphone className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('reach')}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 text-left rtl:text-right">{campaign.leadsGenerated?.toLocaleString() || 0}</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest text-left rtl:text-right">{t('leadsGenerated')}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2 rtl:flex-row-reverse">
                                <div className="p-2 bg-amber-50 rounded-xl">
                                    <Calendar className="w-5 h-5 text-amber-600" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('duration')}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 text-left rtl:text-right">
                                {campaign.startDate ? format(new Date(campaign.startDate), 'MMM d') : '-'}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest text-left rtl:text-right">
                                {t('scheduleActive')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200 rtl:flex-row-reverse">
                            <TabsTrigger value="overview" className="rounded-xl font-bold px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">{t('overview')}</TabsTrigger>
                            <TabsTrigger value="details" className="rounded-xl font-bold px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">{t('financials')}</TabsTrigger>
                            <TabsTrigger value="timeline" className="rounded-xl font-bold px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">{t('activityTimeline')}</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                                    <CardHeader className="border-b border-slate-50 rtl:flex-row-reverse rtl:justify-end">
                                        <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 rtl:flex-row-reverse">
                                            <ShieldCheck className="w-4 h-4 text-indigo-500" /> {t('campaignDescription')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 text-left rtl:text-right">
                                        <p className="text-sm leading-relaxed text-slate-600 italic">
                                            {campaign.description || t('noDescription')}
                                        </p>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                                        <CardHeader className="border-b border-slate-50 rtl:flex-row-reverse rtl:justify-end">
                                            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 rtl:flex-row-reverse">
                                                <Users className="w-4 h-4 text-emerald-500" /> {t('audienceSelection')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 text-left rtl:text-right">
                                            {campaign.segment ? (
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('activeSegment')}</p>
                                                        <p className="text-sm font-bold text-indigo-600 mt-0.5">{campaign.segment.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('targetEntity')}</p>
                                                        <p className="text-sm font-bold text-slate-700 mt-0.5 capitalize">{campaign.segment.entityType}s</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">{t('noSegment')}</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                                        <CardHeader className="border-b border-slate-50 rtl:flex-row-reverse rtl:justify-end">
                                            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 rtl:flex-row-reverse">
                                                <Mail className="w-4 h-4 text-blue-500" /> {t('creativeAsset')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 text-left rtl:text-right">
                                            {campaign.template ? (
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('emailTemplate')}</p>
                                                        <p className="text-sm font-bold text-indigo-600 mt-0.5">{campaign.template.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('subjectLine')}</p>
                                                        <p className="text-sm font-bold text-slate-700 mt-0.5 truncate">{campaign.template.subject}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">{t('noTemplate')}</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden h-fit">
                                <CardHeader className="border-b border-slate-50 rtl:text-right">
                                    <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('administration')}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex items-center gap-4 rtl:flex-row-reverse">
                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                                            {campaign.owner.firstName[0]}{campaign.owner.lastName[0]}
                                        </div>
                                        <div className="text-left rtl:text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('managedBy')}</p>
                                            <p className="text-sm font-bold text-slate-700">{campaign.owner.firstName} {campaign.owner.lastName}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center gap-3 rtl:flex-row-reverse">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <div className="text-left rtl:text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('timezone')}</p>
                                                <p className="text-[13px] font-bold text-slate-700">{campaign.timezone || 'UTC'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 rtl:flex-row-reverse">
                                            <History className="w-4 h-4 text-slate-400" />
                                            <div className="text-left rtl:text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('throttleRate')}</p>
                                                <p className="text-[13px] font-bold text-slate-700">{campaign.emailsPerMinute} {t('emailsPerMinute')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="details">
                        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                            <CardHeader className="border-b border-slate-50 rtl:flex-row-reverse rtl:justify-end">
                                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 rtl:flex-row-reverse">
                                    <TrendingUp className="w-4 h-4 text-indigo-500" /> {t('financialBreakdown')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 rtl:flex-row-reverse">
                                    <div className="space-y-2 text-left rtl:text-right">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('allocationBudget')}</p>
                                        <p className="text-4xl font-black text-slate-900">${Number(campaign.budget).toLocaleString()}</p>
                                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-4">
                                            <div
                                                className="h-full bg-indigo-500"
                                                style={{ width: `${Math.min((Number(campaign.spent) / Number(campaign.budget)) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                                            {t('utilization')}: {((Number(campaign.spent) / Number(campaign.budget)) * 100).toFixed(1)}%
                                        </p>
                                    </div>

                                    <div className="space-y-2 text-left rtl:text-right">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('actualExpenditure')}</p>
                                        <p className="text-4xl font-black text-rose-600">${Number(campaign.spent).toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-2 uppercase tracking-widest rtl:flex-row-reverse rtl:justify-end">
                                            <FileText className="w-3 h-3" /> {t('basedOnLiveSync')}
                                        </p>
                                    </div>

                                    <div className="space-y-2 text-left rtl:text-right">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('attributedRevenue')}</p>
                                        <p className="text-4xl font-black text-emerald-600">${Number(campaign.revenue).toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-emerald-600 mt-2 uppercase tracking-widest flex items-center gap-2 rtl:flex-row-reverse rtl:justify-end">
                                            <TrendingUp className="w-3 h-3" /> {t('netGain')}: ${(Number(campaign.revenue) - Number(campaign.spent)).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="timeline">
                        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                            <CardHeader className="border-b border-slate-50 rtl:text-right">
                                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('campaignLogs')}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-12 text-center">
                                <div className="flex flex-col items-center justify-center opacity-40">
                                    <Clock className="w-12 h-12 text-slate-400 mb-4" />
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t('noActivities')}</p>
                                    <p className="text-xs text-slate-400 mt-1">{t('timelineEventsDesc')}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
