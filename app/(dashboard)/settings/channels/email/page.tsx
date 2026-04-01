import React from "react";
import { Button } from '@/components/ui/button';
import { Mail, Settings2, RefreshCw } from 'lucide-react';
import { MessageSquareShare } from "lucide-react"; // Alternative for Sync icon 

export default function EmailConfigTab() {
    return (
        <div className="h-full bg-white max-w-5xl mx-auto pt-4">
            <div className="mb-12">
                <h2 className="text-xl font-bold text-slate-800 mb-2">Configure Email</h2>
                <p className="text-sm text-slate-600">Connect your email inbox with Devex CRM and transform the way you do sales.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center items-start justify-center max-w-4xl mx-auto">

                {/* Feature 1 */}
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 relative flex items-center justify-center -translate-y-2">
                        <Mail className="w-10 h-10 text-slate-700" />
                        <div className="absolute inset-0 border border-slate-300 rounded-sm shadow-sm rotate-6 bg-white flex items-center justify-center p-2 opacity-80" />
                        <div className="absolute inset-0 border border-slate-300 rounded-sm shadow-sm bg-white flex items-center justify-center z-10 p-2">
                            <Mail className="w-8 h-8 text-slate-700" />
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full"><Settings2 className="w-4 h-4 text-slate-400" /></div>
                        </div>
                    </div>
                    <p className="text-[13px] font-medium text-slate-700 leading-relaxed max-w-[180px]">
                        Access your customer emails right inside CRM workspaces.
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col items-center gap-4 mt-2">
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-slate-400" />
                        <span className="w-6 h-px bg-slate-300 border-dashed" />
                        <RefreshCw className="w-6 h-6 text-slate-700 mx-2" />
                        <span className="w-6 h-px bg-slate-300 border-dashed" />
                        <Mail className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-[13px] font-medium text-slate-700 leading-relaxed max-w-[180px] mt-6">
                        Send and receive emails from inside CRM records.
                    </p>
                    <div className="mt-8 relative z-20">
                        <Button className="bg-[#4169E1] hover:bg-blue-700 text-white rounded text-sm px-8 font-semibold shadow-sm h-9">
                            Get Started
                        </Button>
                    </div>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 border border-slate-300 rounded-sm shadow-sm bg-white flex items-center justify-center p-2">
                        <div className="relative">
                            <Mail className="w-10 h-10 text-slate-700" />
                            <RefreshCw className="w-4 h-4 text-slate-400 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
                        </div>
                    </div>
                    <p className="text-[13px] font-medium text-slate-700 leading-relaxed max-w-[180px]">
                        Synchronize your email inbox with Devex CRM
                    </p>
                </div>

            </div>
        </div>
    );
}
