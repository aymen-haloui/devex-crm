'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Briefcase, Mail, Phone, ArrowLeft, Edit, Trash2,
    Calendar, Clock, User, Plus, FileText, Link as LinkIcon, MessageSquare, ShieldAlert, MapPin, Search, Settings, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import CaseForm from '@/components/support/CaseForm';

const PRIORITY_BADGE: Record<string, string> = {
    'High': 'text-rose-600 bg-rose-50 border-rose-200',
    'Medium': 'text-amber-600 bg-amber-50 border-amber-200',
    'Low': 'text-emerald-600 bg-emerald-50 border-emerald-200',
    'None': 'text-slate-600 bg-slate-50 border-slate-200',
};

const RELATED_LIST = [
    { name: 'Notes', count: 0, icon: FileText },
    { name: 'Attachments', count: 0, icon: LinkIcon },
    { name: 'Contacts', count: 0, icon: User },
    { name: 'Open Activities', count: 0, icon: Calendar },
    { name: 'Closed Activities', count: 0, icon: Calendar },
    { name: 'Emails', count: 0, icon: MessageSquare },
];

export default function CaseDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const tCommon = useTranslations('common');
    const t = useTranslations('support.cases');
    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchCase = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/support/cases/${params.id}`);
            const data = await res.json();
            if (data.success) setCaseData(data.data);
            else router.push('/support/cases');
        } catch {
            toast.error(t('errors.loadFailed') || 'Failed to load case');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCase(); }, [params.id]);

    const handleUpdate = async (data: any) => {
        const res = await fetch(`/api/support/cases/${params.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
            toast.success(t('updateSuccess') || 'Case updated!');
            setCaseData(result.data);
            setIsEditing(false);
        } else {
            toast.error(result.error || t('errors.updateFailed') || 'Update failed');
            throw new Error(result.error);
        }
    };

    const handleDelete = async () => {
        if (!confirm(tCommon('deleteConfirm'))) return;
        const res = await fetch(`/api/support/cases/${params.id}`, { method: 'DELETE' });
        if (res.ok) {
            toast.success(t('deleteSuccess') || 'Case deleted');
            router.push('/support/cases');
        } else toast.error(t('errors.deleteFailed') || 'Failed to delete');
    };

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!caseData) return null;

    if (isEditing) return (
        <div>
            <CaseForm initialData={caseData} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} />
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
            {/* Left Sidebar - Related List (Dark Theme) */}
            <div className="w-64 bg-slate-900 border-e border-slate-800 flex flex-col shrink-0 overflow-y-auto text-slate-300">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-100">{tCommon('related_list')}</span>
                    <button className="p-1 hover:bg-slate-800 rounded"><Settings className="w-4 h-4 text-slate-400" /></button>
                </div>
                <div className="p-2 space-y-0.5">
                    {RELATED_LIST.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button key={item.name} className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-800 rounded group transition-colors">
                                <div className="flex items-center gap-3">
                                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                                    <span className="font-medium group-hover:text-slate-100">{tCommon(`related_lists.${item.name.toLowerCase().replace(/ /g, '_')}`) || item.name}</span>
                                </div>
                                <span className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus className="w-3 h-3" />
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">

                {/* Header Profile Section */}
                <div className="px-8 py-6 border-b border-slate-200 bg-white">
                    <div className="flex items-center gap-2 text-sm text-indigo-600 mb-4 cursor-pointer hover:underline w-fit" onClick={() => router.push('/support/cases')}>
                        <ArrowLeft className="w-4 h-4" /> {t('backToCases')}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex items-start gap-6">
                            <div className="w-20 h-20 rounded bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 shadow-sm relative group overflow-hidden">
                                <Briefcase className="w-8 h-8 text-slate-400" />
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{caseData.subject}</h1>
                                </div>
                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <span className="font-semibold text-slate-500">{t('fields.caseNumber')}:</span>
                                        <span className="font-medium">{caseData.caseNumber}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <span className="font-semibold text-slate-500">{t('fields.status')}:</span>
                                        <Badge variant="outline" className={`text-xs font-semibold px-2 py-0.5 rounded`}>
                                            {t(`statuses.${caseData.status?.toLowerCase()}`) || caseData.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <span className="font-semibold text-slate-500">{t('fields.priority')}:</span>
                                        <Badge variant="outline" className={`text-xs font-semibold px-2 py-0.5 rounded ${PRIORITY_BADGE[caseData.priority] || PRIORITY_BADGE.None}`}>
                                            {t(`priorities.${caseData.priority?.toLowerCase()}`) || caseData.priority}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Button variant="outline" className="h-8 px-4 text-xs font-semibold rounded border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm" onClick={() => setIsEditing(true)}>
                                {tCommon('edit')}
                            </Button>
                            <Button variant="outline" className="h-8 px-4 text-xs font-semibold rounded border-slate-300 text-amber-600 hover:bg-amber-50 shadow-sm">
                                {tCommon('clone')}
                            </Button>
                            <Button variant="outline" className="h-8 px-4 text-xs font-semibold rounded border-slate-300 text-rose-600 hover:bg-rose-50 shadow-sm" onClick={handleDelete}>
                                {tCommon('delete')}
                            </Button>
                            <Button variant="outline" className="h-8 w-8 p-0 rounded border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm">
                                ...
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="flex-1 overflow-auto bg-slate-50">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                        <div className="bg-white border-b border-slate-200 px-8">
                            <TabsList className="h-12 bg-transparent p-0 flex space-x-6 justify-start">
                                <TabsTrigger value="overview" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none font-medium text-sm text-slate-600 px-1">
                                    {tCommon('tabs.overview')}
                                </TabsTrigger>
                                <TabsTrigger value="timeline" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none font-medium text-sm text-slate-600 px-1">
                                    {tCommon('tabs.timeline')}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Overview Tab Content */}
                        <TabsContent value="overview" className="flex-1 p-8 m-0 overflow-y-auto space-y-8">

                            {/* Record Owner Panel */}
                            <div className="bg-white border border-slate-200 rounded shadow-sm">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-800">{t('fields.owner')}</h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200">
                                            {caseData.owner?.firstName?.[0] || 'U'}{caseData.owner?.lastName?.[0] || 'S'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-indigo-600 text-sm">{caseData.owner?.firstName || 'Current'} {caseData.owner?.lastName || 'User'}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{caseData.owner?.email || 'user@example.com'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Panel */}
                            <div className="bg-white border border-slate-200 rounded shadow-sm">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between group">
                                    <h3 className="text-sm font-semibold text-slate-800">{t('sections.caseInfo')}</h3>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
                                        <Edit className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
                                    </Button>
                                </div>
                                <div className="p-0">
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-slate-100">
                                            {[
                                                { label: t('fields.caseNumber'), value: caseData.caseNumber },
                                                { label: t('fields.owner'), value: `${caseData.owner?.firstName || t('activeUser')} ${caseData.owner?.lastName || ''}` },
                                                { label: t('fields.productName'), value: caseData.product?.name || '-' },
                                                { label: t('fields.status'), value: t(`statuses.${caseData.status?.toLowerCase()}`) || caseData.status },
                                                { label: t('fields.type'), value: t(`types.${caseData.type?.toLowerCase()}`) || caseData.type || '-' },
                                                { label: t('fields.priority'), value: t(`priorities.${caseData.priority?.toLowerCase()}`) || caseData.priority || '-' },
                                                { label: t('fields.caseOrigin'), value: t(`origins.${caseData.caseOrigin?.toLowerCase()}`) || caseData.caseOrigin || '-' },
                                                { label: t('fields.caseReason'), value: t(`reasons.${caseData.caseReason?.toLowerCase()}`) || caseData.caseReason || '-' },
                                                { label: t('fields.relatedTo'), value: caseData.relatedTo || '-' },
                                                { label: t('fields.subject'), value: caseData.subject || '-' },
                                                { label: t('fields.accountName'), value: caseData.account?.name || '-' },
                                                { label: t('fields.reportedBy'), value: caseData.reportedBy || '-' },
                                                { label: t('fields.dealName'), value: caseData.deal?.name || '-' },
                                                { label: t('fields.email'), value: caseData.email || '-' },
                                                { label: t('fields.phone'), value: caseData.phone || '-' },
                                            ].map((row, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 group/row">
                                                    <td className="w-1/3 py-3 ps-6 pe-4 text-slate-500 font-medium align-top">{row.label}</td>
                                                    <td className="w-2/3 py-3 px-4 text-slate-900 font-medium align-top relative">
                                                        {row.value}
                                                        <Button variant="ghost" size="sm" className="absolute end-4 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover/row:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
                                                            <Edit className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Description Panel */}
                            <div className="bg-white border border-slate-200 rounded shadow-sm">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between group">
                                    <h3 className="text-sm font-semibold text-slate-800">{t('sections.descriptionInfo')}</h3>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
                                        <Edit className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
                                    </Button>
                                </div>
                                <div className="p-0">
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-slate-100">
                                            <tr className="hover:bg-slate-50/50 group/row">
                                                <td className="w-1/3 py-4 ps-6 pe-4 text-slate-500 font-medium align-top">{t('fields.description')}</td>
                                                <td className="w-2/3 py-4 px-4 text-slate-900 font-medium align-top relative whitespace-pre-wrap">
                                                    {caseData.description || '-'}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50 group/row">
                                                <td className="w-1/3 py-4 ps-6 pe-4 text-slate-500 font-medium align-top">{t('fields.internalComments')}</td>
                                                <td className="w-2/3 py-4 px-4 text-slate-900 font-medium align-top relative whitespace-pre-wrap">
                                                    {caseData.internalComments || '-'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Solution Panel */}
                            <div className="bg-white border border-slate-200 rounded shadow-sm">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between group">
                                    <h3 className="text-sm font-semibold text-slate-800">{t('sections.solutionInfo')}</h3>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
                                        <Edit className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
                                    </Button>
                                </div>
                                <div className="p-0">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            <tr className="hover:bg-slate-50/50 group/row">
                                                <td className="w-1/3 py-4 ps-6 pe-4 text-slate-500 font-medium align-top">{t('fields.solution')}</td>
                                                <td className="w-2/3 py-4 px-4 text-slate-900 font-medium align-top relative whitespace-pre-wrap">
                                                    {caseData.solution || '-'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </TabsContent>

                        {/* Timeline Tab Content */}
                        <TabsContent value="timeline" className="flex-1 p-8 m-0 overflow-y-auto bg-slate-50">
                            <div className="max-w-3xl mx-auto space-y-8">
                                <div className="flex items-center gap-4 py-4 border-b border-slate-200">
                                    <Search className="w-5 h-5 text-slate-400" />
                                    <Input placeholder={tCommon('placeholders.search_timeline')} className="flex-1 border-none bg-transparent shadow-none text-base focus-visible:ring-0 px-0 placeholder:text-slate-400" />
                                </div>

                                <div className="space-y-8 ps-4 border-s-2 border-slate-200 ms-4 relative">
                                    {/* Update Node */}
                                    {caseData.updatedAt !== caseData.createdAt && (
                                        <div className="relative">
                                            <div className="absolute start-[-25px] top-1 w-3 h-3 rounded-full bg-slate-300 border-2 border-white" />
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900 text-sm">Case updated</span>
                                                    <span className="text-xs text-slate-500">{format(new Date(caseData.updatedAt), 'MMM d, yyyy h:mm a')}</span>
                                                </div>
                                                <div className="p-4 bg-white border border-slate-200 rounded shadow-sm text-sm text-slate-700">
                                                    Case details were modified.
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Creation Node */}
                                    <div className="relative">
                                        <div className="absolute start-[-25px] top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white" />
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-900 text-sm">Case created</span>
                                                <span className="text-xs text-slate-500">{format(new Date(caseData.createdAt), 'MMM d, yyyy h:mm a')}</span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="text-sm text-slate-700">Initial case record created by <span className="font-semibold">{caseData.owner?.firstName || 'Current User'}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
