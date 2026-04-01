'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
    { name: 'Company Details', href: '/settings/company' },
    { name: 'Fiscal Year', href: '/settings/company/fiscal-year' },
    { name: 'Domain Mapping', href: '/settings/company/domain-mapping' },
    { name: 'Business Hours', href: '/settings/company/business-hours' },
    { name: 'Holidays', href: '/settings/company/holidays' },
    { name: 'Currencies', href: '/settings/company/currencies' },
    { name: 'Hierarchy Performance', href: '/settings/company/hierarchy-performance' },
];

export default function CompanySettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Tab Bar */}
            <div className="flex items-center gap-0 border-b border-slate-200 px-6 shrink-0 min-h-[44px] overflow-x-auto">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`px-4 py-3 text-[12px] font-semibold whitespace-nowrap border-b-2 transition-colors ${isActive
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                                }`}
                        >
                            {tab.name}
                        </Link>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
}
