'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    ShoppingCart, Building2, MapPin, ArrowLeft, Edit, Trash2,
    Calendar, Info, Clock, User, DollarSign, Package, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import PurchaseOrderForm from '@/components/inventory/PurchaseOrderForm';
import { PurchaseOrder } from '@/types';

const STATUS_STYLE: Record<string, string> = {
    draft: 'bg-slate-50 text-slate-600 border-slate-200',
    ordered: 'bg-blue-50 text-blue-700 border-blue-100',
    received: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
};

export default function PODetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [order, setOrder] = useState<PurchaseOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/inventory/purchase-orders/${params.id}`);
            const data = await res.json();
            if (data.success) setOrder(data.data);
            else router.push('/inventory/purchase-orders');
        } catch { toast.error('Failed to load PO'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrder(); }, [params.id]);

    const handleUpdate = async (data: any) => {
        const res = await fetch(`/api/inventory/purchase-orders/${params.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
            toast.success('PO Updated');
            setOrder(result.data);
            setIsEditing(false);
        } else {
            toast.error(result.error || 'Update failed');
            throw new Error(result.error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Cancel this Purchase Order?')) return;
        const res = await fetch(`/api/inventory/purchase-orders/${params.id}`, { method: 'DELETE' });
        if (res.ok) {
            toast.success('PO Cancelled');
            router.push('/inventory/purchase-orders');
        } else toast.error('Failed to delete');
    };

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!order) return null;

    if (isEditing) return (
        <div className="p-8 max-w-7xl mx-auto">
            <PurchaseOrderForm initialData={order} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} />
        </div>
    );

    const fmtAddr = (addr: any) => {
        if (!addr) return 'Not specified';
        return [addr.street, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(', ') || 'Not specified';
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => router.push('/inventory/purchase-orders')}>
                <ArrowLeft className="w-4 h-4" /> Back to Orders
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                        <ShoppingCart className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{order.subject}</h1>
                            <Badge variant="outline" className={`font-black uppercase border px-3 py-1 ${STATUS_STYLE[order.status] || 'bg-slate-50 text-slate-700'}`}>
                                {order.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                            <span className="flex items-center gap-1.5 uppercase font-black text-indigo-500">{order.orderNumber}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {order.vendor?.name}</span>
                            {order.contact && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {order.contact.firstName} {order.contact.lastName}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-4 font-bold rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" /> Modify
                    </Button>
                    <Button variant="outline" className="h-11 px-4 font-bold rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50" onClick={handleDelete}>
                        <Trash2 className="w-4 h-4 mr-2" /> Cancel PO
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-14 w-full justify-start overflow-x-auto">
                    <TabsTrigger value="overview" className="rounded-xl font-bold h-10 px-8 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Overview</TabsTrigger>
                    <TabsTrigger value="timeline" className="rounded-xl font-bold h-10 px-8 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Procurement Journey</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 mt-0 focus-visible:outline-none">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 space-y-8">
                            {/* Line Items */}
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-8 pb-6 border-b border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-indigo-50 rounded-xl"><Package className="w-4 h-4 text-indigo-500" /></div>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Requested Items</h3>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <Table className="min-w-[800px]">
                                        <TableHeader className="bg-slate-50/80">
                                            <TableRow className="border-slate-100">
                                                <TableHead className="py-4 pl-10 font-black text-slate-400 text-[10px] uppercase">No.</TableHead>
                                                <TableHead className="py-4 font-black text-slate-400 text-[10px] uppercase">Product</TableHead>
                                                <TableHead className="py-4 text-center font-black text-slate-400 text-[10px] uppercase">Quantity</TableHead>
                                                <th className="py-4 text-right font-black text-slate-400 text-[10px] uppercase pr-10">Unit Price</th>
                                                <th className="py-4 text-right font-black text-slate-400 text-[10px] uppercase pr-10">Total</th>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {order.lineItems?.map((item, idx) => (
                                                <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <TableCell className="py-5 pl-10 text-xs font-black text-slate-400">{idx + 1}</TableCell>
                                                    <TableCell className="py-5">
                                                        <p className="font-bold text-slate-900">{item.product?.name || 'Unknown'}</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">{item.product?.sku}</p>
                                                    </TableCell>
                                                    <TableCell className="py-5 text-center font-black text-slate-700">{item.quantity}</TableCell>
                                                    <TableCell className="py-5 text-right pr-10 font-bold text-slate-600">${Number(item.listPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                    <TableCell className="py-5 text-right pr-10 font-black text-slate-900">${Number(item.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="bg-slate-50/50 p-10 pt-8 border-t border-slate-100 flex flex-col items-end">
                                    <div className="w-full max-w-[340px] space-y-4">
                                        <div className="flex justify-between items-center text-sm font-bold text-slate-500 px-4"><span>Sub Total</span><span className="text-slate-900">${Number(order.subTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                        <div className="flex justify-between items-center text-sm font-bold text-rose-500 px-4"><span>Total Discount</span><span>- ${Number(order.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                        <div className="flex justify-between items-center text-sm font-bold text-slate-500 px-4"><span>Taxes</span><span className="text-slate-900">${Number(order.tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                        <div className="flex justify-between items-center text-sm font-bold text-slate-400 px-4"><span>Adjustment</span><span className="text-slate-900">${Number(order.adjustment).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                        <div className="h-px bg-slate-200/50 my-2" />
                                        <div className="bg-indigo-600 rounded-2xl p-5 shadow-xl shadow-indigo-100 border border-indigo-400 flex justify-between items-center">
                                            <span className="text-xs font-black text-indigo-100 uppercase tracking-[0.2em]">Grand Total</span>
                                            <span className="text-2xl font-black text-white">${Number(order.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address Info */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-8">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-indigo-50 rounded-xl"><MapPin className="w-4 h-4 text-indigo-500" /></div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Logistics & Address</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Billing Target</p>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed italic">{fmtAddr(order.billingAddress)}</div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Shipping Destination</p>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed italic">{fmtAddr(order.shippingAddress)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Properties */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-indigo-50 rounded-xl"><Info className="w-4 h-4 text-indigo-500" /></div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Order Properties</h3>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Procurement Owner</p>
                                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-50">
                                            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-[11px] font-black text-white">{order.owner?.firstName?.[0]}{order.owner?.lastName?.[0]}</div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 leading-none mb-1">{order.owner?.firstName} {order.owner?.lastName}</p>
                                                <p className="text-[10px] font-medium text-slate-500">{order.owner?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PO Date</p><p className="text-sm font-bold text-slate-700">{order.poDate ? format(new Date(order.poDate), 'MMMM d, yyyy') : 'No date set'}</p></div>
                                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p><p className="text-sm font-bold text-slate-700">{order.dueDate ? format(new Date(order.dueDate), 'MMMM d, yyyy') : 'No due date set'}</p></div>
                                    {order.trackingNumber && <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tracking Info</p><p className="text-sm font-bold text-indigo-600 select-all">{order.trackingNumber}</p><p className="text-[10px] font-bold text-slate-400 uppercase italic">via {order.carrier || 'Unspecified Carrier'}</p></div>}
                                    <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Excise Duty</p>
                                            <p className="text-sm font-bold text-slate-700">{order.exciseDuty || '0.00'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Commission</p>
                                            <p className="text-sm font-bold text-slate-700">{order.salesCommission || 0}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details */}
                            {order.contact && (
                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                    <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                        <div className="p-2 bg-indigo-50 rounded-xl"><User className="w-4 h-4 text-indigo-500" /></div>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Contact Info</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                            <p className="text-lg font-black text-slate-900 leading-tight mb-1">{order.contact.firstName} {order.contact.lastName}</p>
                                            <p className="text-xs font-medium text-slate-500 mb-3">{order.contact.email}</p>
                                            <Button variant="outline" size="sm" onClick={() => router.push(`/contacts/${order.contactId}`)} className="h-8 rounded-lg text-xs font-bold border-slate-100 bg-white text-slate-600 hover:bg-slate-50 w-full">View Contact</Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Vendor Details */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-indigo-50 rounded-xl"><Building2 className="w-4 h-4 text-indigo-500" /></div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Vendor Info</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-5 bg-gradient-to-br from-indigo-50 to-white rounded-3xl border border-indigo-100">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Company Name</p>
                                        <p className="text-lg font-black text-indigo-900 leading-tight mb-3">{order.vendor?.name}</p>
                                        <Button variant="outline" size="sm" onClick={() => router.push(`/inventory/vendors/${order.vendorId}`)} className="h-8 rounded-lg text-xs font-bold border-indigo-100 bg-white text-indigo-600 hover:bg-indigo-50 w-full">View Vendor Profile</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="timeline" className="mt-0 focus-visible:outline-none">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm min-h-[400px]">
                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center"><Clock className="w-8 h-8 text-indigo-300" /></div>
                            <div><p className="text-lg font-black text-slate-900">Order Journey</p><p className="text-sm font-medium text-slate-500">History and timeline for {order.orderNumber} will appear here.</p></div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
