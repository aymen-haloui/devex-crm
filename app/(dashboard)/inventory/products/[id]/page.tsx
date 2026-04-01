'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ChevronLeft,
    Edit3,
    Trash2,
    History,
    LayoutDashboard,
    Package,
    DollarSign,
    Hash,
    Calendar,
    Box,
    CheckCircle2,
    Clock,
    User as UserIcon,
    MoreVertical,
    FileText,
    ArrowUpDown,
    ShieldCheck,
    Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import ProductForm from '@/components/inventory/ProductForm';
import { Product } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ProductDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [params, setParams] = useState<{ id: string } | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        paramsPromise.then(setParams);
    }, [paramsPromise]);

    const fetchProduct = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/products/${id}`);
            const data = await res.json();
            if (data.success) {
                setProduct(data.data);
            } else {
                toast.error(data.error || 'Failed to fetch product');
                router.push('/inventory/products');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('An error occurred while fetching the product');
        } finally {
            setLoading(false);
        }
    };

    const fetchActivities = async (id: string) => {
        setLoadingActivities(true);
        try {
            const res = await fetch(`/api/activities?relatedToId=${id}&relatedToType=product&limit=20`);
            const data = await res.json();
            if (data.success) {
                setActivities(data.data);
            }
        } catch (error) {
            console.error('Error fetching product activities:', error);
        } finally {
            setLoadingActivities(false);
        }
    };

    useEffect(() => {
        if (params?.id) {
            fetchProduct(params.id);
            fetchActivities(params.id);
        }
    }, [params?.id]);

    const handleUpdate = async (data: any) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/products/${params?.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();

            if (result.success) {
                toast.success('Product updated successfully');
                setProduct(result.data);
                setIsEditMode(false);
            } else {
                toast.error(result.error || 'Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('An error occurred during update');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`/api/products/${params?.id}`, {
                method: 'DELETE',
            });
            const result = await res.json();

            if (result.success) {
                toast.success('Product deleted successfully');
                router.push('/inventory/products');
            } else {
                toast.error(result.error || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('An error occurred during deletion');
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Syncing Product Catalog...</p>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in duration-500">
            {/* Nav Header */}
            <div className="flex items-center justify-between mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/inventory/products')}
                    className="group flex items-center gap-2 hover:bg-slate-100 rounded-xl px-4 py-2 transition-all"
                >
                    <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:-translate-x-1 transition-all" />
                    <span className="text-sm font-bold text-slate-600">Inventory Catalog</span>
                </Button>

                <div className="flex items-center gap-2">
                    {!isEditMode && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditMode(true)}
                                className="rounded-xl border-slate-200 font-bold h-10 px-6 gap-2 hover:bg-white hover:shadow-sm"
                            >
                                <Edit3 className="w-4 h-4 text-slate-400" /> Edit
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="rounded-xl border-slate-200 h-10 w-10">
                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl p-1 w-48">
                                    <DropdownMenuItem className="rounded-xl font-bold py-2.5 cursor-pointer text-slate-600 focus:bg-slate-50">
                                        Duplicate Product
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl font-bold py-2.5 cursor-pointer text-slate-600 focus:bg-slate-50">
                                        Print Barcode
                                    </DropdownMenuItem>
                                    <Separator className="my-1 bg-slate-50" />
                                    <DropdownMenuItem
                                        onClick={handleDelete}
                                        className="rounded-xl font-bold py-2.5 cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-600"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete Product
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </div>
            </div>

            {/* Entity Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                        {product.image ? (
                            <img src={product.image} className="w-12 h-12 object-contain filter brightness-0 invert" />
                        ) : (
                            <Box className="w-10 h-10 text-white" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{product.name}</h1>
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-extrabold uppercase text-[10px] tracking-widest px-3 py-1 rounded-full">
                                {product.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Hash className="w-3 h-3" /> SKU: {product.sku}
                            </span>
                            <Separator orientation="vertical" className="h-3 bg-slate-200" />
                            <span className="text-xs font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5 cursor-pointer hover:underline">
                                <DollarSign className="w-3 h-3" /> MSRP: ${product.unitPrice.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Handler Assigned</div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {product.handler?.firstName?.[0] || 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                            {product.handler ? `${product.handler.firstName} ${product.handler.lastName}` : 'Unassigned'}
                        </span>
                    </div>
                </div>
            </div>

            {isEditMode ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <ProductForm
                        initialData={product}
                        onSubmit={handleUpdate}
                        onCancel={() => setIsEditMode(false)}
                        loading={saving}
                    />
                </div>
            ) : (
                <Tabs defaultValue="overview" className="space-y-8">
                    <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl gap-2 w-fit">
                        <TabsTrigger value="overview" className="rounded-xl font-bold px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all gap-2 uppercase text-[10px] tracking-widest">
                            <LayoutDashboard className="w-3.5 h-3.5" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="rounded-xl font-bold px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all gap-2 uppercase text-[10px] tracking-widest">
                            <History className="w-3.5 h-3.5" /> Timeline
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Info */}
                            <div className="lg:col-span-2 space-y-8">
                                <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
                                    <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-100">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Detailed Specs</h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-10">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Product Code</p>
                                                <p className="font-bold text-slate-900">{product.productCode || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Manufacturer</p>
                                                <p className="font-bold text-slate-900">{product.manufacturer || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Usage Unit</p>
                                                <p className="font-bold text-slate-600">{product.usageUnit || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Category</p>
                                                <p className="font-bold text-indigo-600">{product.productCategory || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Vendor</p>
                                                <p className="font-bold text-slate-900">{product.vendorName || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Commission Rate</p>
                                                <p className="font-bold text-emerald-600">{product.commissionRate ? `${product.commissionRate}%` : '0%'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-10">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Commercial lifecycle</h3>
                                        <div className="grid grid-cols-2 gap-10">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-blue-50 rounded-2xl">
                                                        <Calendar className="w-5 h-5 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sales Start</p>
                                                        <p className="font-bold text-slate-900">
                                                            {product.salesStartDate ? format(new Date(product.salesStartDate), 'MMM dd, yyyy') : 'No Date Set'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-indigo-50 rounded-2xl">
                                                        <Calendar className="w-5 h-5 text-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Support Start</p>
                                                        <p className="font-bold text-slate-900">
                                                            {product.supportStartDate ? format(new Date(product.supportStartDate), 'MMM dd, yyyy') : 'No Date Set'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-rose-50 rounded-2xl opacity-50">
                                                        <Calendar className="w-5 h-5 text-rose-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sales End</p>
                                                        <p className="font-bold text-slate-900">
                                                            {product.salesEndDate ? format(new Date(product.salesEndDate), 'MMM dd, yyyy') : 'Perpetual'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-amber-50 rounded-2xl opacity-50">
                                                        <Calendar className="w-5 h-5 text-amber-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Support End</p>
                                                        <p className="font-bold text-slate-900">
                                                            {product.supportEndDate ? format(new Date(product.supportEndDate), 'MMM dd, yyyy') : 'Perpetual'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-10 rounded-[2.5rem] border-slate-100 shadow-sm">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Stock & Tax Configuration</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Usage Unit</p>
                                            <p className="text-xl font-black text-slate-900">{product.usageUnit || 'Unit'}</p>
                                        </div>
                                        <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Unit Price</p>
                                            <p className="text-xl font-black text-emerald-700">${product.unitPrice.toLocaleString()}</p>
                                        </div>
                                        <div className="p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100">
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Taxable</p>
                                            <p className="text-xl font-black text-indigo-700">{product.taxable ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div className="p-6 bg-amber-50/30 rounded-3xl border border-amber-100">
                                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Tax Logic</p>
                                            <p className="text-xl font-black text-amber-700">{product.tax || 'N/A'}</p>
                                        </div>
                                    </div>
                                </Card>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic flex items-center gap-2">
                                        <FileText className="w-3 h-3" /> Narrative Information
                                    </h3>
                                    <div className="p-8 bg-white border border-slate-100 rounded-3xl text-sm font-medium text-slate-600 italic leading-relaxed">
                                        {product.description || 'No description provided for this product unit.'}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar / Stats */}
                            <div className="space-y-8">
                                <Card className="p-8 rounded-[2.5rem] bg-indigo-900 border-none shadow-2xl shadow-indigo-500/30 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl -ml-12 -mb-12" />

                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-6">Stock Analytics</h3>

                                    <div className="space-y-8 relative z-10">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[11px] font-black uppercase text-indigo-300">Available Stock</span>
                                                <span className="text-2xl font-black tracking-tight">{product.qtyInStock || 0} units</span>
                                            </div>
                                            <div className="w-full h-2 bg-indigo-950/50 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                                                    style={{ width: `${Math.min(((product.qtyInStock || 0) / 100) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-5 bg-white/10 rounded-3xl border border-white/10">
                                                <p className="text-[9px] font-black uppercase text-indigo-300 mb-1.5">Demand</p>
                                                <p className="text-lg font-black">{product.qtyInDemand || 0}</p>
                                            </div>
                                            <div className="p-5 bg-white/10 rounded-3xl border border-white/10">
                                                <p className="text-[9px] font-black uppercase text-indigo-300 mb-1.5">Threshold</p>
                                                <p className="text-lg font-black text-rose-400">{product.reorderLevel || 0}</p>
                                            </div>
                                        </div>

                                        <Button className="w-full h-12 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold gap-2 shadow-xl shadow-indigo-950/50 transition-all border-none">
                                            <ArrowUpDown className="w-4 h-4" /> Adjustment Wizard
                                        </Button>
                                    </div>
                                </Card>

                                <Card className="p-8 rounded-[2.5rem] border-slate-100 shadow-sm space-y-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Record Metadata</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                                                <UserIcon className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Created By</p>
                                                <p className="text-xs font-bold text-slate-800">
                                                    {product.owner?.firstName} {product.owner?.lastName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Last Synced</p>
                                                <p className="text-xs font-bold text-slate-800">
                                                    {format(new Date(product.updatedAt), 'MMM dd, yyyy HH:mm')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator className="bg-slate-50" />
                                    <div className="flex items-center gap-2 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                        <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Internal ID: {product.id.slice(0, 8)}...</span>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="timeline" className="animate-in fade-in slide-in-from-top-2 duration-500">
                        <Card className="p-10 rounded-[2.5rem] border-slate-100 shadow-sm min-h-[400px] flex flex-col">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Audit Trail</h3>

                            {loadingActivities ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-4 items-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-1/2 bg-slate-50 rounded animate-pulse" />
                                                <div className="h-3 w-1/4 bg-slate-50 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-12 ml-6 border-l-2 border-slate-50 pl-10 relative">
                                    {/* Activities */}
                                    {activities.map((activity, idx) => (
                                        <div key={activity.id} className="relative">
                                            <div className="absolute -left-[3.1rem] top-0 w-8 h-8 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-indigo-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-slate-900">{activity.title}</p>
                                                <p className="text-xs font-bold text-slate-500">
                                                    {activity.description || activity.type}
                                                </p>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" /> {format(new Date(activity.createdAt), 'MMM dd, yyyy @ HH:mm')} by {activity.owner?.firstName}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Creation Entry */}
                                    <div className="relative">
                                        <div className="absolute -left-[3.1rem] top-0 w-8 h-8 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-900">Product Entry Registered</p>
                                            <p className="text-xs font-bold text-slate-500">
                                                Product cataloged by {product.owner?.firstName} {product.owner?.lastName}
                                            </p>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" /> {format(new Date(product.createdAt), 'MMM dd, yyyy @ HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
