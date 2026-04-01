'use client';

import React from 'react';
import { Search, ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function EmailSharingPage() {
    return (
        <div className="bg-white min-h-[calc(100vh-12rem)]">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">Email Sharing Permissions</h2>
                    <p className="text-sm text-slate-600 mt-1">Take a complete control of the email sharing permissions of your organization users.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-8 text-xs font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50 px-4">
                        Mass Update
                    </Button>
                    <Button variant="ghost" className="h-8 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 px-2" disabled>
                        Previous users &gt;
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search user emails" className="pl-9 h-8 text-sm" />
                </div>
            </div>

            <div className="border border-slate-200 rounded-sm overflow-hidden">
                <table className="w-full text-left bg-white">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="w-12 px-4 py-2 border-r border-slate-200">
                                <Checkbox className="rounded-sm border-slate-300" />
                            </th>
                            <th className="px-4 py-2 text-xs font-semibold text-slate-700 w-1/4">Users</th>
                            <th className="px-4 py-2 text-xs font-semibold text-slate-700 w-1/5">Configuration Type</th>
                            <th className="px-4 py-2 text-xs font-semibold text-slate-700 w-1/4 flex items-center justify-between group cursor-pointer">
                                Sharing
                            </th>
                            <th className="px-4 py-2 text-xs font-semibold text-slate-700">Domains Excluded</th>
                            <th className="px-4 py-2 text-xs font-semibold text-slate-700 border-l border-slate-200 w-32">
                                <div className="flex items-center justify-between">
                                    <span>Emails Shared With</span>
                                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50/50 group">
                            <td className="w-12 px-4 py-3">
                                <Checkbox className="rounded-sm border-slate-300 opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100 transition-opacity" />
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-medium">S</div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-800 hover:text-indigo-600 hover:underline cursor-pointer">
                                            sur le monde
                                        </span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-slate-500">CEO</span>
                                            <span className="text-[10px] bg-slate-100 px-1.5 rounded text-slate-600 border border-slate-200">Administrator</span>
                                            <span className="text-[10px] bg-green-50 text-green-700 px-1.5 rounded border border-green-200 font-medium">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">Not Configured</td>
                            <td className="px-4 py-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="h-8 w-full justify-between px-3 text-sm font-normal text-slate-700 bg-white">
                                            Private <ChevronDown className="w-4 h-4 text-slate-500 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="start">
                                        <DropdownMenuItem>Private</DropdownMenuItem>
                                        <DropdownMenuItem>Public</DropdownMenuItem>
                                        <DropdownMenuItem>Custom</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500">-</td>
                            <td className="px-4 py-3 text-sm text-slate-500 border-l border-slate-100">-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
