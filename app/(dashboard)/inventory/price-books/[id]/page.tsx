'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Book,
    ArrowLeft,
    Edit2,
    Trash2,
    Calendar,
    User,
    Layout,
    Tag,
    FileText,
    DollarSign,
    Percent,
    Plus,
    Box,
    Search,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { toast } from 'sonner';
import PriceBookForm from '@/components/inventory/PriceBookForm';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

export default function PriceBookDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [id, setId] = useState<string | null>(null);
    const [priceBook, setPriceBook] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingProducts, setIsAddingProducts] = useState(false);
    const [availableProducts, setAvailableProducts] = useState<any[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [listPrices, setListPrices] = useState<Record<string, number>>({});

    useEffect(() => {
        params.then(p => setId(p.id));
    }, [params]);

    const fetchPriceBook = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/inventory/price-books/${id}`);
            const data = await res.json();
            if (data.success) {
                setPriceBook(data.data);
            } else {
                toast.error(data.error || 'Failed to fetch price book details');
                router.push('/inventory/price-books');
            }
        } catch (error) {
            console.error('Error fetching price book:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchPriceBook();
        }
    }, [id]);

    const fetchAvailableProducts = async () => {
        try {
            const res = await fetch(`/api/products?search=${productSearch}`);
            const data = await res.json();
            if (data.success) {
                // Filter out products already in the price book
                const existingIds = priceBook?.products?.map((p: any) => p.productId) || [];
                const available = data.data.filter((p: any) => !existingIds.includes(p.id));
                setAvailableProducts(available);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    useEffect(() => {
        if (isAddingProducts) {
            fetchAvailableProducts();
        }
    }, [isAddingProducts, productSearch, priceBook]);

    const handleUpdate = async (data: any) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/inventory/price-books/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (result.success) {
                toast.success('Price Book updated successfully');
                setPriceBook((prev: any) => ({ ...prev, ...result.data }));
                setIsEditing(false);
            } else {
                toast.error(result.error || 'Failed to update price book');
            }
        } catch (error) {
            console.error('Error updating price book:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this price book?')) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/inventory/price-books/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Price book deleted successfully');
                router.push('/inventory/price-books');
            } else {
                toast.error(data.error || 'Failed to delete price book');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error deleting price book:', error);
            toast.error('An unexpected error occurred');
            setLoading(false);
        }
    };

    const handleAddProducts = async () => {
        if (selectedProducts.length === 0) return;

        try {
            const res = await fetch(`/api/inventory/price-books/${id}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productIds: selectedProducts,
                    listPrices: listPrices
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Products added successfully');
                setIsAddingProducts(false);
                setSelectedProducts([]);
                setListPrices({});
                fetchPriceBook(); // Refresh data
            } else {
                toast.error(data.error || 'Failed to add products');
            }
        } catch (err) {
            toast.error('An error occurred');
        }
    };

    const toggleProductSelection = (productId: string, defaultPrice: number) => {
        setSelectedProducts(prev => {
            if (prev.includes(productId)) {
                const next = prev.filter(p => p !== productId);
                const { [productId]: removed, ...rest } = listPrices;
                setListPrices(rest);
                return next;
            } else {
                setListPrices(pl => ({ ...pl, [productId]: defaultPrice }));
                return [...prev, productId];
            }
        });
    };

    if (loading && !priceBook && !isEditing) {
        return (
            <div className="p-8 max-w-[1400px] mx-auto space-y-8">
                <Skeleton className="h-12 w-1/3 rounded-2xl" />
                <Skeleton className="h-[400px] w-full rounded-3xl" />
            </div>
        );
    }

    if (isEditing && priceBook) {
        return (
            <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                <PriceBookForm
                    initialData={priceBook}
                    onSubmit={handleUpdate}
                    onCancel={() => setIsEditing(false)}
                    loading={loading}
                />
            </div>
        );
    }

    if (!priceBook) return null;

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Top Navigation */}
            <button
                onClick={() => router.push('/inventory/price-books')}
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors group"
            >
                <div className="p-1 rounded-full bg-slate-100 group-hover:bg-indigo-100 transition-colors">
                    <ArrowLeft className="w-3 h-3" />
                </div>
                Back to Price Books
            </button>

            {/* Header Profile Section */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                {/* Decorative Grid Background */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5" />

                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-0.5 shadow-xl shadow-indigo-500/20">
                            <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-[22px] flex items-center justify-center">
                                <Book className="w-8 h-8 text-white drop-shadow-sm" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{priceBook.name}</h1>
                                {priceBook.active ? (
                                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black uppercase text-[10px] tracking-widest px-2.5 py-0.5 rounded-full">Active</Badge>
                                ) : (
                                    <Badge className="bg-slate-50 text-slate-500 border-slate-100 font-black uppercase text-[10px] tracking-widest px-2.5 py-0.5 rounded-full">Inactive</Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                                <span className="flex items-center gap-1.5"><Layout className="w-4 h-4" /> {priceBook.pricingModel === 'flat' ? 'Flat Discount' : 'Differential Pricing'}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <span className="flex items-center gap-1.5"><Tag className="w-4 h-4" /> {priceBook.products?.length || 0} Products</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button
                            onClick={() => setIsEditing(true)}
                            variant="outline"
                            className="flex-1 md:flex-none h-12 rounded-xl border-slate-200 font-bold gap-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all"
                        >
                            <Edit2 className="w-4 h-4" /> Edit Focus
                        </Button>
                        <Button
                            onClick={handleDelete}
                            variant="outline"
                            className="h-12 w-12 p-0 rounded-xl border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all flex-shrink-0"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-white p-1 rounded-2xl h-auto border border-slate-100 shadow-sm gap-1 inline-flex w-full md:w-auto">
                    <TabsTrigger
                        value="overview"
                        className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 transition-all"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="products"
                        className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 transition-all"
                    >
                        Products ({priceBook.products?.length || 0})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Properties Card */}
                            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-indigo-50 rounded-xl">
                                        <Book className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Book Properties</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Book Name</p>
                                        <p className="text-sm font-bold text-slate-900">{priceBook.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing Model</p>
                                        <Badge variant="outline" className="bg-indigo-50/30 text-indigo-600 border-indigo-100 font-bold uppercase text-[9px] px-2 py-0.5 rounded-lg">
                                            {priceBook.pricingModel}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Discount Rules Card */}
                            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-emerald-50 rounded-xl">
                                        <Percent className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Discount Rules</h3>
                                </div>

                                {priceBook.discountRules && priceBook.discountRules.length > 0 ? (
                                    <div className="rounded-2xl border border-slate-100 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-slate-50/50">
                                                <TableRow className="hover:bg-transparent border-slate-100">
                                                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">From</TableHead>
                                                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">To</TableHead>
                                                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Discount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {priceBook.discountRules.map((rule: any, i: number) => (
                                                    <TableRow key={i} className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                                                        <TableCell className="font-bold text-slate-600">{rule.fromRange}</TableCell>
                                                        <TableCell className="font-bold text-slate-600">{rule.toRange}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-xs px-2 py-0.5 rounded-lg">
                                                                {rule.discount}%
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <p className="text-sm font-bold text-slate-400 italic">No discount rules defined.</p>
                                )}
                            </div>

                            {/* Description Card */}
                            {priceBook.description && (
                                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                                        <div className="p-2 bg-amber-50 rounded-xl">
                                            <FileText className="w-4 h-4 text-amber-500" />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Description</h3>
                                    </div>
                                    <p className="text-slate-600 font-medium leading-relaxed">{priceBook.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Metadata */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-4">
                                    Metadata
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-slate-50 rounded-xl mt-0.5">
                                            <User className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Owner</p>
                                            <p className="text-sm font-bold text-slate-900">
                                                {priceBook.owner?.firstName} {priceBook.owner?.lastName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-slate-50 rounded-xl mt-0.5">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Created At</p>
                                            <p className="text-sm font-bold text-slate-900">
                                                {format(new Date(priceBook.createdAt), 'MMM d, yyyy')}
                                            </p>
                                            <p className="text-xs font-bold text-slate-400 mt-0.5">
                                                {format(new Date(priceBook.createdAt), 'h:mm a')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-slate-50 rounded-xl mt-0.5">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Modified</p>
                                            <p className="text-sm font-bold text-slate-900">
                                                {format(new Date(priceBook.updatedAt), 'MMM d, yyyy')}
                                            </p>
                                            <p className="text-xs font-bold text-slate-400 mt-0.5">
                                                {format(new Date(priceBook.updatedAt), 'h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="products" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-50 rounded-xl">
                                    <Box className="w-4 h-4 text-indigo-500" />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Associated Products</h3>
                            </div>

                            <Dialog open={isAddingProducts} onOpenChange={setIsAddingProducts}>
                                <DialogTrigger asChild>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-lg shadow-indigo-500/20 rounded-xl gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        <Plus className="w-4 h-4" /> Add Products
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[700px] rounded-3xl border-slate-100 p-0 overflow-hidden">
                                    <DialogHeader className="p-8 pb-4 bg-slate-50/50">
                                        <DialogTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                            <Box className="w-5 h-5 text-indigo-500" /> Add Products to Price Book
                                        </DialogTitle>
                                        <DialogDescription className="font-bold text-slate-500 pt-2">
                                            Select products and define their specific list prices for this price book.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="p-8 space-y-6">
                                        <div className="relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <Input
                                                placeholder="Search available products..."
                                                className="pl-11 h-12 bg-slate-50/50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-2xl font-bold placeholder:text-slate-400"
                                                value={productSearch}
                                                onChange={(e) => setProductSearch(e.target.value)}
                                            />
                                        </div>

                                        <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                                            <Table>
                                                <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                                                    <TableRow className="hover:bg-transparent border-slate-100">
                                                        <TableHead className="w-[50px] font-black text-slate-400"></TableHead>
                                                        <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Product</TableHead>
                                                        <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Standard Price</TableHead>
                                                        <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-right w-[150px]">List Price Override</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {availableProducts.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="text-center py-8 text-slate-400 font-bold italic">
                                                                No available products found.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        availableProducts.map((p) => (
                                                            <TableRow key={p.id} className="hover:bg-slate-50/50 border-slate-100">
                                                                <TableCell>
                                                                    <div
                                                                        className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${selectedProducts.includes(p.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'}`}
                                                                        onClick={() => toggleProductSelection(p.id, Number(p.unitPrice))}
                                                                    >
                                                                        {selectedProducts.includes(p.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="font-bold text-slate-700">{p.name}</div>
                                                                    <div className="text-[10px] font-bold text-slate-400">{p.sku}</div>
                                                                </TableCell>
                                                                <TableCell className="text-right font-black text-slate-500">
                                                                    ${Number(p.unitPrice).toLocaleString()}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        disabled={!selectedProducts.includes(p.id)}
                                                                        className={`h-9 font-bold text-right rounded-xl focus:ring-indigo-500/20 ${selectedProducts.includes(p.id) ? 'bg-white border-indigo-200' : 'bg-slate-50 border-transparent text-slate-300'}`}
                                                                        value={listPrices[p.id] !== undefined ? listPrices[p.id] : ''}
                                                                        onChange={(e) => setListPrices(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100 flex-row justify-between items-center sm:justify-between">
                                        <p className="text-sm font-bold text-slate-500">{selectedProducts.length} selected</p>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" onClick={() => setIsAddingProducts(false)} className="rounded-xl font-bold text-slate-600">Cancel</Button>
                                            <Button
                                                onClick={handleAddProducts}
                                                disabled={selectedProducts.length === 0}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 font-bold"
                                            >
                                                Add {selectedProducts.length} Products
                                            </Button>
                                        </div>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {priceBook.products && priceBook.products.length > 0 ? (
                            <div className="rounded-2xl border border-slate-100 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="hover:bg-transparent border-slate-100">
                                            <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest pl-6">Product Code</TableHead>
                                            <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Product Name</TableHead>
                                            <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Standard Unit Price</TableHead>
                                            <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-right pr-6">List Price</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {priceBook.products.map((p: any) => (
                                            <TableRow key={p.id} className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                                                <TableCell className="pl-6 py-4">
                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 rounded font-black uppercase text-slate-400 border-slate-200">
                                                        {p.product?.sku}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-bold text-slate-700">{p.product?.name}</TableCell>
                                                <TableCell className="text-right text-sm font-black text-slate-400 line-through">
                                                    ${p.product?.unitPrice?.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex items-center justify-end gap-1 font-black text-indigo-600 text-sm">
                                                        <DollarSign className="w-3.5 h-3.5" />
                                                        {p.listPrice?.toLocaleString()}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-12 text-center flex flex-col items-center">
                                <Box className="w-10 h-10 text-slate-200 mb-3" />
                                <h4 className="text-lg font-black text-slate-700">No Products Included</h4>
                                <p className="text-sm font-bold text-slate-400 mt-1 max-w-sm">Products added to this price book will use the overridden List Price.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
