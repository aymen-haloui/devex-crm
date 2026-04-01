'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    FileText,
    User,
    Building,
    Briefcase,
    MapPin,
    Calendar,
    Clock,
    ArrowLeft,
    Edit,
    Trash2,
    DollarSign,
    Send,
    Download,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import QuoteForm from '@/components/inventory/QuoteForm';
import { Quote } from '@/types';

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchQuote();
    }, [params.id]);

    const fetchQuote = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/inventory/quotes/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setQuote(data.data);
            } else {
                toast.error('Failed to load quote details');
                router.push('/inventory/quotes');
            }
        } catch (error) {
            console.error('Error fetching quote:', error);
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (data: any) => {
        try {
            const res = await fetch(`/api/inventory/quotes/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const responseData = await res.json();
            if (responseData.success) {
                toast.success('Quote updated successfully');
                setQuote(responseData.data);
                setIsEditing(false);
            } else {
                toast.error(responseData.error || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update quote');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this quote?')) return;
        try {
            const res = await fetch(`/api/inventory/quotes/${params.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('Quote deleted');
                router.push('/inventory/quotes');
            } else {
                toast.error('Failed to delete quote');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Loading quote details...</p>
                </div>
            </div>
        );
    }

    if (!quote) return null;

    if (isEditing) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <QuoteForm
                    initialData={quote}
                    onSubmit={handleUpdate}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    const getStageBadgeColor = (stage: string) => {
        switch (stage?.toLowerCase()) {
            case 'draft': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'negotiation': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'delivered': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'on hold': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'closed won': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'closed lost': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const formatAddress = (address: any) => {
        if (!address) return 'Not specified';
        const parts = [address.street, address.city, address.state, address.zip, address.country].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'Not specified';
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">

            {/* Header Actions */}
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => router.push('/inventory/quotes')}>
                <ArrowLeft className="w-4 h-4" />
                Back to Quotes
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                        <FileText className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{quote.subject}</h1>
                            <Badge variant="outline" className={`font-bold capitalize border px-3 py-1 ${getStageBadgeColor(quote.stage)}`}>
                                {quote.stage}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                            <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {quote.quoteNumber}</span>
                            {quote.validUntil && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Valid until {format(new Date(quote.validUntil), 'MMM d, yyyy')}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-4 font-bold rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm">
                        <Download className="w-4 h-4 mr-2" /> PDF
                    </Button>
                    <Button variant="outline" className="h-11 px-4 font-bold rounded-xl text-indigo-600 border-indigo-200 hover:bg-indigo-50 shadow-sm">
                        <Send className="w-4 h-4 mr-2" /> Email Quote
                    </Button>
                    <div className="w-px h-8 bg-slate-200 mx-1"></div>
                    <Button variant="outline" className="h-11 px-4 font-bold rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button variant="outline" className="h-11 px-4 font-bold rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 shadow-sm" onClick={handleDelete}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                </div>
            </div>

            {/* Main Content Areas */}
            <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-14 w-full justify-start overflow-x-auto">
                    <TabsTrigger value="overview" className="rounded-xl font-bold h-10 px-8 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Overview</TabsTrigger>
                    <TabsTrigger value="timeline" className="rounded-xl font-bold h-10 px-8 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 mt-0 focus-visible:outline-none">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                        {/* Left Column: Line Items & Totals */}
                        <div className="xl:col-span-2 space-y-8">

                            {/* Line Items Card */}
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-8 pb-6 border-b border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-emerald-50 rounded-xl">
                                            <DollarSign className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Quoted Items</h3>
                                    </div>
                                </div>

                                <div className="overflow-x-auto w-full">
                                    <Table className="min-w-[800px]">
                                        <TableHeader className="bg-slate-50/80">
                                            <TableRow className="border-slate-100 hover:bg-transparent">
                                                <TableHead className="py-4 w-[50px] text-center font-black text-slate-400 uppercase text-[10px] tracking-widest pl-6">No.</TableHead>
                                                <TableHead className="py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Product</TableHead>
                                                <TableHead className="py-4 text-right font-black text-slate-400 uppercase text-[10px] tracking-widest">Qty</TableHead>
                                                <TableHead className="py-4 text-right font-black text-slate-400 uppercase text-[10px] tracking-widest">List Price</TableHead>
                                                <TableHead className="py-4 text-right font-black text-slate-400 uppercase text-[10px] tracking-widest">Discount</TableHead>
                                                <TableHead className="py-4 text-right font-black text-slate-400 uppercase text-[10px] tracking-widest">Tax</TableHead>
                                                <TableHead className="py-4 text-right font-black text-slate-400 uppercase text-[10px] tracking-widest pr-8">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {quote.lineItems && quote.lineItems.length > 0 ? (
                                                quote.lineItems.map((item, index) => (
                                                    <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/50">
                                                        <TableCell className="py-4 text-center font-bold text-slate-400 text-xs pl-6">{index + 1}</TableCell>
                                                        <TableCell className="py-4">
                                                            <div className="font-bold text-slate-900">{item.product?.name || 'Unknown'}</div>
                                                            <div className="text-xs font-medium text-slate-500 mt-0.5">{item.product?.sku}</div>
                                                            {item.description && (
                                                                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{item.description}</p>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right font-bold text-slate-700">{item.quantity}</TableCell>
                                                        <TableCell className="py-4 text-right font-bold text-slate-700">${Number(item.listPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell className="py-4 text-right font-bold text-rose-600">${Number(item.discount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell className="py-4 text-right font-bold text-slate-700">{Number(item.tax)}%</TableCell>
                                                        <TableCell className="py-4 text-right pr-8 font-black text-slate-900">${Number(item.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-32 text-center text-slate-500 font-medium pb-8 pt-8">No line items attached.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Math Breakdown */}
                                <div className="bg-slate-50/50 p-8 pt-6 border-t border-slate-100 flex flex-col items-end gap-3">
                                    <div className="w-full max-w-[320px] space-y-4">
                                        <div className="flex justify-between items-center text-sm font-bold text-slate-500 px-4">
                                            <span>Sub Total</span>
                                            <span>${Number(quote.subTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold text-rose-500 px-4">
                                            <span>Discount</span>
                                            <span>- ${Number(quote.discount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold text-slate-500 px-4">
                                            <span>Tax</span>
                                            <span>${Number(quote.tax).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold text-slate-600 px-4">
                                            <span>Adjustment</span>
                                            <span>{Number(quote.adjustment) >= 0 ? '+' : '-'} ${Math.abs(Number(quote.adjustment)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>

                                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mt-4 flex justify-between items-center">
                                            <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Grand Total</span>
                                            <span className="text-xl font-black text-indigo-700">${Number(quote.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Terms & Notes Card */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-slate-100 rounded-xl">
                                        <FileText className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Terms & Description</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Terms and Conditions</h4>
                                        <div className="p-4 bg-slate-50 rounded-xl min-h-[120px] text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                                            {quote.termsAndConditions || 'No specific terms provided.'}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Internal Description</h4>
                                        <div className="p-4 bg-slate-50 rounded-xl min-h-[120px] text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                                            {quote.description || 'No description provided.'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Key Details & Relations */}
                        <div className="space-y-8">

                            {/* Important Details */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-indigo-50 rounded-xl">
                                        <FileText className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Properties</h3>
                                </div>
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Quote Owner</p>
                                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                                {quote.owner?.firstName?.[0]}{quote.owner?.lastName?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{quote.owner?.firstName} {quote.owner?.lastName}</p>
                                                <p className="text-xs font-medium text-slate-500 line-clamp-1">{quote.owner?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Team</p>
                                        <p className="text-sm font-bold text-slate-900">{quote.team || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Carrier</p>
                                        <p className="text-sm font-bold text-slate-900">{quote.carrier || '—'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Relations */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-amber-50 rounded-xl">
                                        <Building className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Related To</h3>
                                </div>

                                <div className="space-y-4">
                                    {quote.deal ? (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 cursor-pointer hover:bg-indigo-50/50 transition-colors group">
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                <Briefcase className="w-4 h-4" /> Deal
                                            </div>
                                            <p className="font-bold text-indigo-600 group-hover:text-indigo-700">{quote.deal.name}</p>
                                            <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-1">
                                                <span>Stage: {quote.deal.stage}</span>
                                                <span className="font-bold text-slate-700">${Number(quote.deal.value).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                            <Briefcase className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-medium text-slate-500">No deal attached</span>
                                        </div>
                                    )}

                                    {quote.account ? (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 cursor-pointer hover:bg-indigo-50/50 transition-colors group">
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                <Building className="w-4 h-4" /> Account
                                            </div>
                                            <p className="font-bold text-indigo-600 group-hover:text-indigo-700">{quote.account.name}</p>
                                            {quote.account.phone && <p className="text-xs font-medium text-slate-500">{quote.account.phone}</p>}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                            <Building className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-medium text-slate-500">No account attached</span>
                                        </div>
                                    )}

                                    {quote.contact ? (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 cursor-pointer hover:bg-indigo-50/50 transition-colors group">
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                <User className="w-4 h-4" /> Contact
                                            </div>
                                            <p className="font-bold text-indigo-600 group-hover:text-indigo-700">{quote.contact.firstName} {quote.contact.lastName}</p>
                                            <p className="text-xs font-medium text-slate-500">{quote.contact.email}</p>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-medium text-slate-500">No contact attached</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Address Information */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-rose-50 rounded-xl">
                                        <MapPin className="w-4 h-4 text-rose-500" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Addresses</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Billing Address</h4>
                                        <p className="text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            {formatAddress(quote.billingAddress)}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Shipping Address</h4>
                                        <p className="text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            {formatAddress(quote.shippingAddress)}
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
                            <div className="p-2 bg-indigo-50 rounded-xl">
                                <Clock className="w-4 h-4 text-indigo-500" />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Quote History</h3>
                        </div>

                        <div className="space-y-6 pl-4 border-l-2 border-slate-100 ml-4">
                            <div className="relative">
                                <div className="absolute -left-[25px] top-1 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900">Quote Draft Created</p>
                                    <p className="text-xs font-medium text-slate-500">{format(new Date(quote.createdAt), 'MMM d, yyyy h:mm a')} by {quote.owner?.firstName} {quote.owner?.lastName}</p>
                                </div>
                            </div>
                            {/* Expand Timeline items dynamically in future updates based on audit logs */}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
