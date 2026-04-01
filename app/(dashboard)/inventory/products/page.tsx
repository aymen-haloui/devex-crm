'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Package,
  DollarSign,
  Tag,
  ArrowUpDown,
  Box,
  ExternalLink,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import DataTableFilters from '@/components/tables/DataTableFilters';
import MassActionsMenu from '@/components/tables/MassActionsMenu';
import { Product } from '@/types';

export default function ProductsPage() {
  const t = useTranslations('inventory.products');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const url = search ? `/api/products?search=${encodeURIComponent(search)}` : '/api/products';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedRows.size} products?`)) return;
    try {
      const ids = Array.from(selectedRows).join(',');
      const res = await fetch(`/api/products/bulk?ids=${ids}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch (e) {
      console.error('Failed to delete products:', e);
    }
  };

  const productFields = [
    { id: 'name', label: 'Product Name' },
    { id: 'sku', label: 'SKU' },
    { id: 'status', label: 'Status' },
    { id: 'productCategory', label: 'Category' },
    { id: 'unitPrice', label: 'Unit Price' },
  ];

  const getStatusBadge = (status: string) => {
    const norm = status?.toLowerCase() || 'active';
    switch (norm) {
      case 'active':
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase text-[10px] tracking-tight px-2 py-0.5 rounded-md shadow-none">{tCommon('stateLabels.active')}</Badge>;
      case 'inactive':
        return <Badge className="bg-slate-50 text-slate-500 border-slate-100 font-bold uppercase text-[10px] tracking-tight px-2 py-0.5 rounded-md shadow-none">{tCommon('stateLabels.inactive')}</Badge>;
      default:
        return <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold uppercase text-[10px] tracking-tight px-2 py-0.5 rounded-md shadow-none">{status}</Badge>;
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{tCommon('loading')}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50">
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Products</h1>
          <div className="h-6 w-[1px] bg-slate-200" />
          <p className="text-sm text-slate-500 font-medium">{filteredProducts.length} Products</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="h-8 px-4 shadow-sm font-bold text-xs rounded-md" onClick={() => router.push('/inventory/products/new')}>
            Create Product
          </Button>
          <MassActionsMenu entity="Products" selectedCount={selectedRows.size} onAction={(action) => {
            import('@/components/tables/massActionsHandlers').then(mod => {
              const { handleMassAction } = mod;
              handleMassAction(action, 'Products', selectedRows, products as any[]);
            });
            if (action === 'mass_delete') handleBulkDelete();
          }} />
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar Filters */}
        <DataTableFilters
          entity="Products"
          fields={productFields}
          onReset={() => setSearch('')}
          onApply={(f) => console.log('Applying filters:', f)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Compact Toolbar */}
          <div className="h-12 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 w-full max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Find a product..."
                  className="pl-9 h-8 text-[13px] border-none bg-transparent focus-visible:ring-0 shadow-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-10 pl-4 h-10">
                    <Checkbox
                      checked={filteredProducts.length > 0 && selectedRows.size === filteredProducts.length}
                      onCheckedChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                  </TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product Highlights</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">SKU & Category</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Unit Price</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">In Stock</TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</TableHead>
                  <TableHead className="h-10 px-4 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center p-8">
                        <Box className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-[14px] font-bold text-slate-900">No Catalog Items Found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => toggleSelectRow(product.id)}
                    >
                      <TableCell className="pl-4 h-10 p-0" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(product.id)}
                          onCheckedChange={() => toggleSelectRow(product.id)}
                          className="h-3.5 w-3.5 rounded-sm border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex items-center gap-3" onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/inventory/products/${product.id}`);
                        }}>
                          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-bold text-primary hover:underline">{product.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Product ID: {product.id.substring(0, 8)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex flex-col gap-1">
                          <code className="text-[10px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded w-fit">{product.sku}</code>
                          <span className="text-[11px] font-medium text-slate-500">{product.productCategory || 'Uncategorized'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-right">
                        <span className="text-[13px] font-black text-slate-700">${Number(product.unitPrice).toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                          <span className={`text-[12px] font-black ${Number(product.qtyInStock) <= 10 ? 'text-rose-600' : 'text-slate-900'}`}>
                            {product.qtyInStock ?? 0}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Units</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-center">
                        {getStatusBadge(product.status)}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm">
                              <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-100 p-1">
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2" onClick={() => router.push(`/inventory/products/${product.id}`)}>
                              View Specs
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2">
                              Adjust Stock
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="rounded-lg font-bold text-xs py-2 text-rose-600">
                              Deactivate Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedRows.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-slate-900 text-white px-6 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-[13px] font-bold tracking-tight">{selectedRows.size} selected</span>
          <div className="h-4 w-[1px] bg-slate-700 mx-1" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" className="text-white hover:bg-white/10 h-8 px-4 text-[12px] font-bold rounded-full" onClick={() => setSelectedRows(new Set())}>
              Deselect All
            </Button>
            <Button variant="ghost" className="text-rose-400 hover:bg-rose-900/40 h-8 px-4 text-[12px] font-bold rounded-full" onClick={handleBulkDelete}>
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
