'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Folder,
  Plus,
  Upload,
  Video,
  Search,
  ChevronDown,
  MoreHorizontal,
  LayoutGrid,
  List,
  AlignJustify,
  ArrowUpDown,
  FileText,
  FileCode,
  FileImage,
  FileAudio,
  FileVideo,
  ExternalLink,
  ChevronRight,
  Monitor,
  Mic,
  FolderOpen,
  Shield,
  X,
  Settings,
  Pencil,
  Info,
  Lock,
  Users,
  Loader2,
  Trash2,
  Download,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

export default function DocumentsPage() {
  const t = useTranslations('documents');
  const tCommon = useTranslations('common');
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeFolderName, setActiveFolderName] = useState(t('myDocuments'));
  const [viewMode, setViewMode] = useState<'thumbnail' | 'list' | 'compact'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewContext, setViewContext] = useState<'browse' | 'manage'>('browse');
  const [activeManageTab, setActiveManageTab] = useState('Details');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [foldersRes, docsRes] = await Promise.all([
        fetch('/api/documents/folders').then(r => r.json()),
        fetch(`/api/documents${activeFolderId ? `?folderId=${activeFolderId}` : ''}`).then(r => r.json())
      ]);

      if (foldersRes.success) setFolders(foldersRes.data);
      if (docsRes.success) setDocuments(docsRes.data);
    } catch (error) {
      console.error('Error fetching documents data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeFolderId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateFolder = async (name: string, isTeamFolder = false) => {
    try {
      const res = await fetch('/api/documents/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, isTeamFolder })
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    // In a real app, we'd have a DELETE endpoint. 
    // For now, we'll assume it's implemented or we'll mock the UI update.
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const manageTabs = [
    { id: 'Details', label: t('folderDetails'), icon: Folder },
    { id: 'Members', label: t('members'), icon: Users },
    { id: 'Settings', label: t('settings'), icon: Settings },
    { id: 'Trash', label: t('trash'), icon: Trash2 },
    { id: 'Shared', label: t('sharedItems'), icon: Share2 },
  ];

  const myFolders = folders.filter(f => !f.isTeamFolder);
  const teamFolders = folders.filter(f => f.isTeamFolder);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-[15px] font-semibold text-slate-800 px-1">
            <div className="w-5 h-5 flex items-center justify-center rtl:rotate-180">
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
            {t('title')}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {/* My Folders Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest rtl:flex-row-reverse">
              <ChevronDown className="w-3 h-3 rtl:-rotate-90" />
              {t('myFolders')}
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                onClick={() => {
                  setActiveFolderId(null);
                  setActiveFolderName(t('myDocuments'));
                  setViewContext('browse');
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium transition-all rounded-lg text-left",
                  !activeFolderId && viewContext === 'browse'
                    ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50"
                    : "text-slate-600 hover:bg-slate-100/80"
                )}
              >
                {!activeFolderId ? <FolderOpen className="w-4 h-4 text-indigo-500" /> : <Folder className="w-4 h-4 text-slate-400" />}
                {t('myDocuments')}
              </button>
              {myFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    setActiveFolderId(folder.id);
                    setActiveFolderName(folder.name);
                    setViewContext('browse');
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium transition-all rounded-lg text-left",
                    activeFolderId === folder.id && viewContext === 'browse'
                      ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50"
                      : "text-slate-600 hover:bg-slate-100/80"
                  )}
                >
                  {activeFolderId === folder.id ? <FolderOpen className="w-4 h-4 text-indigo-500" /> : <Folder className="w-4 h-4 text-slate-400" />}
                  {folder.name}
                </button>
              ))}
            </div>
          </div>

          {/* Team Folders Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest rtl:flex-row-reverse">
              <ChevronDown className="w-3 h-3 rtl:-rotate-90" />
              {t('teamFolders')}
            </div>
            <div className="space-y-0.5 mt-1">
              {teamFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    setActiveFolderId(folder.id);
                    setActiveFolderName(folder.name);
                    setViewContext('browse');
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium transition-all rounded-lg text-left",
                    activeFolderId === folder.id && viewContext === 'browse'
                      ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50"
                      : "text-slate-600 hover:bg-slate-100/80"
                  )}
                >
                  {activeFolderId === folder.id ? <FolderOpen className="w-4 h-4 text-indigo-500" /> : <Folder className="w-4 h-4 text-slate-400" />}
                  {folder.name}
                </button>
              ))}
              {teamFolders.length === 0 && (
                <div className="px-3 py-4 text-center">
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                    {t('noTeamFolders')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-200 bg-white">
          <Button variant="ghost" className="w-full justify-start text-[12px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 h-9 rounded-lg rtl:flex-row-reverse">
            Open WorkDrive <ExternalLink className="w-3.5 h-3.5 ml-auto rtl:mr-auto rtl:ml-0 text-slate-400 rtl:rotate-180" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header toolbar */}
        {viewContext === 'browse' ? (
          <div className="h-14 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 leading-none">{activeFolderName}</h2>
              <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-7 px-2 gap-1 text-slate-500 font-bold hover:bg-slate-100 rounded-md text-[13px] rtl:flex-row-reverse">
                    {t('manage')} <ChevronDown className="w-4 h-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 rounded-xl shadow-2xl border-slate-200 p-1.5">
                  <DropdownMenuItem onClick={() => { setViewContext('manage'); setActiveManageTab('Details'); }} className="text-[13px] py-2.5 rounded-lg gap-3 font-medium rtl:flex-row-reverse">
                    <Info className="w-4 h-4 text-slate-400" /> {t('folderDetails')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setViewContext('manage'); setActiveManageTab('Members'); }} className="text-[13px] py-2.5 rounded-lg gap-3 font-medium rtl:flex-row-reverse">
                    <Users className="w-4 h-4 text-slate-400" /> {t('members')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setViewContext('manage'); setActiveManageTab('Settings'); }} className="text-[13px] py-2.5 rounded-lg gap-3 font-medium rtl:flex-row-reverse">
                    <Settings className="w-4 h-4 text-slate-400" /> {t('settings')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setViewContext('manage'); setActiveManageTab('Shared'); }} className="text-[13px] py-2.5 rounded-lg gap-3 font-medium rtl:flex-row-reverse">
                    <Share2 className="w-4 h-4 text-slate-400" /> {t('sharedItems')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="opacity-50" />
                  <DropdownMenuItem onClick={() => { setViewContext('manage'); setActiveManageTab('Trash'); }} className="text-[13px] py-2.5 rounded-lg gap-3 font-bold text-rose-600 focus:text-rose-600 focus:bg-rose-50 rtl:flex-row-reverse">
                    <Trash2 className="w-4 h-4" /> {t('trash')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors rtl:left-auto rtl:right-3">
                  <Search className="w-4 h-4" />
                </div>
                <Input
                  placeholder={t('searchPlaceholder')}
                  className="h-9 w-64 pl-9 rtl:pl-3 rtl:pr-9 bg-slate-50 border-slate-200 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-[13px] rounded-lg font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Record Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 px-3 gap-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-[13px] font-bold shadow-sm rounded-lg rtl:flex-row-reverse">
                    {t('record')} <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-2xl border-slate-200 p-1.5 space-y-0.5">
                  <DropdownMenuItem className="text-[13px] cursor-pointer py-2.5 font-medium focus:bg-indigo-50 focus:text-indigo-700 rounded-lg gap-3 rtl:flex-row-reverse">
                    <Monitor className="w-4 h-4 text-slate-400" /> {t('screen')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-[13px] cursor-pointer py-2.5 font-medium focus:bg-indigo-50 focus:text-indigo-700 rounded-lg gap-3 rtl:flex-row-reverse">
                    <Video className="w-4 h-4 text-slate-400" /> {t('video')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-[13px] cursor-pointer py-2.5 font-medium focus:bg-indigo-50 focus:text-indigo-700 rounded-lg gap-3 rtl:flex-row-reverse">
                    <Mic className="w-4 h-4 text-slate-400" /> {t('audio')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* New Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="h-9 px-4 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold shadow-lg shadow-indigo-200/50 rounded-lg transition-all active:scale-95 rtl:flex-row-reverse">
                    <Plus className="w-4 h-4 stroke-[3.5px]" /> {t('new')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-2xl border-slate-200 p-2 space-y-0.5">
                  <DropdownMenuItem onClick={() => handleCreateFolder('New Folder')} className="text-[13px] cursor-pointer py-2.5 font-bold rounded-lg gap-3 hover:bg-amber-50 group rtl:flex-row-reverse">
                    <Folder className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" /> {t('folder')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCreateFolder('New Project Folder', true)} className="text-[13px] cursor-pointer py-2.5 font-bold rounded-lg gap-3 hover:bg-indigo-50 group rtl:flex-row-reverse">
                    <Shield className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" /> {t('teamFolder')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="opacity-50 mx-1" />
                  <DropdownMenuItem className="text-[13px] cursor-pointer py-2.5 font-bold rounded-lg gap-3 hover:bg-blue-50 rtl:flex-row-reverse">
                    <FileText className="w-4 h-4 text-blue-500" /> {t('documents')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-[13px] cursor-pointer py-2.5 font-bold rounded-lg gap-3 hover:bg-emerald-50 rtl:flex-row-reverse">
                    <AlignJustify className="w-4 h-4 text-emerald-500" /> {t('spreadsheets')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-[13px] cursor-pointer py-2.5 font-bold rounded-lg gap-3 hover:bg-rose-50 rtl:flex-row-reverse">
                    <Plus className="w-4 h-4 text-slate-400" /> {t('otherFileTypes')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort/Filter/View */}
              <div className="flex items-center gap-1 border-l border-slate-200 pl-3 ml-1 rtl:border-l-0 rtl:border-r rtl:pl-1 rtl:ml-0 rtl:pr-3 rtl:mr-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900 transition-all rounded-lg">
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900 transition-all rounded-lg">
                      {viewMode === 'thumbnail' ? <LayoutGrid className="w-4 h-4" /> : viewMode === 'list' ? <List className="w-4 h-4" /> : <AlignJustify className="w-4 h-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-2xl border-slate-200 p-1.5">
                    <DropdownMenuItem onClick={() => setViewMode('thumbnail')} className={cn("text-[13px] py-2.5 rounded-lg gap-3 font-medium rtl:flex-row-reverse", viewMode === 'thumbnail' && "bg-slate-50 text-indigo-600")}>
                      <LayoutGrid className="w-4 h-4" /> {t('gridView')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode('list')} className={cn("text-[13px] py-2.5 rounded-lg gap-3 font-medium rtl:flex-row-reverse", viewMode === 'list' && "bg-slate-50 text-indigo-600")}>
                      <List className="w-4 h-4" /> {t('listView')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode('compact')} className={cn("text-[13px] py-2.5 rounded-lg gap-3 font-medium rtl:flex-row-reverse", viewMode === 'compact' && "bg-slate-50 text-indigo-600")}>
                      <AlignJustify className="w-4 h-4" /> {t('compactView')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-14 border-b border-slate-200 px-6 flex items-center shrink-0 bg-white sticky top-0 z-10 transition-all">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewContext('browse')}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100 shadow-sm">
                  <Folder className="w-4 h-4 fill-current" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">{activeFolderName}</h2>
                    <Pencil className="w-3 h-3 text-slate-300 hover:text-indigo-500 cursor-pointer transition-colors" />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-500 uppercase tracking-wider rtl:flex-row-reverse">
                      <Lock className="w-2.5 h-2.5 mr-0.5 rtl:mr-0 rtl:ml-0.5" /> {t('private')}
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
                      {t('active')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1" />
            <Button
              variant="ghost"
              onClick={() => setViewContext('browse')}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-auto relative bg-white">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : viewContext === 'browse' ? (
            <div className="h-full flex flex-col">
              {documents.length === 0 && myFolders.length === 0 && !activeFolderId ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="mb-8 relative">
                    <div className="w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100 shadow-sm relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                      <div className="w-20 h-20 border-2 border-amber-200 rounded-xl flex items-center justify-center bg-white shadow-inner relative z-10">
                        <Plus className="w-8 h-8 text-amber-500 stroke-[3px]" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-[17px] font-bold text-slate-900 mb-3">{t('noItems')}</h3>
                  <p className="text-[14px] text-slate-500 mb-8 max-w-lg leading-relaxed font-medium">
                    {t('noItemsDesc')}
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-md z-20">
                      <tr>
                        <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-left rtl:text-right">{t('name')}</th>
                        <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-left rtl:text-right">{t('owner')}</th>
                        <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-left rtl:text-right">{t('size')}</th>
                        <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-left rtl:text-right">{t('modified')}</th>
                        <th className="px-6 py-3 border-b border-slate-100 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {/* Render Subfolders if in root or parent folder */}
                      {!activeFolderId && myFolders.map(folder => (
                        <tr key={folder.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                          <td className="px-6 py-4 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100 group-hover:scale-105 transition-transform shadow-sm">
                                <Folder className="w-5 h-5 fill-current" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-left rtl:text-right">{folder.name}</span>
                                <span className="text-[12px] text-slate-400 font-medium text-left rtl:text-right">{t('folder')}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50 text-[13px] text-slate-500 font-medium text-left rtl:text-right">{t('me')}</td>
                          <td className="px-6 py-4 border-b border-slate-50 text-[13px] text-slate-500 font-medium text-left rtl:text-right">-</td>
                          <td className="px-6 py-4 border-b border-slate-50 text-[13px] text-slate-500 font-medium text-left rtl:text-right">{format(new Date(folder.createdAt), 'MMM d, yyyy')}</td>
                          <td className="px-6 py-4 border-b border-slate-50 text-right rtl:text-left">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}

                      {/* Render Documents */}
                      {documents.map(doc => (
                        <tr key={doc.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100 group-hover:scale-105 transition-transform shadow-sm">
                                {doc.extension === 'pdf' ? <FileText className="w-5 h-5" /> : doc.type?.includes('image') ? <FileImage className="w-5 h-5" /> : <FileCode className="w-5 h-5" />}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-left rtl:text-right">{doc.name}</span>
                                <span className="text-[12px] text-slate-400 font-medium text-left rtl:text-right">.{doc.extension || 'file'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50 text-[13px] text-slate-500 font-medium text-left rtl:text-right">
                            {doc.owner?.firstName} {doc.owner?.lastName}
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50 text-[13px] text-slate-500 font-medium text-left rtl:text-right">
                            {(doc.sizeBytes / 1024).toFixed(1)} KB
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50 text-[13px] text-slate-500 font-medium text-left rtl:text-right">
                            {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50 text-right rtl:text-left">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-all">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-2xl border-slate-200">
                                <DropdownMenuItem className="text-[13px] py-2.5 rounded-lg gap-3 font-medium rtl:flex-row-reverse">
                                  <Download className="w-4 h-4 text-slate-400" /> {t('download')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="opacity-50" />
                                <DropdownMenuItem onClick={() => handleDeleteDocument(doc.id)} className="text-[13px] py-2.5 rounded-lg gap-3 font-bold text-rose-600 focus:text-rose-600 focus:bg-rose-50 rtl:flex-row-reverse">
                                  <Trash2 className="w-4 h-4" /> {t('delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col bg-white">
              {/* Manage Tabs */}
              <div className="flex items-center border-b border-slate-200 px-6">
                {manageTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveManageTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-4 text-[13px] font-semibold transition-all relative",
                      activeManageTab === tab.id
                        ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    <tab.icon className={cn("w-4 h-4", activeManageTab === tab.id ? "text-indigo-600" : "text-slate-400")} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-auto p-8">
                {activeManageTab === 'Details' && (
                  <div className="max-w-5xl mx-auto flex gap-12 animate-in fade-in slide-in-from-right-4 duration-500">
                    {/* Left Column: Information */}
                    <div className="flex-1 space-y-8">
                      <div className="grid grid-cols-[140px_1fr] items-baseline gap-y-7">
                        <div className="text-[13px] text-slate-400 font-bold uppercase tracking-wider text-left rtl:text-right">{t('name')}</div>
                        <div className="flex items-center gap-3 group rtl:flex-row-reverse">
                          <span className="text-[16px] font-bold text-slate-900 leading-tight text-left rtl:text-right">{activeFolderName}</span>
                          <button className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-indigo-100 transition-all">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[13px] text-slate-400 font-bold uppercase tracking-wider text-left rtl:text-right">{t('description')}</div>
                        <div className="flex items-center gap-3 group rtl:flex-row-reverse">
                          <span className="text-[14px] text-slate-500 font-medium italic select-none text-left rtl:text-right">{t('noDescription')}</span>
                          <button className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-indigo-100 transition-all">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[13px] text-slate-400 font-bold uppercase tracking-wider text-left rtl:text-right">{t('type')}</div>
                        <div className="flex items-center gap-2 rtl:flex-row-reverse">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200" />
                          <span className="text-[14px] font-bold text-slate-800 text-left rtl:text-right">{t('privateTeamFolder')}</span>
                        </div>

                        <div className="text-[13px] text-slate-400 font-bold uppercase tracking-wider text-left rtl:text-right">{t('createdOn')}</div>
                        <div className="text-[14px] font-bold text-slate-700 text-left rtl:text-right">Feb 28, 2026, 12:00 AM</div>

                        <div className="text-[13px] text-slate-400 font-bold uppercase tracking-wider text-left rtl:text-right">{t('totalItems')}</div>
                        <div className="text-[14px] font-bold text-slate-700 text-left rtl:text-right">{documents.length} {t('files')}, 0 {t('folders')}</div>

                        <div className="text-[13px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2 text-left rtl:text-right rtl:flex-row-reverse">
                          {t('physicalSize')} <Info className="w-3.5 h-3.5 text-slate-300 cursor-help" />
                        </div>
                        <div className="text-[14px] font-bold text-slate-700 text-left rtl:text-right">
                          {(documents.reduce((acc, d) => acc + d.sizeBytes, 0) / 1024).toFixed(1)} KB
                        </div>

                        <div className="text-[13px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2 text-left rtl:text-right rtl:flex-row-reverse">
                          {t('storageUsed')} <Info className="w-3.5 h-3.5 text-slate-300 cursor-help" />
                        </div>
                        <div className="text-[14px] font-bold text-slate-700 text-left rtl:text-right">
                          {(documents.reduce((acc, d) => acc + d.sizeBytes, 0) / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Members Summary */}
                    <div className="w-80 space-y-6">
                      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6 rtl:flex-row-reverse">
                          <h4 className="text-[15px] font-bold text-slate-800 text-left rtl:text-right">
                            {t('membersGroups', { count: 1, groupCount: 0 })}
                          </h4>
                          <button onClick={() => setActiveManageTab('Members')} className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">{t('viewAll')}</button>
                        </div>
                        <div className="flex items-center -space-x-3 mb-4 rtl:space-x-reverse">
                          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-md ring-4 ring-indigo-50">AU</div>
                          <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 border-2 border-white shadow-sm ring-4 ring-slate-50">
                            <Plus className="w-5 h-5" />
                          </div>
                        </div>
                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed text-left rtl:text-right">
                          {t('adminInfo')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeManageTab === 'Members' && (
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center justify-between mb-4 rtl:flex-row-reverse">
                      <div className="text-[14px] font-bold text-slate-700 text-left rtl:text-right">
                        {t('membersGroups', { count: 1, groupCount: 1 })}
                      </div>
                      <div className="flex items-center gap-3 rtl:flex-row-reverse">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-8 px-3 gap-2 border-slate-200 text-[12px] font-medium rtl:flex-row-reverse">
                              <AlignJustify className="w-3.5 h-3.5" /> {t('all')} <ChevronDown className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                        </DropdownMenu>
                        <div className="relative group">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 rtl:left-auto rtl:right-2.5" />
                          <Input placeholder={tCommon('search')} className="h-8 w-48 pl-8 rtl:pl-3 rtl:pr-8 text-[12px] bg-slate-50/50" />
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      <table className="w-full text-left text-[13px]">
                        <tbody className="divide-y divide-slate-100">
                          <tr className="hover:bg-slate-50/50">
                            <td className="py-4 px-5 w-10">
                              <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">SM</div>
                            </td>
                            <td className="py-4 px-3">
                              <div className="font-bold text-slate-900">sur le monde</div>
                              <div className="text-slate-500 text-[12px]">halou.zoho@gmail.com</div>
                            </td>
                            <td className="py-4 px-5 text-right rtl:text-left">
                              <div className="flex items-center justify-end rtl:justify-start gap-2 text-slate-500">
                                <Shield className="w-3.5 h-3.5" />
                                <span className="font-medium">{t('admin')}</span>
                              </div>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50/50">
                            <td className="py-4 px-5 w-10">
                              <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200"><Plus className="w-4 h-4" /></div>
                            </td>
                            <td className="py-4 px-3">
                              <div className="font-bold text-slate-900">CEO - And Subordinates</div>
                              <div className="text-slate-500 text-[12px]">App Group (Devex CRM), 1 member</div>
                            </td>
                            <td className="py-4 px-5 text-right rtl:text-left">
                              <div className="text-slate-500 font-medium">{t('viewer')}</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeManageTab === 'Settings' && (
                  <div className="max-w-3xl mx-auto space-y-10">
                    <section className="space-y-6">
                      <div className="flex items-start justify-between group rtl:flex-row-reverse">
                        <div className="space-y-1 text-left rtl:text-right">
                          <h4 className="text-[14px] font-bold text-slate-900">{t('settingsOptions.allowEmailUpload')}</h4>
                          <p className="text-[13px] text-slate-500 max-w-xl">
                            {t('settingsOptions.allowEmailUploadDesc')}
                          </p>
                        </div>
                        <div className="w-10 h-5 bg-slate-200 rounded-full relative p-0.5 cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                      </div>

                      <div className="flex items-start justify-between rtl:flex-row-reverse">
                        <div className="space-y-1 text-left rtl:text-right">
                          <h4 className="text-[14px] font-bold text-slate-900">{t('settingsOptions.allowExternalSharing')}</h4>
                          <p className="text-[13px] text-slate-500 max-w-xl">
                            {t('settingsOptions.allowExternalSharingDesc')}
                          </p>
                        </div>
                        <div className="w-10 h-5 bg-emerald-500 rounded-full relative p-0.5 cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full translate-x-5 rtl:translate-x-0 transition-transform shadow-sm" />
                        </div>
                      </div>

                      <div className="flex items-start justify-between rtl:flex-row-reverse">
                        <div className="space-y-1 text-left rtl:text-right">
                          <h4 className="text-[14px] font-bold text-slate-900">{t('settingsOptions.showDownloadPrint')}</h4>
                          <p className="text-[13px] text-slate-500 max-w-xl">
                            {t('settingsOptions.showDownloadPrintDesc')}
                          </p>
                          <p className="text-[12px] text-slate-400 italic mt-2">
                            {t('settingsOptions.showDownloadPrintNote')}
                          </p>
                          <button className="text-[12px] text-indigo-600 font-medium hover:underline">{t('settingsOptions.learnMoreDownload')}</button>
                        </div>
                        <div className="w-10 h-5 bg-emerald-500 rounded-full relative p-0.5 cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full translate-x-5 rtl:translate-x-0 transition-transform shadow-sm" />
                        </div>
                      </div>

                      <div className="flex items-start justify-between rtl:flex-row-reverse">
                        <div className="space-y-1 text-left rtl:text-right">
                          <h4 className="text-[14px] font-bold text-slate-900">{t('settingsOptions.smartSuggestions')}</h4>
                          <p className="text-[13px] text-slate-500 max-w-xl">
                            {t('settingsOptions.smartSuggestionsDesc')}
                          </p>
                          <button className="text-[12px] text-indigo-600 font-medium hover:underline">{t('settingsOptions.learnMoreSuggestions')}</button>
                        </div>
                        <div className="w-10 h-5 bg-emerald-500 rounded-full relative p-0.5 cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full translate-x-5 rtl:translate-x-0 transition-transform shadow-sm" />
                        </div>
                      </div>

                      <div className="flex items-start justify-between rtl:flex-row-reverse">
                        <div className="space-y-1 text-left rtl:text-right">
                          <h4 className="text-[14px] font-bold text-slate-900">{t('settingsOptions.convertToModern')}</h4>
                          <p className="text-[13px] text-slate-500 max-w-xl">
                            {t('settingsOptions.convertToModernDesc')}
                          </p>
                          <button className="text-[12px] text-indigo-600 font-medium hover:underline">{t('settingsOptions.learnMoreConversion')}</button>
                        </div>
                        <div className="w-10 h-5 bg-slate-200 rounded-full relative p-0.5 cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {activeManageTab === 'Trash' && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-24 h-24 mb-6 relative">
                      <div className="w-full h-full bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center text-slate-300">
                        <List className="w-12 h-12" />
                      </div>
                    </div>
                    <h4 className="text-[16px] font-bold text-slate-900 mb-2">{t('trashWelcome')}</h4>
                    <p className="text-[13px] text-slate-500 max-w-sm font-medium">
                      {t('trashDesc')}
                    </p>
                  </div>
                )}

                {activeManageTab === 'Shared' && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="flex items-center gap-3 mb-10 absolute top-8 left-8 rtl:left-auto rtl:right-8 rtl:flex-row-reverse">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="h-8 px-3 gap-2 border-slate-200 text-[12px] font-medium bg-white rtl:flex-row-reverse">
                            <Plus className="w-3.5 h-3.5" /> {t('directSharingExternal')} <ChevronDown className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="h-8 px-3 gap-2 border-slate-200 text-[12px] font-medium bg-white rtl:flex-row-reverse">
                            {t('allFileTypes')} <ChevronDown className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                      </DropdownMenu>
                    </div>

                    <div className="w-24 h-24 mb-6 text-indigo-100">
                      <ExternalLink className="w-full h-full stroke-[0.5]" />
                    </div>
                    <h4 className="text-[15px] font-bold text-slate-800">{t('noSharedItems')}</h4>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
