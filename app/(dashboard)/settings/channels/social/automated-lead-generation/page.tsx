'use client';

import React from 'react';

export default function AutomatedLeadGenerationPage() {
    return (
        <div className="p-8 bg-white min-h-[calc(100vh-12rem)]">
            <div className="flex justify-between items-start mb-8">
                <div className="max-w-2xl">
                    <h2 className="text-[15px] font-bold text-slate-800 tracking-tight">Automatically convert social activities into new leads.</h2>
                    <p className="text-[13px] text-slate-600 font-medium mt-1">Define social activities (such as likes, mentions, retweets, and comments) as lead qualifiers to automate lead generation for your business.</p>
                </div>
                <span className="text-slate-400 hover:text-indigo-600 font-normal text-xs underline cursor-pointer mt-1">Help</span>
            </div>

            <div className="mt-12 flex items-center max-w-lg">

                {/* Trigger Node */}
                <div className="w-24 h-24 rounded-full bg-[#1e293b] text-white flex items-center justify-center text-center text-[10px] font-bold leading-tight shadow-md z-10 p-4">
                    CONFIGURE <br /> AUTOMATION <br /> RULES
                </div>

                {/* Connection Lines & Targets Container */}
                <div className="flex flex-col gap-12 relative flex-1">

                    {/* Top Branch (X) */}
                    <div className="flex items-center relative -translate-y-2">
                        <div className="h-px bg-slate-300 w-16 -ml-4" />
                        <div className="absolute left-[-20px] top-1/2 -translate-y-[calc(50%+25px)] w-px h-[50px] bg-slate-300" />
                        <div className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center z-10 text-xs font-bold shadow-sm">
                            X
                        </div>
                        <div className="h-px bg-slate-300 w-12" />
                        <div className="flex-1 h-8 border border-slate-200 bg-white flex items-center px-4 rounded-sm border-dashed">
                            <span className="text-xs text-slate-400 italic">If Someone</span>
                        </div>
                    </div>

                    {/* Bottom Branch (Facebook) */}
                    <div className="flex items-center relative translate-y-2">
                        <div className="h-px bg-slate-300 w-16 -ml-4" />
                        <div className="absolute left-[-20px] bottom-1/2 translate-y-[calc(50%+25px)] w-px h-[50px] bg-slate-300" />
                        <div className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center z-10 text-xs font-bold text-slate-400 shadow-sm font-serif">
                            f
                        </div>
                        <div className="h-px bg-slate-300 w-12" />
                        <div className="flex-1 h-8 border border-slate-200 bg-white flex items-center px-4 rounded-sm border-dashed">
                            <span className="text-xs text-slate-400 italic">If Someone</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
