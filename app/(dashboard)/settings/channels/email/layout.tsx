'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const navItems = [
    { name: 'Compose', href: '/settings/channels/email/compose' },
    { name: 'Email', href: '/settings/channels/email' },
    { name: 'Email Sharing', href: '/settings/channels/email/email-sharing' },
    { name: 'Organization Emails', href: '/settings/channels/email/organization-emails' },
    { name: 'Custom Email Fields', href: '/settings/channels/email/custom-fields' },
];

export default function EmailSettingsLayout({ children }: { children: React.ReactNode }) {
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
                <div className="flex-1 overflow-auto bg-white p-8">

                    {/* Settings Tabs Navigation */}
                    <div className="flex items-center gap-8 border-b border-slate-200 mb-8 min-h-[48px] overflow-x-auto whitespace-nowrap">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`py-4 text-sm font-semibold transition-colors border-b-2 ${isActive
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
                    <div className="h-full">
                        {children}
                    </div>

                </div>
            </div>
        </div>
    );
}
