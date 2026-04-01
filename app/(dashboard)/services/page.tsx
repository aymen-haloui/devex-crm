'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ServiceList from '@/components/services/ServiceList';
import ServiceForm from '@/components/services/ServiceForm';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  price: number | bigint;
  duration?: string;
  location?: string;
  description?: string;
  isActive: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/services?${params.toString()}`);
      const json = await res.json();
      if (json.success) setServices(json.data);
    } catch (error) {
      console.error('Fetch services failed', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSubmit = async (data: any) => {
    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editingService ? 'Service updated' : 'Service created');
        setIsEditing(false);
        setEditingService(null);
        fetchServices();
      } else {
        toast.error(json.error || 'Request failed');
      }
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Service deleted');
        fetchServices();
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (isEditing) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ServiceForm
          initialData={editingService}
          onSubmit={handleSubmit}
          onCancel={() => { setIsEditing(false); setEditingService(null); }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Services</h1>
          <p className="text-sm text-slate-500 font-medium">{services.length} Total Services</p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="h-8 px-4 shadow-sm font-bold text-xs rounded-md">
          <Plus className="w-4 h-4 mr-1" /> Create Service
        </Button>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-white p-6 overflow-hidden">
        <div className="h-12 px-4 border-b border-slate-100 flex items-center justify-between shrink-0 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search services..."
              className="pl-9 h-8 text-[13px] border-none bg-slate-50 focus-visible:ring-0 shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-500 font-medium italic animate-pulse">
              Loading services...
            </div>
          ) : (
            <ServiceList
              services={services}
              onEdit={(s) => { setEditingService(s); setIsEditing(true); }}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
