'use client';

import React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

type SetupSection = {
  titleKey: string;
  colorClass: string;
  iconChar: string;
  items: { labelKey: string; href: string; badge?: string }[];
};

export default function SettingsPage() {
  const t = useTranslations('settings');

  const setupSections: SetupSection[] = [
    {
      titleKey: 'general',
      colorClass: 'text-orange-500',
      iconChar: '⚙',
      items: [
        { labelKey: 'companySettings', href: '/settings/company', badge: 'Ready' },
        { labelKey: 'users', href: '/settings/users' },
        { labelKey: 'rolesAndSharing', href: '/settings/security/roles', badge: 'Ready' },
      ],
    },
    {
      titleKey: 'customization',
      colorClass: 'text-indigo-600',
      iconChar: '🎨',
      items: [
        { labelKey: 'modules', href: '/settings/customization/modules', badge: 'Ready' },
        { labelKey: 'segments', href: '/settings/customization/segments' },
      ],
    },
    {
      titleKey: 'channels',
      colorClass: 'text-teal-600',
      iconChar: '📡',
      items: [
        { labelKey: 'email', href: '/settings/channels/email' },
        { labelKey: 'social', href: '/settings/channels/social' },
      ],
    },
    {
      titleKey: 'marketplace',
      colorClass: 'text-green-600',
      iconChar: '🛒',
      items: [
        { labelKey: 'zoho', href: '/settings/marketplace/zoho' },
        { labelKey: 'zohoProjects', href: '/settings/marketplace/zoho-projects' },
      ],
    },
  ];

  return (
    <div className="min-h-full bg-slate-50/50">
      {/* Top Search Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-slate-800">{t('setupHome')}</h1>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-9 h-10 bg-slate-50 border-slate-200 text-sm rounded-lg focus:ring-[#002a42] focus:border-[#002a42] transition-all"
          />
        </div>
      </div>

      {/* Grid Content */}
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {setupSections.map((section) => (
            <div key={section.titleKey} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden">
              {/* Section Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/30 group-hover:bg-slate-50 transition-colors">
                <div className={`w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-xl ${section.colorClass}`}>
                  {section.iconChar}
                </div>
                <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">
                  {t(section.titleKey)}
                </h2>
              </div>

              {/* Section Links */}
              <div className="px-5 py-4 flex flex-col gap-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-[13px] text-blue-600 hover:text-[#002a42] hover:bg-blue-50/50 px-2 py-1.5 rounded-md transition-all flex items-center justify-between group/link"
                  >
                    <span className="font-medium">{t(item.labelKey)}</span>
                    {item.badge ? (
                      <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity text-slate-400" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
