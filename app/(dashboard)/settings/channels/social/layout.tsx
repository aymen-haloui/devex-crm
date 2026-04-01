'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const navItems = [
    { name: 'Brand Settings', href: '/settings/channels/social' },
    { name: 'Admin Settings', href: '/settings/channels/social/admin-settings' },
    { name: 'Automated Lead Generation', href: '/settings/channels/social/automated-lead-generation' },
];

export default function SocialSettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-50">

            {/* Top Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Setup Home</h1>
                </div>
                <div className="w-64 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search records" className="pl-9 h-8 bg-slate-50 border-slate-200" />
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Layout Area for Settings Sub-pages */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white">

                    {/* Settings Tabs Navigation */}
                    <div className="flex items-center gap-8 border-b border-slate-200 min-h-[48px] px-8 shrink-0">
                        {navItems.map((item) => {
                            // Exact match for the index route to avoid false active states
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`py-3.5 text-xs font-bold transition-colors border-b-2 tracking-wide ${isActive
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-auto bg-white">
                        {children}
                    </div>

                </div>
            </div>
        </div>
    );
}
