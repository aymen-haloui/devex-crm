'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Plus } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminSettingsPage() {
    return (
        <div className="flex h-full bg-white min-h-[calc(100vh-12rem)]">

            {/* Left Main Content */}
            <div className="flex-1 p-8 pr-12 border-r border-slate-200">
                <h2 className="text-[13px] font-bold text-slate-800 mb-4 border-b border-transparent pb-2 shadow-[0_1px_0_0_#f1f5f9]">Social Permissions</h2>

                <div className="grid grid-cols-2 gap-x-8 gap-y-6 mt-6 max-w-2xl">

                    {/* Row 1 */}
                    <div className="text-[13px] font-semibold text-slate-700 pt-1">
                        Social Admin
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">Administrator</span>
                        </div>
                    </div>

                    <div className="col-span-2 border-t border-slate-100 mt-2" />

                    {/* Row 2 */}
                    <div className="text-[13px] font-semibold text-slate-700 pt-1">
                        Social Lite
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">Administrator</span>
                            <Button variant="ghost" className="h-6 text-[11px] font-bold text-indigo-600 hover:bg-slate-50 px-2 flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Add Profile
                            </Button>
                        </div>
                    </div>

                    <div className="col-span-2 border-t border-slate-100 mt-2" />

                    {/* Row 3 */}
                    <div className="text-[13px] font-semibold text-slate-700 pt-1">
                        Social Profiles
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">Administrator</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-6 text-[12px] px-2 font-medium text-slate-700 bg-white border-slate-200 shadow-none hover:bg-slate-50 flex items-center gap-1">
                                        Standard <ChevronDown className="w-3 h-3 text-slate-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Standard</DropdownMenuItem>
                                    <DropdownMenuItem>Custom Profile</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="col-span-2 border-t border-slate-100 mt-2" />

                </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-80 bg-slate-50/50 p-6 flex flex-col items-center">
                <div className="w-full flex justify-between items-start mb-16">
                    <h3 className="text-xs font-semibold text-slate-800">Users who have configured their private handles</h3>
                    <span className="text-slate-400 hover:text-indigo-600 font-normal text-xs underline cursor-pointer">Help</span>
                </div>

                <p className="text-xs font-medium text-slate-500 italic mt-8">No users found.</p>
            </div>

        </div>
    );
}
