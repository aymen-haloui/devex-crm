'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Users, UserPlus, Building2, DollarSign, Package, ClipboardList, BookOpen, Layers, Briefcase, Rocket, Heart, Settings2, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const MODULES = [
    { name: 'Leads', id: 'leads', icon: UserPlus, description: 'Potential customers to be qualified' },
    { name: 'Contacts', id: 'contacts', icon: Users, description: 'People you do business with' },
    { name: 'Accounts', id: 'accounts', icon: Building2, description: 'Companies or organizations' },
    { name: 'Deals', id: 'deals', icon: DollarSign, description: 'Opportunities for business' },
    { name: 'Products', id: 'products', icon: Package, description: 'Items or services you sell' },
    { name: 'Cases', id: 'cases', icon: ClipboardList, description: 'Support issues and resolutions' },
    { name: 'Solutions', id: 'solutions', icon: BookOpen, description: 'Knowledge base articles' },
    { name: 'Segments', id: 'segments', icon: Layers, description: 'Dynamic record groups' },
];

const OPTIONAL_MODULES = [
    { name: 'Services', id: 'services', icon: Briefcase, description: 'Manage service offerings and delivery' },
    { name: 'Projects', id: 'projects', icon: Rocket, description: 'Track client projects and milestones' },
    { name: 'Voice of Customer', id: 'voice-of-the-customer', icon: Heart, description: 'Collect and analyze customer feedback' },
];

export default function ModulesPage() {
    const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch('/api/settings/modules');
                const json = await res.json();
                if (json.success) setEnabledModules(json.data);
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    const toggleModule = async (moduleId: string, enabled: boolean) => {
        try {
            setUpdating(moduleId);
            const newSettings = { ...enabledModules, [moduleId]: enabled };
            const res = await fetch('/api/settings/modules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modules: newSettings })
            });
            const json = await res.json();
            if (json.success) {
                setEnabledModules(newSettings);
                toast.success(`${enabled ? 'Activated' : 'Deactivated'} ${moduleId} module`);
            } else {
                toast.error(json.error || 'Failed to update module');
            }
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-12">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 rounded-md bg-accent/10 text-accent">
                        <Settings2 className="w-5 h-5" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Modules and Fields</h1>
                </div>
                <p className="text-sm text-slate-500">Customize module layouts, add custom fields, and manage relationships.</p>
            </div>

            {/* Optional Feature Activation */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Feature Activation</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {OPTIONAL_MODULES.map((module) => {
                        const Icon = module.icon;
                        const isEnabled = enabledModules[module.id] ?? false;
                        return (
                            <Card key={module.id} className={`border-slate-200 shadow-sm transition-all ${isEnabled ? 'bg-white' : 'bg-slate-50/50 grayscale-[0.5] opacity-80'}`}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className={`p-2.5 rounded-lg ${isEnabled ? 'bg-primary/5 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <Switch
                                            checked={isEnabled}
                                            onCheckedChange={(val) => toggleModule(module.id, val)}
                                            disabled={updating === module.id}
                                        />
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-[15px] mb-1">{module.name}</h3>
                                    <p className="text-[12px] text-slate-500 leading-relaxed">
                                        {module.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>

            {/* Core Modules List */}
            <section>
                <div className="flex items-center gap-2 mb-6 border-t border-slate-100 pt-10">
                    <Layers className="w-4 h-4 text-slate-400" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Standard Modules</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MODULES.map((module) => {
                        const Icon = module.icon;
                        return (
                            <Link key={module.id} href={`/settings/customization/modules/${module.id}`}>
                                <Card className="hover:border-accent/40 hover:shadow-md transition-all cursor-pointer group h-full border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-[15px]">{module.name}</h3>
                                                <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                                                    {module.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
