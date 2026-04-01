'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function ZohoProjectsSettingsPage() {
    const t = useTranslations('marketplace');
    const [portalOption, setPortalOption] = useState<'create' | 'existing'>('create');

    return (
        <div className="bg-white min-h-[calc(100vh-4rem)] p-8 relative">

            {/* Help link top-right */}
            <div className="absolute top-6 right-8">
                <button className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold">
                    <ExternalLink className="w-3 h-3" /> {t('zohoProjects.help')}
                </button>
            </div>

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-[15px] font-bold text-slate-800 border-l-4 border-indigo-600 pl-3">
                    {t('zohoProjects.title')}
                </h1>
            </div>

            {/* Portal Configuration Card */}
            <div className="max-w-2xl">
                <h2 className="text-[13px] font-bold text-slate-700 mb-1">{t('zohoProjects.portal_config')}</h2>
                <p className="text-[12px] text-slate-500 leading-relaxed mb-6">
                    {t('zohoProjects.portal_config_desc')}
                </p>

                <div className="space-y-4">
                    {/* Option 1 */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${portalOption === 'create'
                                    ? 'border-indigo-600 bg-indigo-600'
                                    : 'border-slate-300 bg-white group-hover:border-indigo-400'
                                }`}
                            onClick={() => setPortalOption('create')}
                        >
                            {portalOption === 'create' && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                        </div>
                        <span className="text-[12px] text-slate-700 font-medium select-none">
                            {t('zohoProjects.option_create')}
                        </span>
                    </label>

                    {/* Option 2 */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${portalOption === 'existing'
                                    ? 'border-indigo-600 bg-indigo-600'
                                    : 'border-slate-300 bg-white group-hover:border-indigo-400'
                                }`}
                            onClick={() => setPortalOption('existing')}
                        >
                            {portalOption === 'existing' && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                        </div>
                        <span className="text-[12px] text-slate-700 font-medium select-none">
                            {t('zohoProjects.option_existing')}
                        </span>
                    </label>
                </div>

                {/* Conditional: existing portal URL input */}
                {portalOption === 'existing' && (
                    <div className="mt-5 flex items-center gap-3 ml-7">
                        <label className="text-[12px] font-semibold text-slate-600 shrink-0 w-24">{t('zohoProjects.portal_url')}</label>
                        <input
                            type="text"
                            placeholder={t('zohoProjects.placeholder_portal_url')}
                            className="flex-1 h-8 border border-slate-200 rounded-sm text-xs px-3 focus:outline-none focus:border-indigo-400 transition-colors"
                        />
                    </div>
                )}
            </div>

        </div>
    );
}
