'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Layers, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProjectList from '@/components/projects/ProjectList';
import ProjectForm from '@/components/projects/ProjectForm';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  status: string;
  startDate?: string;
  endDate?: string;
  budget: number | bigint;
  revenue: number | bigint;
  owner: {
    firstName: string;
    lastName: string;
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/projects?${params.toString()}`);
      const json = await res.json();
      if (json.success) setProjects(json.data);
    } catch (error) {
      console.error('Fetch projects failed', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSubmit = async (data: any) => {
    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editingProject ? 'Project updated' : 'Project created');
        setIsEditing(false);
        setEditingProject(null);
        fetchProjects();
      } else {
        toast.error(json.error || 'Request failed');
      }
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Project deleted');
        fetchProjects();
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (isEditing) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <ProjectForm
          initialData={editingProject}
          onSubmit={handleSubmit}
          onCancel={() => { setIsEditing(false); setEditingProject(null); }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Projects</h1>
            <p className="text-[12px] text-slate-500 font-medium">Manage timelines, budgets, and delivery</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 border-slate-200 text-slate-600">
            <LayoutGrid className="w-4 h-4 mr-1" /> Board
          </Button>
          <Button onClick={() => setIsEditing(true)} className="h-8 px-4 shadow-sm font-bold text-xs rounded-md bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-1" /> New Project
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-white p-6 overflow-hidden">
        <div className="h-12 px-4 border-b border-slate-100 flex items-center justify-between shrink-0 mb-6">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search projects..."
              className="pl-9 h-9 text-[13px] border-none bg-slate-50 focus-visible:ring-indigo-500 shadow-none rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-500 font-medium italic animate-pulse">
              Loading projects...
            </div>
          ) : (
            <ProjectList
              projects={projects}
              onEdit={(p) => { setEditingProject(p); setIsEditing(true); }}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
