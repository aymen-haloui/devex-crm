'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Copy, Target } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';

export default function ZohoSalesIQSetupPage() {
    const t = useTranslations('marketplace');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [accountName, setAccountName] = useState('crmx');

    return (
        <div className="bg-white min-h-[calc(100vh-4rem)] flex flex-col items-center pt-16 p-8">
            <h1 className="text-[17px] font-semibold text-slate-800 tracking-tight mb-8">
                {t('zohoSalesIQ.title')}
            </h1>

            {/* Video/Graphic Placeholder matching Screenshot 2 */}
            <div className="w-[560px] h-[300px] bg-slate-900 rounded-lg overflow-hidden relative shadow-lg mb-6">
                {/* Header Bar */}
                <div className="h-10 bg-black/40 flex items-center justify-between px-4 absolute top-0 w-full z-20">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-1">
                            <Target className="w-4 h-4 text-slate-800" />
                        </div>
                        <span className="text-white text-[13px] font-medium tracking-wide">{t('zohoSalesIQ.title')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1.5 rounded transition">
                        <Copy className="w-4 h-4 text-white" />
                        <span className="text-white text-[10px] uppercase font-semibold">{t('zohoSalesIQ.copy_link')}</span>
                    </div>
                </div>

                {/* Center Graphic Map */}
                <div className="absolute inset-0 bg-slate-50 flex items-center justify-center pointer-events-none">
                    {/* Left Node */}
                    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center gap-3 w-32 border border-slate-100 z-10 transition-transform hover:scale-105">
                        <div className="w-12 h-12 rounded-full border border-red-200 bg-red-50 flex items-center justify-center text-red-500 p-2 relative">
                            <Target className="w-6 h-6" />
                            <SearchIcon className="w-4 h-4 bg-white rounded-full absolute bottom-0 right-0 p-0.5 border border-slate-200" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-800">{t('zohoSalesIQ.left_node')}</span>
                    </div>

                    {/* Connecting YouTube icon */}
                    <div className="w-16 flex justify-center z-10">
                        <div className="w-10 h-8 bg-red-600 rounded flex items-center justify-center shadow-sm">
                            <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                    </div>

                    {/* Right Node */}
                    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center gap-3 w-32 border border-slate-100 z-10 transition-transform hover:scale-105">
                        <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold p-2 text-xl italic font-serif">
                            <span className="text-[#00B4D8]">Z</span>OHO
                        </div>
                        <span className="text-[11px] font-bold text-slate-800">{t('zohoSalesIQ.right_node')}</span>
                    </div>

                    {/* Visual wave backdrop */}
                    <div className="absolute top-0 right-0 w-[200px] h-[300px] bg-slate-900 rounded-bl-[150px] z-0 opacity-10" />
                    <div className="absolute bottom-0 left-0 w-[200px] h-[150px] bg-slate-900 rounded-tr-[150px] z-0 opacity-10" />
                </div>

                {/* Footer Player Bar */}
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-black/60 flex items-center px-4 z-20">
                    <div className="bg-white/10 hover:bg-white/20 px-3 py-1 flex items-center gap-2 rounded text-white cursor-pointer transition">
                        <span className="text-[11px] font-semibold tracking-wide">{t('zohoSalesIQ.watch_on')}</span>
                        <span className="text-xs font-bold font-serif -mt-0.5">{t('zohoSalesIQ.youtube')}</span>
                    </div>
                </div>
            </div>

            <p className="text-[12px] font-medium text-slate-700 leading-relaxed max-w-xl text-center mb-6">
                {t('zohoSalesIQ.description')}
            </p>

            <Button
                className="bg-[#2B9A66] hover:bg-[#238054] text-white px-8 rounded shadow-sm text-xs font-bold h-8 tracking-wide"
                onClick={() => setIsModalOpen(true)}
            >
                {t('zohoSalesIQ.get_started')}
            </Button>

            {/* Devex SalesIQ Account Creation Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-slate-200">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50">
                        <DialogTitle className="text-sm font-bold text-slate-800">{t('zohoSalesIQ.modal.create_title')}</DialogTitle>
                        <DialogDescription className="sr-only">{t('zohoSalesIQ.modal.form_description')}</DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-6 space-y-5 bg-white">
                        <div className="flex items-center gap-4">
                            <label className="text-xs font-semibold text-slate-600 w-24 shrink-0">{t('zohoSalesIQ.modal.account_name')}</label>
                            <Input
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                                className="h-8 text-sm border-indigo-400 focus-visible:ring-0 focus-visible:border-indigo-500 rounded-sm shadow-sm"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="text-xs font-semibold text-slate-600 w-24 shrink-0">{t('zohoSalesIQ.modal.account_url')}</label>
                            <div className="flex-1 flex items-center gap-2">
                                <div className="h-8 bg-slate-50 border border-slate-200 rounded-sm text-xs text-slate-600 px-3 flex items-center w-full truncate">
                                    https://salesiq.zoho.com/{accountName.toLowerCase().replace(/\s+/g, '')}
                                </div>
                                <span className="text-[10px] font-bold text-green-600 shrink-0 uppercase tracking-wide">{t('zohoSalesIQ.modal.available')}</span>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-4 text-xs text-slate-700 leading-relaxed mt-2 shadow-sm">
                            <span className="font-bold text-slate-800 mb-1 block">{t('zohoSalesIQ.modal.note_title')}</span>
                            <ul className="list-disc pl-4 space-y-1 text-[11px] marker:text-slate-400">
                                <li>{t('zohoSalesIQ.modal.note_li1')}</li>
                                <li>{t('zohoSalesIQ.modal.note_li2')}</li>
                            </ul>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            className="h-7 text-xs px-5 border-slate-300 font-semibold text-slate-700 rounded-sm bg-white hover:bg-slate-50"
                        >
                            {t('zohoSalesIQ.modal.cancel')}
                        </Button>
                        <Button
                            onClick={() => setIsModalOpen(false)}
                            className="h-7 text-xs px-5 bg-[#007BFF] hover:bg-blue-700 text-white font-semibold rounded-sm shadow-sm"
                        >
                            {t('zohoSalesIQ.modal.create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}
