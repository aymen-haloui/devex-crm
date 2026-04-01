'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Building2, Mail, Phone, Globe, ArrowLeft, Edit, Trash2,
    Calendar, Clock, User, Plus, FileText, Link, MessageSquare, Briefcase, FileSignature, MapPin, Search, ChevronRight, Settings, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import VendorForm from '@/components/inventory/VendorForm';
import { Vendor } from '@/types';

const STATUS_STYLE: Record<string, string> = {
    active: 'text-emerald-300 border-emerald-300',
    inactive: 'text-slate-300 border-slate-300',
};

const RELATED_LIST = [
    { name: 'Notes', count: 0, icon: FileText },
    { name: 'Attachments', count: 0, icon: Link },
    { name: 'Contacts', count: 0, icon: User },
    { name: 'Open Activities', count: 0, icon: Calendar },
    { name: 'Closed Activities', count: 0, icon: Calendar },
    { name: 'Emails', count: 0, icon: MessageSquare },
    { name: 'Purchase Orders', count: 0, icon: FileSignature },
    { name: 'Projects', count: 0, icon: Briefcase },
];

export default function VendorDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchVendor = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/inventory/vendors/${params.id}`);
            const data = await res.json();
            if (data.success) setVendor(data.data);
            else router.push('/inventory/vendors');
        } catch {
            toast.error('Failed to load vendor');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVendor(); }, [params.id]);

    const handleUpdate = async (data: any) => {
        const res = await fetch(`/api/inventory/vendors/${params.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
            toast.success('Vendor updated!');
            setVendor(result.data);
            setIsEditing(false);
        } else {
            toast.error(result.error || 'Update failed');
            throw new Error(result.error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this vendor?')) return;
        const res = await fetch(`/api/inventory/vendors/${params.id}`, { method: 'DELETE' });
        if (res.ok) {
            toast.success('Vendor deleted');
            router.push('/inventory/vendors');
        } else toast.error('Failed to delete');
    };

    const fmtAddr = (addr: any) => {
        if (!addr) return 'Not specified';
        return [addr.street, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(', ') || 'Not specified';
    };

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!vendor) return null;

    if (isEditing) return (
        <div>
            <VendorForm initialData={vendor} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} />
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
            {/* Left Sidebar - Related List (Dark Theme) */}
            <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto text-slate-300">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-100">Related List</span>
                    <button className="p-1 hover:bg-slate-800 rounded"><Settings className="w-4 h-4 text-slate-400" /></button>
                </div>
                <div className="p-2 space-y-0.5">
                    {RELATED_LIST.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button key={item.name} className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-800 rounded group transition-colors">
                                <div className="flex items-center gap-3">
                                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                                    <span className="font-medium group-hover:text-slate-100">{item.name}</span>
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
                    <div className="flex items-center gap-2 text-sm text-indigo-600 mb-4 cursor-pointer hover:underline w-fit" onClick={() => router.push('/inventory/vendors')}>
                        <ArrowLeft className="w-4 h-4" /> Back to Vendors
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 shadow-sm relative group overflow-hidden">
                                <Building2 className="w-10 h-10 text-slate-400" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <ImageIcon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{vendor.name}</h1>
                                    <Badge variant="outline" className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-transparent ${STATUS_STYLE[vendor.status] || 'text-slate-500 border-slate-300'}`}>
                                        {vendor.status}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                    {vendor.email && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium hover:text-indigo-600 cursor-pointer">{vendor.email}</span>
                                        </div>
                                    )}
                                    {vendor.phone && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium">{vendor.phone}</span>
                                        </div>
                                    )}
                                    {vendor.website && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Globe className="w-4 h-4 text-slate-400" />
                                            <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-indigo-600 underline">
                                                {vendor.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Button variant="outline" className="h-8 px-4 text-xs font-semibold rounded border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm" onClick={() => setIsEditing(true)}>
                                Edit
                            </Button>
                            <Button variant="outline" className="h-8 px-4 text-xs font-semibold rounded border-slate-300 text-amber-600 hover:bg-amber-50 shadow-sm">
                                Send Email
                            </Button>
                            <Button variant="outline" className="h-8 px-4 text-xs font-semibold rounded border-slate-300 text-rose-600 hover:bg-rose-50 shadow-sm" onClick={handleDelete}>
                                Delete
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
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="timeline" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none font-medium text-sm text-slate-600 px-1">
                                    Timeline
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Overview Tab Content */}
                        <TabsContent value="overview" className="flex-1 p-8 m-0 overflow-y-auto space-y-8">

                            {/* Record Owner Panel */}
                            <div className="bg-white border border-slate-200 rounded shadow-sm">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-800">Vendor Owner</h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200">
                                            {vendor.owner?.firstName?.[0] || 'U'}{vendor.owner?.lastName?.[0] || 'S'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-indigo-600 text-sm">{vendor.owner?.firstName || 'Current'} {vendor.owner?.lastName || 'User'}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{vendor.owner?.email || 'user@example.com'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Panel */}
                            <div className="bg-white border border-slate-200 rounded shadow-sm">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between group">
                                    <h3 className="text-sm font-semibold text-slate-800">Vendor Information</h3>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
                                        <Edit className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
                                    </Button>
                                </div>
                                <div className="p-0">
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-slate-100">
                                            {[
                                                { label: 'Vendor Name', value: vendor.name },
                                                { label: 'Vendor Owner', value: `${vendor.owner?.firstName || 'Current'} ${vendor.owner?.lastName || 'User'}` },
                                                { label: 'Email', value: vendor.email || '-' },
                                                { label: 'Phone', value: vendor.phone || '-' },
                                                { label: 'Website', value: vendor.website || '-' },
                                                { label: 'Category', value: vendor.category || '-' },
                                                { label: 'GL Account', value: vendor.glAccount || '-' },
                                                { label: 'Email Opt Out', value: vendor.emailOptOut ? 'Yes' : 'No' },
                                                { label: 'Created By', value: `${vendor.owner?.firstName || 'Current'} ${vendor.owner?.lastName || 'User'} - ${format(new Date(vendor.createdAt), 'MMM d, yyyy HH:mm')}` },
                                                { label: 'Modified By', value: `${vendor.owner?.firstName || 'Current'} ${vendor.owner?.lastName || 'User'} - ${format(new Date(vendor.updatedAt), 'MMM d, yyyy HH:mm')}` },
                                            ].map((row, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 group/row">
                                                    <td className="w-1/3 py-3 pl-6 pr-4 text-slate-500 font-medium align-top">{row.label}</td>
                                                    <td className="w-2/3 py-3 px-4 text-slate-900 font-medium align-top relative">
                                                        {row.value}
                                                        <Button variant="ghost" size="sm" className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover/row:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
                                                            <Edit className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Address Panel */}
                            <div className="bg-white border border-slate-200 rounded shadow-sm">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between group">
                                    <h3 className="text-sm font-semibold text-slate-800">Address Information</h3>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
                                        <Edit className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
                                    </Button>
                                </div>
                                <div className="p-0 grid grid-cols-2 divide-x divide-slate-100">
                                    <div className="p-6 space-y-4">
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase">Billing Address</h4>
                                        <div className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                                            {vendor.billingAddress ? (
                                                <>
                                                    {vendor.billingAddress.street && <div>{vendor.billingAddress.street}</div>}
                                                    {vendor.billingAddress.city && <div>{vendor.billingAddress.city}{vendor.billingAddress.state && `, ${vendor.billingAddress.state}`} {vendor.billingAddress.zip}</div>}
                                                    {vendor.billingAddress.country && <div>{vendor.billingAddress.country}</div>}
                                                    {!vendor.billingAddress.street && !vendor.billingAddress.city && '-'}
                                                </>
                                            ) : '-'}
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase">Shipping Address</h4>
                                        <div className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                                            {vendor.shippingAddress ? (
                                                <>
                                                    {vendor.shippingAddress.street && <div>{vendor.shippingAddress.street}</div>}
                                                    {vendor.shippingAddress.city && <div>{vendor.shippingAddress.city}{vendor.shippingAddress.state && `, ${vendor.shippingAddress.state}`} {vendor.shippingAddress.zip}</div>}
                                                    {vendor.shippingAddress.country && <div>{vendor.shippingAddress.country}</div>}
                                                    {!vendor.shippingAddress.street && !vendor.shippingAddress.city && '-'}
                                                </>
                                            ) : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description Panel */}
                            <div className="bg-white border border-slate-200 rounded shadow-sm">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between group">
                                    <h3 className="text-sm font-semibold text-slate-800">Description Information</h3>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
                                        <Edit className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
                                    </Button>
                                </div>
                                <div className="p-6">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            <tr className="group/row">
                                                <td className="w-1/3 py-2 pr-4 text-slate-500 font-medium align-top">Description</td>
                                                <td className="w-2/3 py-2 px-4 text-slate-900 font-medium align-top relative whitespace-pre-wrap">
                                                    {vendor.description || '-'}
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
                                    <Input placeholder="Search Timeline..." className="flex-1 bg-transparent border-none shadow-none text-base focus-visible:ring-0 px-0 placeholder:text-slate-400" />
                                </div>

                                <div className="space-y-8 pl-4 border-l-2 border-slate-200 ml-4 relative">

                                    {/* Update Node */}
                                    {vendor.updatedAt !== vendor.createdAt && (
                                        <div className="relative">
                                            <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-slate-300 border-2 border-white" />
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900 text-sm">Vendor updated</span>
                                                    <span className="text-xs text-slate-500">{format(new Date(vendor.updatedAt), 'MMM d, yyyy h:mm a')}</span>
                                                </div>
                                                <div className="p-4 bg-white border border-slate-200 rounded shadow-sm text-sm text-slate-700">
                                                    Vendor information was modified.
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Creation Node */}
                                    <div className="relative">
                                        <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white" />
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-900 text-sm">Vendor created</span>
                                                <span className="text-xs text-slate-500">{format(new Date(vendor.createdAt), 'MMM d, yyyy h:mm a')}</span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="text-sm text-slate-700">Initial vendor record created by <span className="font-semibold">{vendor.owner?.firstName || 'Current User'}</span></div>
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
