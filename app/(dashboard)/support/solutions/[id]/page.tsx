'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    BookOpen, ArrowLeft, Edit, Plus, FileText, Link as LinkIcon, Calendar, Clock, User, Search, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import SolutionForm from '@/components/support/SolutionForm';

const RELATED_LIST = [
    { name: 'Notes', count: 0, icon: FileText },
    { name: 'Connected Records', count: 0, icon: LinkIcon },
    { name: 'Attachments', count: 0, icon: LinkIcon },
    { name: 'Links', count: 0, icon: LinkIcon },
];

export default function SolutionDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const tCommon = useTranslations('common');
    const t = useTranslations('support.solutions');
    const [solutionData, setSolutionData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchSolution = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/support/solutions/${params.id}`);
            const data = await res.json();
            if (data.success) setSolutionData(data.data);
            else router.push('/support/solutions');
        } catch {
            toast.error(t('errors.loadFailed') || 'Failed to load solution');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSolution(); }, [params.id]);

    const handleUpdate = async (data: any) => {
        const res = await fetch(`/api/support/solutions/${params.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
            toast.success(t('updateSuccess') || 'Solution updated!');
            setSolutionData(result.data);
            setIsEditing(false);
        } else {
            toast.error(result.error || t('errors.updateFailed') || 'Update failed');
            throw new Error(result.error);
        }
    };

    const handleDelete = async () => {
        if (!confirm(tCommon('deleteConfirm'))) return;
        const res = await fetch(`/api/support/solutions/${params.id}`, { method: 'DELETE' });
        if (res.ok) {
            toast.success(t('deleteSuccess') || 'Solution deleted');
            router.push('/support/solutions');
        } else toast.error(t('errors.deleteFailed') || 'Failed to delete');
    };

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!solutionData) return null;

    if (isEditing) return (
        <div>
            <SolutionForm initialData={solutionData} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} />
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
            {/* Left Sidebar - Related List (Dark Theme) */}
            <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto text-slate-300">
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
                                    {tCommon('add')}
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
                    <div className="flex items-center gap-2 text-sm text-indigo-600 mb-4 cursor-pointer hover:underline w-fit" onClick={() => router.push('/support/solutions')}>
                        <ArrowLeft className="w-4 h-4" /> {t('backToSolutions')}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{solutionData.title}</h1>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 text-sm mt-3">
                                <div className="grid grid-cols-[120px_1fr] gap-2 text-slate-600">
                                    <span className="font-medium text-slate-500 text-end">{t('fields.productName')}:</span>
                                    <span className="font-medium text-slate-800">{solutionData.product?.name || '-'}</span>
                                </div>
                                <div className="grid grid-cols-[120px_1fr] gap-2 text-slate-600">
                                    <span className="font-medium text-slate-500 text-end">{t('fields.status')}:</span>
                                    <span className="font-medium text-slate-800">{t(`statuses.${solutionData.status?.toLowerCase()}`) || solutionData.status}</span>
                                </div>
                                <div className="grid grid-cols-[120px_1fr] gap-2 text-slate-600">
                                    <span className="font-medium text-slate-500 text-end">{t('fields.owner')}:</span>
                                    <span className="font-medium text-slate-800">{solutionData.owner?.firstName} {solutionData.owner?.lastName}</span>
                                </div>
                                <div className="grid grid-cols-[120px_1fr] gap-2 text-slate-600">
                                    <span className="font-medium text-slate-500 text-end">{tCommon('comments.count')}:</span>
                                    <span className="font-medium text-slate-800">0</span>
                                </div>
                                <div className="grid grid-cols-[120px_1fr] gap-2 text-slate-600">
                                    <span className="font-medium text-slate-500 text-end">{t('fields.solutionNumber')}:</span>
                                    <span className="font-medium text-slate-800">{solutionData.solutionNumber}</span>
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

                            {/* Hide Details Toggle (Visual Only) */}
                            <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm cursor-pointer hover:underline mb-2">
                                Hide Details
                            </div>

                            <div className="bg-white border border-slate-200 rounded shadow-sm">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between group">
                                    <h3 className="text-sm font-semibold text-slate-800">{t('sections.solutionInfo')}</h3>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
                                        <Edit className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
                                    </Button>
                                </div>
                                <div className="p-0">
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-slate-100 grid grid-cols-2">
                                            {[
                                                { label: t('fields.solutionNumber'), value: solutionData.solutionNumber },
                                                { label: t('fields.owner'), value: `${solutionData.owner?.firstName || tCommon('activeUser')} ${solutionData.owner?.lastName || ''}` },
                                                { label: t('fields.title'), value: solutionData.title },
                                                { label: t('fields.productName'), value: solutionData.product?.name || '-' },
                                                { label: t('fields.status'), value: t(`statuses.${solutionData.status?.toLowerCase()}`) || solutionData.status },
                                                { label: tCommon('fields.created_by'), value: `${solutionData.owner?.firstName} ${solutionData.owner?.lastName} \n${format(new Date(solutionData.createdAt), 'E, d MMM yyyy HH:mm a')}` },
                                                { label: tCommon('comments.count'), value: '0' },
                                                { label: tCommon('fields.modified_by'), value: `${solutionData.owner?.firstName} ${solutionData.owner?.lastName} \n${format(new Date(solutionData.updatedAt), 'E, d MMM yyyy HH:mm a')}` },
                                            ].map((row, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 group/row flex">
                                                    <td className="w-[180px] py-4 pl-6 pr-4 text-slate-500 font-medium align-top shrink-0 text-right">{row.label}</td>
                                                    <td className="flex-1 py-4 px-4 text-slate-900 font-medium align-top relative whitespace-pre-line">
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
                                                <td className="w-1/4 max-w-[180px] py-4 ps-6 pe-4 text-slate-500 font-medium align-top text-end">{t('fields.question')}</td>
                                                <td className="w-3/4 py-4 px-4 text-slate-900 font-medium align-top relative whitespace-pre-wrap">
                                                    {solutionData.question || '-'}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50 group/row">
                                                <td className="w-1/4 max-w-[180px] py-4 ps-6 pe-4 text-slate-500 font-medium align-top text-end">{t('fields.answer')}</td>
                                                <td className="w-3/4 py-4 px-4 text-slate-900 font-medium align-top relative whitespace-pre-wrap">
                                                    {solutionData.answer || '-'}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50 group/row">
                                                <td className="w-1/4 max-w-[180px] py-4 ps-6 pe-4 text-slate-500 font-medium align-top text-end">{tCommon('comments.add')}</td>
                                                <td className="w-3/4 py-4 px-4 text-slate-900 font-medium align-top relative whitespace-pre-wrap">
                                                    -
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Comment Information */}
                            <div className="bg-white border border-slate-200 rounded shadow-sm">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between group">
                                    <h3 className="text-sm font-semibold text-slate-800">{tCommon('comments.info')}</h3>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
                                        <Edit className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
                                    </Button>
                                </div>
                                <div className="p-0">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            <tr className="hover:bg-slate-50/50 group/row">
                                                <td className="w-[180px] py-4 ps-6 pe-4 text-slate-500 font-medium align-top text-end">{t('fields.comments')}</td>
                                                <td className="flex-1 py-4 px-4 text-slate-900 font-medium align-top relative whitespace-pre-wrap">
                                                    {solutionData.comments || '-'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Blank Related Lists */}
                            {['Notes', 'Connected Records', 'Attachments'].map(list => (
                                <div key={list} className="bg-white border border-slate-200 rounded shadow-sm">
                                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 h-[50px] flex items-center">
                                        <h3 className="text-sm font-semibold text-slate-800">{list}</h3>
                                    </div>
                                    <div className="h-20 flex items-center justify-center text-xs text-slate-400">
                                        {list === 'Notes' ? (
                                            <div className="w-full px-4"><Input placeholder="Add a note" className="w-full" /></div>
                                        ) : `No ${list} found.`}
                                    </div>
                                </div>
                            ))}

                        </TabsContent>

                        {/* Timeline Tab Content */}
                        <TabsContent value="timeline" className="flex-1 p-8 m-0 overflow-y-auto bg-slate-50">
                            <div className="max-w-3xl mx-auto space-y-8">
                                <div className="flex items-center gap-4 py-4 border-b border-slate-200">
                                    <BookOpen className="w-5 h-5 text-slate-400" />
                                    <Input placeholder={tCommon('placeholders.search_timeline')} className="flex-1 border-none bg-transparent shadow-none text-base focus-visible:ring-0 px-0 placeholder:text-slate-400" />
                                </div>

                                <div className="space-y-8 ps-4 border-s-2 border-slate-200 ms-4 relative">
                                    {/* Update Node */}
                                    {solutionData.updatedAt !== solutionData.createdAt && (
                                        <div className="relative">
                                            <div className="absolute start-[-25px] top-1 w-3 h-3 rounded-full bg-slate-300 border-2 border-white" />
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900 text-sm">Solution updated</span>
                                                    <span className="text-xs text-slate-500">{format(new Date(solutionData.updatedAt), 'MMM d, yyyy h:mm a')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Creation Node */}
                                    <div className="relative">
                                        <div className="absolute start-[-25px] top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white" />
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-900 text-sm">Solution Created</span>
                                                <span className="text-xs text-slate-500">by {solutionData.owner?.firstName} {solutionData.owner?.lastName} • {format(new Date(solutionData.createdAt), 'E, d MMM yyyy HH:mm a')}</span>
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
