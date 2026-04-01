'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    ShoppingCart, FileText, User, Building, Briefcase, MapPin, Calendar,
    Clock, ArrowLeft, Edit, Trash2, DollarSign, CheckCircle2, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import SalesOrderForm from '@/components/inventory/SalesOrderForm';
import { SalesOrder } from '@/types';

const STATUS_STYLES: Record<string, string> = {
    created: 'bg-blue-100 text-blue-700 border-blue-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    delivered: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
};

export default function SalesOrderDetailPage({ params }: { params: { id: string } }) {
    const t = useTranslations('inventory.salesOrders');
    const tc = useTranslations('inventory.common');
    const tCommon = useTranslations('common');
    const router = useRouter();
    const [order, setOrder] = useState<SalesOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => { fetchOrder(); }, [params.id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/inventory/sales-orders/${params.id}`);
            const data = await res.json();
            if (data.success) setOrder(data.data);
            else { toast.error(t('errorMessage') || 'Failed to load order'); router.push('/inventory/sales-orders'); }
        } catch { toast.error(tCommon('error')); }
        finally { setLoading(false); }
    };

    const handleUpdate = async (data: any) => {
        const res = await fetch(`/api/inventory/sales-orders/${params.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
            toast.success(t('successMessage')); setOrder(result.data); setIsEditing(false);
        } else { toast.error(result.error || t('errorMessage')); throw new Error(result.error); }
    };

    const handleDelete = async () => {
        if (!confirm(tCommon('confirmDelete') || 'Delete this sales order?')) return;
        const res = await fetch(`/api/inventory/sales-orders/${params.id}`, { method: 'DELETE' });
        if (res.ok) { toast.success(tCommon('deleted') || 'Order deleted'); router.push('/inventory/sales-orders'); }
        else toast.error(tCommon('error') || 'Failed to delete');
    };

    const formatAddress = (addr: any) => {
        if (!addr) return tCommon('notSpecified') || 'Not specified';
        return [addr.street, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(', ') || (tCommon('notSpecified') || 'Not specified');
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!order) return null;

    if (isEditing) return (
        <div className="p-8 max-w-7xl mx-auto">
            <SalesOrderForm initialData={order} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} />
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => router.push('/inventory/sales-orders')}>
                <ArrowLeft className="w-4 h-4" /> {t('backToList') || 'Back to Sales Orders'}
            </div>

            {/* Hero Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                        <ShoppingCart className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{order.subject}</h1>
                            <Badge variant="outline" className={`font-bold capitalize border px-3 py-1 ${STATUS_STYLES[order.status.toLowerCase()] || 'bg-slate-100 text-slate-700'}`}>
                                {t(`statuses.${order.status.toLowerCase()}`) || order.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                            <span className="flex items-center gap-1.5"><ShoppingCart className="w-4 h-4" /> {order.orderNumber}</span>
                            {order.customerNo && <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {order.customerNo}</span>}
                            {order.dueDate && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5 text-rose-600"><Calendar className="w-4 h-4" /> {tCommon('due')} {format(new Date(order.dueDate), 'MMM d, yyyy')}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-4 font-bold rounded-xl text-indigo-600 border-indigo-200 hover:bg-indigo-50 shadow-sm"
                        onClick={async () => {
                            if (!confirm(t('convertToInvoiceConfirm') || 'Convert this Sales Order to an Invoice?')) return;
                            try {
                                const res = await fetch(`/api/inventory/sales-orders/${params.id}/convert`, { method: 'POST' });
                                const data = await res.json();
                                if (data.success) {
                                    toast.success(t('convertedToInvoice') || 'Converted to Invoice!');
                                    router.push(`/inventory/invoices/${data.data.id}`);
                                } else {
                                    toast.error(data.error || t('conversionFailed') || 'Conversion failed');
                                }
                            } catch (err) {
                                toast.error(tCommon('error'));
                            }
                        }}>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> {t('convertToInvoice') || 'Convert to Invoice'}
                    </Button>
                    <Button variant="outline" className="h-11 px-4 font-bold rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm"
                        onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" /> {tCommon('edit')}
                    </Button>
                    <Button variant="outline" className="h-11 px-4 font-bold rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 shadow-sm"
                        onClick={handleDelete}>
                        <Trash2 className="w-4 h-4 mr-2" /> {tCommon('delete')}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-14 w-full justify-start overflow-x-auto">
                    <TabsTrigger value="overview" className="rounded-xl font-bold h-10 px-8 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm">{tCommon('overview')}</TabsTrigger>
                    <TabsTrigger value="timeline" className="rounded-xl font-bold h-10 px-8 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm">{tCommon('timeline')}</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 mt-0 focus-visible:outline-none">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Left: Line Items & Totals */}
                        <div className="xl:col-span-2 space-y-8">
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-8 pb-6 border-b border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-orange-50 rounded-xl">
                                            <DollarSign className="w-4 h-4 text-orange-500" />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.orderedItems')}</h3>
                                    </div>
                                </div>
                                <div className="overflow-x-auto w-full">
                                    <Table className="min-w-[800px]">
                                        <TableHeader className="bg-slate-50/80">
                                            <TableRow className="border-slate-100 hover:bg-transparent">
                                                <TableHead className="py-4 w-[50px] text-center font-black text-slate-400 uppercase text-[10px] tracking-widest pl-6">#</TableHead>
                                                <TableHead className="py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">{tc('product')}</TableHead>
                                                <TableHead className="py-4 text-right font-black text-slate-400 uppercase text-[10px] tracking-widest">{tc('qty')}</TableHead>
                                                <TableHead className="py-4 text-right font-black text-slate-400 uppercase text-[10px] tracking-widest">{t('fields.unitPrice') || tc('unitPrice')}</TableHead>
                                                <TableHead className="py-4 text-right font-black text-slate-400 uppercase text-[10px] tracking-widest">{tc('discount')}</TableHead>
                                                <TableHead className="py-4 text-right font-black text-slate-400 uppercase text-[10px] tracking-widest">{t('fields.taxPercent') || tc('tax')}</TableHead>
                                                <TableHead className="py-4 text-right font-black text-slate-400 uppercase text-[10px] tracking-widest pr-8">{tc('total')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {order.lineItems && order.lineItems.length > 0 ? (
                                                order.lineItems.map((item, index) => (
                                                    <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/50">
                                                        <TableCell className="py-4 text-center font-bold text-slate-400 text-xs pl-6">{index + 1}</TableCell>
                                                        <TableCell className="py-4">
                                                            <div className="font-bold text-slate-900">{item.product?.name || 'Unknown'}</div>
                                                            <div className="text-xs font-medium text-slate-500">{item.product?.sku}</div>
                                                            {item.description && <p className="text-xs text-slate-400 mt-1">{item.description}</p>}
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right font-bold text-slate-700">{item.quantity}</TableCell>
                                                        <TableCell className="py-4 text-right font-bold text-slate-700">{(order.account as any)?.currency === 'DZD' ? 'DZD' : '$'} {Number(item.listPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                        <TableCell className="py-4 text-right font-bold text-rose-600">{(order.account as any)?.currency === 'DZD' ? 'DZD' : '$'} {Number(item.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                        <TableCell className="py-4 text-right font-bold text-slate-700">{Number(item.tax)}%</TableCell>
                                                        <TableCell className="py-4 text-right pr-8 font-black text-slate-900">{(order.account as any)?.currency === 'DZD' ? 'DZD' : '$'} {Number(item.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-32 text-center text-slate-500 font-medium">{t('placeholders.noItemsAdded') || 'No items added.'}</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Totals */}
                                <div className="bg-slate-50/50 p-8 pt-6 border-t border-slate-100 flex flex-col items-end gap-3">
                                    <div className="w-full max-w-[320px] space-y-4">
                                        <div className="flex justify-between text-sm font-bold text-slate-500 px-4">
                                            <span>{t('fields.subTotal') || tc('subTotal')}</span><span>{(order.account as any)?.currency === 'DZD' ? 'DZD' : '$'} {Number(order.subTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-rose-500 px-4">
                                            <span>{t('fields.discount') || tc('discount')}</span><span>- {(order.account as any)?.currency === 'DZD' ? 'DZD' : '$'} {Number(order.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-slate-500 px-4">
                                            <span>{t('fields.tax') || tc('tax')}</span><span>{(order.account as any)?.currency === 'DZD' ? 'DZD' : '$'} {Number(order.tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-slate-600 px-4">
                                            <span>{tc('adjustment') || 'Adjustment'}</span><span>{Number(order.adjustment) >= 0 ? '+' : '-'}{(order.account as any)?.currency === 'DZD' ? 'DZD' : '$'}{Math.abs(Number(order.adjustment)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 mt-4 flex justify-between items-center">
                                            <span className="text-sm font-black text-slate-800 uppercase tracking-widest">{t('fields.grandTotal') || tCommon('total')}</span>
                                            <span className="text-xl font-black text-orange-700">{(order.account as any)?.currency === 'DZD' ? 'DZD' : '$'} {Number(order.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Terms & Notes */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-slate-100 rounded-xl"><FileText className="w-4 h-4 text-slate-500" /></div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.termsNotes')}</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{tc('termsAndConditions')}</h4>
                                        <div className="p-4 bg-slate-50 rounded-xl min-h-[120px] text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                                            {order.termsAndConditions || (tCommon('none') || 'No specific terms.')}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{tc('description') || 'Internal Notes'}</h4>
                                        <div className="p-4 bg-slate-50 rounded-xl min-h-[120px] text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                                            {order.description || (tCommon('none') || 'No notes provided.')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Properties + Relations + Addresses */}
                        <div className="space-y-8">
                            {/* Properties */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-orange-50 rounded-xl"><ShoppingCart className="w-4 h-4 text-orange-500" /></div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{tCommon('properties')}</h3>
                                </div>
                                <div className="space-y-5">
                                    {order.owner && (
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('fields.orderOwner')}</p>
                                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-700">
                                                    {(order.owner as any).firstName?.[0]}{(order.owner as any).lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{(order.owner as any).firstName} {(order.owner as any).lastName}</p>
                                                    <p className="text-xs font-medium text-slate-500">{(order.owner as any).email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {order.customerNo && (
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('fields.customerNo')}</p>
                                            <p className="text-sm font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">{order.customerNo}</p>
                                        </div>
                                    )}
                                    {order.dueDate && (
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('fields.dueDate')}</p>
                                            <p className="text-sm font-bold text-rose-600">{format(new Date(order.dueDate), 'MMM d, yyyy')}</p>
                                        </div>
                                    )}
                                    {order.validUntil && (
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('fields.validUntil')}</p>
                                            <p className="text-sm font-bold text-slate-900">{format(new Date(order.validUntil), 'MMM d, yyyy')}</p>
                                        </div>
                                    )}
                                    {order.trackingNumber && (
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('fields.trackingNumber')}</p>
                                            <p className="text-sm font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 font-mono">{order.trackingNumber}</p>
                                        </div>
                                    )}
                                    {order.purchaseOrder && (
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('fields.purchaseOrder')}</p>
                                            <p className="text-sm font-bold text-slate-900">{order.purchaseOrder}</p>
                                        </div>
                                    )}
                                    {order.carrier && (
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('fields.carrier')}</p>
                                            <p className="text-sm font-bold text-slate-900">{order.carrier}</p>
                                        </div>
                                    )}
                                    {(order.salesCommission !== null && order.salesCommission !== undefined) && (
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('fields.salesCommission')}</p>
                                            <p className="text-sm font-bold text-slate-900">{order.salesCommission}%</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Related To */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-amber-50 rounded-xl"><Building className="w-4 h-4 text-amber-500" /></div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{tCommon('relatedTo')}</h3>
                                </div>
                                <div className="space-y-4">
                                    {(order as any).deal ? (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                <Briefcase className="w-3.5 h-3.5" /> {tCommon('deal')}
                                            </div>
                                            <p className="font-bold text-indigo-600">{(order as any).deal.name}</p>
                                            <p className="text-xs text-slate-500">${Number((order as any).deal.value).toLocaleString()}</p>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                            <Briefcase className="w-4 h-4 text-slate-300" />
                                            <span className="text-sm font-medium text-slate-400">{tCommon('noRecordsFound')}</span>
                                        </div>
                                    )}
                                    {(order as any).account ? (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                <Building className="w-3.5 h-3.5" /> {tCommon('account')}
                                            </div>
                                            <p className="font-bold text-indigo-600">{(order as any).account.name}</p>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                            <Building className="w-4 h-4 text-slate-300" />
                                            <span className="text-sm font-medium text-slate-400">{tCommon('noRecordsFound')}</span>
                                        </div>
                                    )}
                                    {(order as any).contact ? (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                <User className="w-3.5 h-3.5" /> {tCommon('contact')}
                                            </div>
                                            <p className="font-bold text-indigo-600">{(order as any).contact.firstName} {(order as any).contact.lastName}</p>
                                            <p className="text-xs text-slate-500">{(order as any).contact.email}</p>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                            <User className="w-4 h-4 text-slate-300" />
                                            <span className="text-sm font-medium text-slate-400">{tCommon('noRecordsFound')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Addresses */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-rose-50 rounded-xl"><MapPin className="w-4 h-4 text-rose-500" /></div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('sections.addressInfo')}</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('fields.billingAddress')}</h4>
                                        <p className="text-sm text-slate-700 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            {formatAddress(order.billingAddress)}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('fields.shippingAddress')}</h4>
                                        <p className="text-sm text-slate-700 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            {formatAddress(order.shippingAddress)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="timeline" className="mt-0 focus-visible:outline-none">
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm min-h-[400px]">
                        <div className="flex items-center gap-2 border-b border-slate-50 pb-4 mb-8">
                            <div className="p-2 bg-orange-50 rounded-xl"><Clock className="w-4 h-4 text-orange-500" /></div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{tCommon('timeline')}</h3>
                        </div>
                        <div className="space-y-6 pl-4 border-l-2 border-slate-100 ml-4">
                            <div className="relative">
                                <div className="absolute -left-[25px] top-1 w-4 h-4 bg-white border-2 border-orange-500 rounded-full" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900">{tCommon('stateLabels.created')}</p>
                                    <p className="text-xs font-medium text-slate-500">
                                        {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')} {tCommon('by')} {(order.owner as any)?.firstName} {(order.owner as any)?.lastName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
