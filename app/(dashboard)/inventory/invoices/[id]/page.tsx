'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    FileText, User, Building, Briefcase, MapPin, Calendar, Clock,
    ArrowLeft, Edit, Trash2, DollarSign, CheckCircle2, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import InvoiceForm from '@/components/inventory/InvoiceForm';
import { Invoice } from '@/types';
import { useTranslations } from 'next-intl';

const STATUS_STYLES: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    sent: 'bg-blue-100 text-blue-700 border-blue-200',
    paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    overdue: 'bg-rose-100 text-rose-700 border-rose-200',
    cancelled: 'bg-orange-100 text-orange-700 border-orange-200',
    void: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [org, setOrg] = useState<any>(null);
    const t = useTranslations('inventory.invoices');
    const tCommon = useTranslations('common');

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const res = await fetch('/api/organizations/profile');
                const data = await res.json();
                if (data.success) setOrg(data.data);
            } catch (err) { console.error('Error fetching org profile:', err); }
        };
        fetchOrg();
        fetchInvoice();
    }, [params.id]);

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/inventory/invoices/${params.id}`);
            const data = await res.json();
            if (data.success) setInvoice(data.data);
            else router.push('/inventory/invoices');
        } catch { toast.error(tCommon('error')); }
        finally { setLoading(false); }
    };

    const handleUpdate = async (data: any) => {
        const res = await fetch(`/api/inventory/invoices/${params.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) { toast.success(t('successMessage')); setInvoice(result.data); setIsEditing(false); }
        else { toast.error(result.error || t('errorMessage')); throw new Error(result.error); }
    };

    const handleDelete = async () => {
        if (!confirm(tCommon('confirmDelete', { entity: t('title').toLowerCase() }))) return;
        const res = await fetch(`/api/inventory/invoices/${params.id}`, { method: 'DELETE' });
        if (res.ok) { toast.success(tCommon('deleted', { entity: t('title') })); router.push('/inventory/invoices'); }
        else toast.error(tCommon('error'));
    };

    const handleSendWhatsApp = async () => {
        const loadingToast = toast.loading(t('whatsapp.sending') || 'Sending via WhatsApp...');
        try {
            const res = await fetch(`/api/inventory/invoices/${params.id}/whatsapp`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                toast.success(t('whatsapp.success') || 'Invoice sent via WhatsApp!');
            } else {
                toast.error(data.error || t('whatsapp.error') || 'Failed to send WhatsApp');
            }
        } catch (err) {
            toast.error(tCommon('error'));
        } finally {
            toast.dismiss(loadingToast);
        }
    };

    const fmtAddr = (addr: any) => {
        if (!addr) return tCommon('notSpecified');
        return [addr.street, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(', ') || tCommon('notSpecified');
    };

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!invoice) return null;

    if (isEditing) return (
        <div className="p-8 max-w-7xl mx-auto">
            <InvoiceForm initialData={invoice} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} />
        </div>
    );

    const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' && invoice.status !== 'void' && invoice.status !== 'cancelled';
    const currencySymbol = org?.currency === 'DZD' ? 'د.ج' : (org?.currency === 'EUR' ? '€' : '$');

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => router.push('/inventory/invoices')}>
                <ArrowLeft className="w-4 h-4" /> {t('backToInvoices')}
            </div>

            {isOverdue && (
                <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3">
                    <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                    <p className="text-sm font-bold text-rose-700">{t('overdueMessage', { date: format(new Date(invoice.dueDate!), 'MMMM d, yyyy') })}</p>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0 border border-violet-100">
                        <FileText className="w-8 h-8 text-violet-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{invoice.subject}</h1>
                            <Badge variant="outline" className={`font-bold capitalize border px-3 py-1 ${STATUS_STYLES[invoice.status] || 'bg-slate-100 text-slate-700'}`}>
                                {t(`statuses.${invoice.status.toLowerCase()}`, { defaultValue: invoice.status })}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                            <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {invoice.invoiceNumber}</span>
                            {invoice.dueDate && <><span>•</span><span className={`flex items-center gap-1.5 ${isOverdue ? 'text-rose-600 font-bold' : ''}`}><Calendar className="w-4 h-4" /> {t('fields.due')} {format(new Date(invoice.dueDate), 'MMM d, yyyy')}</span></>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-4 font-bold rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-50 shadow-sm" onClick={handleSendWhatsApp}>
                        <MessageCircle className="w-4 h-4 mr-2" /> {t('whatsapp.send') || 'WhatsApp'}
                    </Button>
                    <Button variant="outline" className="h-11 px-4 font-bold rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" /> {tCommon('edit')}
                    </Button>
                    <Button variant="outline" className="h-11 px-4 font-bold rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 shadow-sm" onClick={handleDelete}>
                        <Trash2 className="w-4 h-4 mr-2" /> {tCommon('delete')}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-14 w-full justify-start overflow-x-auto">
                    <TabsTrigger value="overview" className="rounded-xl font-bold h-10 px-8 data-[state=active]:bg-white data-[state=active]:text-violet-600 data-[state=active]:shadow-sm">{tCommon('overview')}</TabsTrigger>
                    <TabsTrigger value="timeline" className="rounded-xl font-bold h-10 px-8 data-[state=active]:bg-white data-[state=active]:text-violet-600 data-[state=active]:shadow-sm">{tCommon('timeline')}</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 mt-0 focus-visible:outline-none">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 space-y-8">
                            {/* Line Items */}
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-8 pb-6 border-b border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-violet-50 rounded-xl"><DollarSign className="w-4 h-4 text-violet-500" /></div>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.invoicedItems')}</h3>
                                    </div>
                                </div>
                                <div className="overflow-x-auto w-full">
                                    <Table className="min-w-[800px]">
                                        <TableHeader className="bg-slate-50/80">
                                            <TableRow className="border-slate-100 hover:bg-transparent">
                                                <TableHead className="py-4 w-[50px] font-black text-slate-400 text-[10px] uppercase tracking-widest pl-6">#</TableHead>
                                                <TableHead className="py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">{t('inventory.common.product')}</TableHead>
                                                <TableHead className="py-4 text-right font-black text-slate-400 text-[10px] uppercase">{t('inventory.common.qty')}</TableHead>
                                                <TableHead className="py-4 text-right font-black text-slate-400 text-[10px] uppercase">{t('inventory.common.listPrice')}</TableHead>
                                                <TableHead className="py-4 text-right font-black text-slate-400 text-[10px] uppercase">{t('inventory.common.discount')}</TableHead>
                                                <TableHead className="py-4 text-right font-black text-slate-400 text-[10px] uppercase">{t('inventory.common.tax')}</TableHead>
                                                <TableHead className="py-4 text-right font-black text-slate-400 text-[10px] uppercase pr-8">{t('inventory.common.total')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoice.lineItems && invoice.lineItems.length > 0 ? invoice.lineItems.map((item, idx) => (
                                                <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/50">
                                                    <TableCell className="py-4 text-center font-bold text-slate-400 text-xs pl-6">{idx + 1}</TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="font-bold text-slate-900">{item.product?.name || 'Unknown'}</div>
                                                        <div className="text-xs font-medium text-slate-500">{item.product?.sku}</div>
                                                    </TableCell>
                                                    <TableCell className="py-4 text-right font-bold text-slate-700">{item.quantity}</TableCell>
                                                    <TableCell className="py-4 text-right font-bold text-slate-700">{currencySymbol} {Number(item.listPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                    <TableCell className="py-4 text-right font-bold text-rose-600">{currencySymbol} {Number(item.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                    <TableCell className="py-4 text-right font-bold text-slate-700">{Number(item.tax)}%</TableCell>
                                                    <TableCell className="py-4 text-right pr-8 font-black text-slate-900">{currencySymbol} {Number(item.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow><TableCell colSpan={7} className="h-32 text-center text-slate-500 font-medium">{t('placeholders.noItemsAdded')}</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="bg-slate-50/50 p-8 pt-6 border-t border-slate-100 flex flex-col items-end">
                                    <div className="w-full max-w-[320px] space-y-4">
                                        <div className="flex justify-between text-sm font-bold text-slate-500 px-4"><span>{t('fields.subTotal')}</span><span>{currencySymbol} {Number(invoice.subTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                        <div className="flex justify-between text-sm font-bold text-rose-500 px-4"><span>{t('fields.discount')}</span><span>- {currencySymbol} {Number(invoice.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                        <div className="flex justify-between text-sm font-bold text-slate-500 px-4"><span>{t('fields.tax')}</span><span>{currencySymbol} {Number(invoice.tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                        <div className="flex justify-between text-sm font-bold text-slate-600 px-4"><span>{t('fields.adjustment')}</span><span>{currencySymbol} {Number(invoice.adjustment).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                        <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100 mt-4 flex justify-between items-center">
                                            <span className="text-sm font-black text-slate-800 uppercase tracking-widest">{t('fields.grandTotal')}</span>
                                            <span className="text-xl font-black text-violet-700">{currencySymbol} {Number(invoice.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3"><h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('sections.terms')}</h4><div className="p-4 bg-slate-50 rounded-xl min-h-[100px] text-sm text-slate-700 whitespace-pre-wrap font-medium">{invoice.termsAndConditions || t('placeholders.none')}</div></div>
                                    <div className="space-y-3"><h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('sections.description')}</h4><div className="p-4 bg-slate-50 rounded-xl min-h-[100px] text-sm text-slate-700 whitespace-pre-wrap font-medium">{invoice.description || t('placeholders.none')}</div></div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-8">
                            {/* Properties */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-violet-50 rounded-xl"><FileText className="w-4 h-4 text-violet-500" /></div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Properties</h3>
                                </div>
                                <div className="space-y-5">
                                    {invoice.owner && (
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('fields.owner')}</p>
                                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">
                                                    {(invoice.owner as any).firstName?.[0]}{(invoice.owner as any).lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{(invoice.owner as any).firstName} {(invoice.owner as any).lastName}</p>
                                                    <p className="text-xs font-medium text-slate-500">{(invoice.owner as any).email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {invoice.customerNo && <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('fields.customerNo')}</p><p className="text-sm font-bold text-slate-900">{invoice.customerNo}</p></div>}
                                    {invoice.invoiceDate && <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('fields.invoiceDate')}</p><p className="text-sm font-bold text-slate-900">{format(new Date(invoice.invoiceDate), 'MMMM d, yyyy')}</p></div>}
                                    {invoice.dueDate && <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('fields.dueDate')}</p><p className={`text-sm font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>{format(new Date(invoice.dueDate), 'MMMM d, yyyy')}</p></div>}
                                    {invoice.purchaseOrder && <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('fields.purchaseOrder')}</p><p className="text-sm font-bold text-slate-900">{invoice.purchaseOrder}</p></div>}
                                    {invoice.exciseDuty && <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('fields.exciseDuty')}</p><p className="text-sm font-bold text-slate-900">{invoice.exciseDuty}</p></div>}
                                    {invoice.salesCommission !== null && invoice.salesCommission !== undefined && <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('fields.salesCommission')}</p><p className="text-sm font-bold text-slate-900">{invoice.salesCommission}%</p></div>}
                                </div>
                            </div>

                            {/* Related */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-amber-50 rounded-xl"><Building className="w-4 h-4 text-amber-500" /></div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Related To</h3>
                                </div>
                                <div className="space-y-4">
                                    {[(invoice as any).deal && { icon: Briefcase, label: tCommon('deal'), name: (invoice as any).deal.name, sub: `${currencySymbol}${Number((invoice as any).deal.value).toLocaleString()}` },
                                    (invoice as any).account && { icon: Building, label: tCommon('account'), name: (invoice as any).account.name, sub: null },
                                    (invoice as any).contact && { icon: User, label: tCommon('contact'), name: `${(invoice as any).contact.firstName} ${(invoice as any).contact.lastName}`, sub: (invoice as any).contact.email }
                                    ].filter(Boolean).map((rel: any) => (
                                        <div key={rel.label} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest"><rel.icon className="w-3.5 h-3.5" /> {rel.label}</div>
                                            <p className="font-bold text-indigo-600">{rel.name}</p>
                                            {rel.sub && <p className="text-xs text-slate-500">{rel.sub}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Addresses */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-rose-50 rounded-xl"><MapPin className="w-4 h-4 text-rose-500" /></div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{tCommon('sections.address')}</h3>
                                </div>
                                <div className="space-y-4">
                                    <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t('placeholders.billing')}</p><p className="text-sm text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">{fmtAddr(invoice.billingAddress)}</p></div>
                                    <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t('placeholders.shipping')}</p><p className="text-sm text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">{fmtAddr(invoice.shippingAddress)}</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="timeline" className="mt-0 focus-visible:outline-none">
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 border-b border-slate-50 pb-4 mb-8">
                            <div className="p-2 bg-violet-50 rounded-xl"><Clock className="w-4 h-4 text-violet-500" /></div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.history')}</h3>
                        </div>
                        <div className="space-y-6 pl-4 border-l-2 border-slate-100 ml-4">
                            <div className="relative">
                                <div className="absolute -left-[25px] top-1 w-4 h-4 bg-white border-2 border-violet-500 rounded-full" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900">{t('events.created')}</p>
                                    <p className="text-xs font-medium text-slate-500">{format(new Date(invoice.createdAt), 'MMM d, yyyy h:mm a')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
