'use client';

import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Facebook, Twitter, Globe } from 'lucide-react';

export default function BrandSettingsTab() {
    const [isCreating, setIsCreating] = useState(false);

    if (isCreating) {
        return (
            <div className="p-8 max-w-2xl bg-white">
                <h2 className="text-[15px] font-bold text-slate-800 mb-6 border-b border-transparent pb-2 shadow-[0_1px_0_0_#f1f5f9]">Create New Brand</h2>

                <div className="space-y-6 max-w-lg">
                    <div className="flex items-start gap-4">
                        <label className="text-xs font-semibold text-slate-600 w-32 pt-2 shrink-0">
                            Brand Name <span className="text-red-500">*</span>
                        </label>
                        <div className="w-full">
                            <Input
                                className="h-8 rounded-sm border-indigo-400 focus-visible:ring-0 focus-visible:border-indigo-500 shadow-sm transition-colors text-sm w-full"
                                autoFocus
                            />
                            {/* Simulation of validation error if empty initially like in screenshot */}
                            <p className="text-[10px] text-red-500 mt-1 font-medium">Brand name cannot be empty</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <label className="text-xs font-semibold text-slate-600 w-32 pt-2 shrink-0">Brand Description</label>
                        <Textarea className="min-h-[100px] rounded-sm border-slate-300 resize-none text-sm focus-visible:ring-indigo-500 w-full" />
                    </div>

                    <div className="flex items-center gap-3 ml-36 pt-2">
                        <Button
                            variant="outline"
                            className="h-7 text-xs px-6 rounded-sm border-slate-300 font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100"
                            onClick={() => setIsCreating(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="h-7 text-xs px-6 rounded-sm bg-indigo-300 hover:bg-indigo-400 text-white font-semibold cursor-not-allowed"
                            disabled
                        >
                            Create
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-white flex flex-col items-center justify-center p-8">

            <div className="flex flex-col items-center text-center max-w-lg -translate-y-12">

                <div className="flex items-center justify-center mb-6">
                    <div className="w-10 h-10 rounded-full border border-indigo-200 bg-indigo-50 flex items-center justify-center -mr-2 z-10 shadow-sm relative">
                        <Facebook className="w-5 h-5 text-indigo-600" fill="currentColor" />
                    </div>
                    <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center ml-0 z-20 shadow-sm relative">
                        <span className="text-xs font-bold text-slate-800">X</span>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-blue-200 bg-blue-50 flex items-center justify-center -ml-2 z-10 shadow-sm relative">
                        <Globe className="w-5 h-5 text-blue-500" />
                    </div>
                </div>

                <h2 className="text-[15px] font-bold text-slate-800 mb-3">Create New Brand</h2>

                <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
                    A brand comprises of your organization's X handle and Facebook page. <br />
                    Start by connecting the social media channels for your business under a brand name to have an unified experience.
                </p>

                <Button
                    className="bg-[#4169E1] hover:bg-blue-700 text-white rounded text-[13px] px-6 font-semibold shadow-sm h-8"
                    onClick={() => setIsCreating(true)}
                >
                    Create New Brand
                </Button>

            </div>

        </div>
    );
}
