'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Mail, Phone, Pencil, Copy, ExternalLink, AlertTriangle, Globe, Landmark, BadgeCheck, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CompanyDetailsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [org, setOrg] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/organizations/profile');
            const result = await res.json();
            if (result.success) setOrg(result.data);
        } catch (error) {
            toast.error('Failed to load company details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/organizations/profile', {
                method: 'PUT',
                body: JSON.stringify(org),
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Settings updated successfully');
                setIsEditing(false);
            }
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;

    const labelStyle = "text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block";
    const inputStyle = "h-10 border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all bg-white";

    return (
        <div className="p-8 max-w-4xl space-y-10">
            {/* Header with Save Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Company Details</h1>
                    <p className="text-sm font-medium text-slate-500">Manage your organization&apos;s legal information and settings</p>
                </div>
                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => { setIsEditing(false); fetchProfile(); }} className="h-10 px-5 rounded-xl font-bold border-slate-200">Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving} className="h-10 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-sm flex items-center gap-2">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} className="h-10 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-sm flex items-center gap-2">
                            <Pencil className="w-4 h-4" />
                            Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            {/* Basic Info Card */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-8">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary text-3xl font-black">
                            {org?.name?.charAt(0) || 'C'}
                        </div>
                        <div className="absolute -bottom-2 -end-2 w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-md cursor-pointer hover:border-accent transition-all">
                            <Camera className="w-4 h-4 text-slate-500" />
                        </div>
                    </div>
                    <div className="flex-1 space-y-1">
                        {isEditing ? (
                            <Input value={org.name} onChange={e => setOrg({ ...org, name: e.target.value })} className="text-xl font-black h-10 border-slate-200" />
                        ) : (
                            <h2 className="text-xl font-black text-slate-900">{org?.name}</h2>
                        )}
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Org ID: {org?.id?.split('-')[0]}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <div>
                            <span className={labelStyle}>Email Address</span>
                            {isEditing ? (
                                <Input value={org.email || ''} onChange={e => setOrg({ ...org, email: e.target.value })} className={inputStyle} />
                            ) : (
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700"><Mail className="w-4 h-4 text-slate-300" /> {org?.email || '—'}</div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <span className={labelStyle}>Phone Number</span>
                            {isEditing ? (
                                <Input value={org.phone || ''} onChange={e => setOrg({ ...org, phone: e.target.value })} className={inputStyle} />
                            ) : (
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700"><Phone className="w-4 h-4 text-slate-300" /> {org?.phone || '—'}</div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <span className={labelStyle}>Website</span>
                            {isEditing ? (
                                <Input value={org.website || ''} onChange={e => setOrg({ ...org, website: e.target.value })} className={inputStyle} />
                            ) : (
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700"><Globe className="w-4 h-4 text-slate-300" /> {org?.website || '—'}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ALGERIAN LOCALIZATION SECTION */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Landmark className="w-5 h-5 text-accent" />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Algerian Fiscal & Legal IDs</h3>
                </div>
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    <div>
                        <span className={labelStyle}>Registre du Commerce (RC)</span>
                        <div className="relative">
                            <Input
                                value={org?.rcNumber || ''}
                                onChange={e => setOrg({ ...org, rcNumber: e.target.value })}
                                disabled={!isEditing}
                                className={inputStyle}
                                placeholder="e.g. 23B0123456"
                            />
                            {!isEditing && org?.rcNumber && <BadgeCheck className="absolute end-3 top-2.5 w-5 h-5 text-emerald-500" />}
                        </div>
                    </div>
                    <div>
                        <span className={labelStyle}>Numéro d&apos;Identification Fiscale (NIF)</span>
                        <div className="relative">
                            <Input
                                value={org?.nifNumber || ''}
                                onChange={e => setOrg({ ...org, nifNumber: e.target.value })}
                                disabled={!isEditing}
                                className={inputStyle}
                                placeholder="e.g. 002316001234567"
                            />
                            {!isEditing && org?.nifNumber && <BadgeCheck className="absolute end-3 top-2.5 w-5 h-5 text-emerald-500" />}
                        </div>
                    </div>
                    <div>
                        <span className={labelStyle}>Article d&apos;Imposition (AI)</span>
                        <div className="relative">
                            <Input
                                value={org?.aiNumber || ''}
                                onChange={e => setOrg({ ...org, aiNumber: e.target.value })}
                                disabled={!isEditing}
                                className={inputStyle}
                                placeholder="e.g. 16030123456"
                            />
                            {!isEditing && org?.aiNumber && <BadgeCheck className="absolute end-3 top-2.5 w-5 h-5 text-emerald-500" />}
                        </div>
                    </div>
                    <div>
                        <span className={labelStyle}>Numéro d&apos;Identification Statistique (NIS)</span>
                        <div className="relative">
                            <Input
                                value={org?.nisNumber || ''}
                                onChange={e => setOrg({ ...org, nisNumber: e.target.value })}
                                disabled={!isEditing}
                                className={inputStyle}
                                placeholder="e.g. 001616010123456"
                            />
                            {!isEditing && org?.nisNumber && <BadgeCheck className="absolute end-3 top-2.5 w-5 h-5 text-emerald-500" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Locale & Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-4">
                    <span className={labelStyle}>Base Currency</span>
                    <Select
                        value={org?.currency}
                        onValueChange={v => setOrg({ ...org, currency: v })}
                        disabled={!isEditing}
                    >
                        <SelectTrigger className={inputStyle}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DZD">DZD - Algerian Dinar (د.ج)</SelectItem>
                            <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                            <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">System default for all invoices and financial tracking.</p>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-4">
                    <span className={labelStyle}>Time Zone</span>
                    <Select
                        value={org?.timezone}
                        onValueChange={v => setOrg({ ...org, timezone: v })}
                        disabled={!isEditing}
                    >
                        <SelectTrigger className={inputStyle}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Africa/Algiers">(GMT+01:00) Africa/Algiers</SelectItem>
                            <SelectItem value="Europe/Paris">(GMT+01:00) Europe/Paris</SelectItem>
                            <SelectItem value="UTC">UTC (GMT+00:00)</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">Used for activity tracking and audit logs.</p>
                </div>
            </div>

            {/* Safety Zone */}
            <div className="pt-10 border-t border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest">Danger Zone</h3>
                    <p className="text-xs font-medium text-slate-500">Deleting your account is permanent and cannot be undone.</p>
                </div>
                <Button variant="ghost" className="text-rose-600 hover:bg-rose-50 font-bold rounded-xl h-10 px-5 flex items-center gap-2 transition-all">
                    <AlertTriangle className="w-4 h-4" />
                    Archive Organization
                </Button>
            </div>
        </div>
    );
}
