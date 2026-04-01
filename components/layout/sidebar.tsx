'use client';
import React, { useState, useEffect } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import {
  Home,
  FileBarChart2,
  ChartPie,
  ClipboardList,
  ChevronDown,
  Search,
  FolderKanban,
  Users,
  UserCheck,
  Building2,
  Briefcase,
  FileText,
  Megaphone,
  LayoutGrid,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from 'lucide-react';

const SIDEBAR_COLOR = '#01273b';
const PRIMARY_COLOR = '#fb2528';
import { SIDEBAR_GROUPS, TOP_MENU_ROLES } from '@/lib/roles';
import { UserRole } from '@/types';

interface SidebarProps {
  user?: any;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('sidebar');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [openGroups, setOpenGroups] = useState<string[]>(['Sales']);
  const [isMounted, setIsMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('crm-sidebar-state');
    if (saved) {
      try {
        setOpenGroups(JSON.parse(saved));
      } catch (e) { }
    }
    const savedCollapsed = localStorage.getItem('crm-sidebar-collapsed');
    if (savedCollapsed) {
      setIsCollapsed(savedCollapsed === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('crm-sidebar-collapsed', String(newState));
    // Trigger a custom event for the layout to respond
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed: newState } }));
  };

  const handleAccordionChange = (value: string[]) => {
    setOpenGroups(value);
    localStorage.setItem('crm-sidebar-state', JSON.stringify(value));
  };

  const userRole = (user?.role as UserRole) || UserRole.SALES_REP;

  const topMenuItems = [
    { href: '/home', label: t('home'), icon: Home, color: 'text-orange-400' },
    { href: '/reports', label: t('reports'), icon: FileBarChart2, color: 'text-pink-400' },
    { href: '/analytics', label: t('analytics'), icon: ChartPie, color: 'text-purple-400' },
    { href: '/my-requests', label: t('myRequests'), icon: ClipboardList, color: 'text-emerald-400' },
  ].filter(item => {
    const allowedRoles = TOP_MENU_ROLES[item.href as keyof typeof TOP_MENU_ROLES] || [];
    return allowedRoles.includes(userRole);
  });

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/home') {
      return pathname === '/dashboard' || pathname === '/home';
    }
    return pathname.startsWith(href);
  };

  const filterItems = (items: Array<any>) => {
    if (!searchQuery) return items;
    return items.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  if (!isMounted) return <aside className="h-screen w-[260px] bg-[#1e2c4c]" />;

  const groups = SIDEBAR_GROUPS
    .filter(group => group.roles.includes(userRole))
    .map(group => ({
      title: group.title,
      label: t(group.labelKey),
      items: group.items
        .filter(item => item.roles.includes(userRole))
        .map(item => ({
          href: item.href,
          label: t(item.labelKey)
        }))
    }));

  const accordionValue = searchQuery
    ? groups.map(g => g.title).filter(title => {
      const g = groups.find(group => group.title === title);
      return g && filterItems(g.items).length > 0;
    })
    : openGroups;

  return (
    <aside className={cn(
      "sticky top-0 start-0 h-screen bg-sidebar border-e border-white/5 flex flex-col z-40 shadow-xl transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden",
      isCollapsed ? "w-[70px]" : "w-[260px]"
    )}>
      <div className={cn("p-4", isCollapsed && "px-3")}>
        {/* Header */}
        <div className={cn("flex items-center justify-between mb-8", isCollapsed && "flex-col gap-4")}>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role */}
            {!isCollapsed && <h1 className="text-xl font-black tracking-tighter text-[#fb2528]">Devex CRM</h1>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-white hover:bg-white/10 h-8 w-8 transition-transform"
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </Button>
        </div>

        {/* Top Items */}
        <nav className="space-y-1 mb-10">
          {topMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} title={isCollapsed ? item.label : undefined} className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-[#2c3e5d] text-white" : "text-slate-300 hover:text-white hover:bg-white/5",
                isCollapsed && "justify-center px-0"
              )}>
                <Icon className={cn("w-5 h-5 shrink-0", item.color)} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Teamspace Section */}
        <div className={cn("border-t border-white/10 pt-6 mb-4", isCollapsed && "items-center flex flex-col gap-4")}>
          <div className={cn("flex items-center justify-between px-3 mb-4", isCollapsed && "hidden")}>
            <div className="flex items-center gap-3 text-white">
              <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center text-[10px] font-bold">CT</div>
              <span className="text-sm font-bold">{t('teamspace')}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </div>

          {!isCollapsed ? (
            <div className="px-1 mb-4">
              <div className="relative group/search">
                <Search className="absolute start-3 top-2.5 h-3.5 w-3.5 text-slate-400 group-focus-within/search:text-blue-400 transition-colors" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search')}
                  className="h-9 border-white/5 bg-[#17243e] ps-9 pe-8 text-xs text-white placeholder:text-slate-500 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                    className="absolute end-2 top-2.5 p-0.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600/20 text-purple-400 mb-2">
              <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center text-[10px] font-bold text-white">CT</div>
            </div>
          )}

          <div className={cn("px-3 py-2 text-slate-300 flex items-center gap-3 text-sm hover:text-white cursor-pointer group", isCollapsed && "justify-center px-0")}>
            <LayoutGrid className="w-4 h-4 text-slate-400 group-hover:text-amber-400 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 font-medium">{t('workqueue')}</span>
                <span className="text-amber-400 text-xs">✦</span>
              </>
            )}
          </div>
        </div>

        {/* Groups */}
        <Accordion.Root type="multiple" value={accordionValue} onValueChange={handleAccordionChange} className="space-y-1">
          {groups.map(group => {
            const filtered = filterItems(group.items);
            if (searchQuery && filtered.length === 0) return null;
            const isOpen = accordionValue.includes(group.title);

            return (
              <Accordion.Item key={group.title} value={group.title} className="border-0">
                <Accordion.Header asChild>
                  <Accordion.Trigger className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white group",
                    isCollapsed && "justify-center px-0"
                  )}>
                    <FolderOpen className={cn("w-4 h-4 shrink-0", isOpen ? "text-blue-400" : "text-slate-500")} />
                    {!isCollapsed && <span className="flex-1 text-start">{group.label}</span>}
                    {!isCollapsed && <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isOpen ? "" : "rtl:rotate-90 -rotate-90")} />}
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden">
                  <nav className="ps-10 pe-2 pb-2 space-y-1">
                    {filtered.map(item => {
                      const active = isActive(item.href);
                      return (
                        <Link key={item.href} href={item.href} className={cn(
                          "flex items-center gap-3 py-1.5 text-sm transition-colors",
                          active ? "text-white" : "text-slate-400 hover:text-white"
                        )}>
                          <div className={cn("w-4 h-4 rounded-full border border-white/20 flex items-center justify-center", active && "bg-blue-500 border-blue-500")}>
                            {active && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </Accordion.Content>
              </Accordion.Item>
            );
          })}
        </Accordion.Root>

        {/* Global Settings Shortcut */}
        <div className="mt-auto pt-6 border-t border-white/10">
          <Link href="/settings" className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            pathname.startsWith('/settings') ? "bg-[#2c3e5d] text-white" : "text-slate-300 hover:text-white hover:bg-white/5",
            isCollapsed && "justify-center px-0"
          )}>
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-white shrink-0" />
            {!isCollapsed && <span>{tCommon('settings')}</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
