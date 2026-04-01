'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Package, FileText, DollarSign } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  sku: string;
  unitPrice: string | number;
  quantity: number | null;
  status: string;
};

type Quote = {
  id: string;
  quoteNumber: string;
  title: string;
  amount: string | number;
  status: string;
};

type Order = {
  id: string;
  orderNumber: string;
  title: string;
  amount: string | number;
  status: string;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  title: string;
  amount: string | number;
  status: string;
};

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'quotes' | 'orders' | 'invoices'>('products');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, quotesRes, ordersRes, invoicesRes, summaryRes] = await Promise.all([
        fetch('/api/products', { credentials: 'include' }),
        fetch('/api/inventory/quotes', { credentials: 'include' }),
        fetch('/api/inventory/sales-orders', { credentials: 'include' }),
        fetch('/api/inventory/invoices', { credentials: 'include' }),
        fetch('/api/inventory/summary', { credentials: 'include' }),
      ]);

      const [productsData, quotesData, ordersData, invoicesData, summaryData] = await Promise.all([
        productsRes.json(),
        quotesRes.json(),
        ordersRes.json(),
        invoicesRes.json(),
        summaryRes.json(),
      ]);

      if (!productsRes.ok || !quotesRes.ok || !ordersRes.ok || !invoicesRes.ok || !summaryRes.ok) {
        setError('Failed to load inventory modules');
        return;
      }

      setProducts(productsData.data || []);
      setQuotes(quotesData.data || []);
      setOrders(ordersData.data || []);
      setInvoices(invoicesData.data || []);
      setSummary(summaryData.data || null);
      setError('');
    } catch (err) {
      setError('Failed to load inventory modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addRecord = async () => {
    if (!name.trim() || !amount.trim()) return;

    try {
      const headers = { 'Content-Type': 'application/json' };

      if (activeTab === 'products') {
        await fetch('/api/products', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({ name, sku: code || `SKU-${Date.now()}`, unitPrice: Number(amount) }),
        });
      }

      if (activeTab === 'quotes') {
        await fetch('/api/inventory/quotes', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({ subject: name, status: 'draft' }),
        });
      }

      if (activeTab === 'orders') {
        await fetch('/api/inventory/sales-orders', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({ subject: name, status: 'created' }),
        });
      }

      if (activeTab === 'invoices') {
        await fetch('/api/inventory/invoices', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({ subject: name, status: 'draft' }),
        });
      }

      setName('');
      setCode('');
      setAmount('');
      await loadData();
    } catch (err) {
      setError('Failed to create record');
    }
  };

  const rows = useMemo(() => {
    if (activeTab === 'products') {
      return products.map((p) => ({ id: p.id, ref: p.sku, title: p.name, amount: Number(p.unitPrice), status: p.status }));
    }
    if (activeTab === 'quotes') {
      return quotes.map((q) => ({ id: q.id, ref: q.quoteNumber, title: q.title, amount: Number(q.amount), status: q.status }));
    }
    if (activeTab === 'orders') {
      return orders.map((o) => ({ id: o.id, ref: o.orderNumber, title: o.title, amount: Number(o.amount), status: o.status }));
    }
    return invoices.map((i) => ({ id: i.id, ref: i.invoiceNumber, title: i.title, amount: Number(i.amount), status: i.status }));
  }, [activeTab, products, quotes, orders, invoices]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory & Finance</h1>
          <p className="text-gray-600 mt-1">Manage products, quotes, and financial documents</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'quotes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Quotes
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'invoices' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Invoices
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.productsCount ?? 0}</div>
            <p className="text-xs text-gray-500 mt-1">Active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Open Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.quotesCount ?? 0}</div>
            <p className="text-xs text-gray-500 mt-1">Total value: ${(summary?.quotesValue ?? 0).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.invoicesCount ?? 0}</div>
            <p className="text-xs text-gray-500 mt-1">Pending: ${(summary?.pendingInvoicesValue ?? 0).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(summary?.ordersValue ?? 0).toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">From confirmed/submitted orders</p>
          </CardContent>
        </Card>
      </div>

      {error ? <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div> : null}

      <Card>
        <CardHeader>
          <CardTitle>Add {activeTab.slice(0, 1).toUpperCase() + activeTab.slice(1, -1)}</CardTitle>
          <CardDescription>Create new {activeTab.slice(0, -1)} records quickly</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder={activeTab === 'products' ? 'Product name' : 'Title'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder={activeTab === 'products' ? 'SKU (optional)' : 'Reference (optional)'}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button onClick={addRecord} className="gap-2">
            <Plus className="w-4 h-4" />
            Add {activeTab.slice(0, -1)}
          </Button>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {activeTab === 'products' ? 'Products & Services' :
                activeTab === 'quotes' ? 'Quotes' :
                  activeTab === 'orders' ? 'Orders' : 'Invoices'}
            </CardTitle>
            <CardDescription>Operational records with real-time persistence</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-sm text-gray-500">Loading data...</div>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div key={row.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{row.title}</p>
                      <p className="text-sm text-gray-500">{row.ref}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${row.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Current value</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                      {row.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Finance Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quotes
            </CardTitle>
            <CardDescription>Generate and manage sales quotes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Create professional quotes, track acceptance, and convert to orders.
            </p>
            <Button variant="outline" className="w-full">
              View Quotes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Invoices
            </CardTitle>
            <CardDescription>Manage billing and invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Create invoices, track payments, and manage your revenue.
            </p>
            <Button variant="outline" className="w-full">
              View Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
