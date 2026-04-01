'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, CheckCircle2, Copy, ExternalLink, HelpCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function ConnectivityPage() {
    const [activeStep, setActiveStep] = React.useState(1);
    const [phoneId, setPhoneId] = React.useState('');
    const [apiKey, setApiKey] = React.useState('');
    const [verifyToken, setVerifyToken] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings/connectivity/whatsapp');
                const data = await res.json();
                if (data.success && data.data) {
                    setPhoneId(data.data.whatsappPhoneId || '');
                    setApiKey(data.data.whatsappToken || '');
                    setVerifyToken(data.data.whatsappWebhookVerifyToken || '');
                }
            } catch (err) { console.error('Error fetching settings:', err); }
            finally { setLoading(false); }
        };
        fetchSettings();
    }, []);

    const handleSave = async (num: number) => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings/connectivity/whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    whatsappPhoneId: phoneId,
                    whatsappToken: apiKey,
                    whatsappWebhookVerifyToken: verifyToken,
                    whatsappProvider: 'meta',
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("WhatsApp settings updated successfully");
                setActiveStep(num + 1);
            } else {
                toast.error(data.error || "Failed to update settings");
            }
        } catch (err) {
            toast.error("An error occurred while saving");
        } finally {
            setSaving(false);
        }
    };

    const steps = [
        {
            title: "Meta Business Verification",
            description: "Verify your commercial entity with Meta to unlock high-volume messaging.",
            details: "You'll need your Algerian RC (Registre de Commerce) and proof of address.",
            link: "https://business.facebook.com/settings/security",
            icon: ShieldCheck
        },
        {
            title: "Select a BSP (Recommended)",
            description: "Choose a Business Solution Provider for easy Algerian market connectivity.",
            details: "Recommended: AlvoChat or MSG91 (Best DZD/Global pricing).",
            link: "https://www.facebook.com/business/m/whatsapp/business-solution-providers",
            icon: ExternalLink
        },
        {
            title: "Configure WhatsApp API",
            description: "Enter your Phone ID and Permanent Access Token.",
            details: "These credentials will be securely stored for automated invoice delivery.",
            icon: MessageCircle
        }
    ];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Webhook URL copied!");
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 no-print">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">WhatsApp Connectivity</h1>
                <p className="text-slate-500 font-medium italic">Empower your CRM with automated Algerian WhatsApp communications.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Step Guide */}
                <div className="lg:col-span-2 space-y-6">
                    {steps.map((step, idx) => {
                        const num = idx + 1;
                        const isActive = activeStep === num;
                        const isCompleted = activeStep > num;
                        const Icon = step.icon;

                        return (
                            <Card key={idx} className={`p-6 rounded-[2rem] border transition-all duration-500 ${isActive ? 'border-accent shadow-xl bg-white ring-4 ring-accent/5' : 'border-slate-100 opacity-60 bg-slate-50'}`}>
                                <div className="flex gap-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl border transition-all ${isActive ? 'bg-accent text-white border-accent scale-110 shadow-lg' : isCompleted ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-300 border-slate-100'}`}>
                                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : num}
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{step.title}</h3>
                                        <p className="text-sm font-medium text-slate-600 leading-relaxed">{step.description}</p>
                                        {isActive && (
                                            <div className="pt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-700">
                                                <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl">
                                                    <p className="text-xs font-bold text-accent italic mb-2 flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> Guide Note</p>
                                                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{step.details}</p>
                                                </div>
                                                {step.link && (
                                                    <Button onClick={() => window.open(step.link, '_blank')} className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 h-10 shadow-sm transition-all hover:scale-105 active:scale-95">
                                                        Start Setup <ExternalLink className="w-4 h-4 ml-2" />
                                                    </Button>
                                                )}
                                                {!step.link && (
                                                    <div className="space-y-4 pt-2">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phone ID</label>
                                                                <input
                                                                    value={phoneId}
                                                                    onChange={(e) => setPhoneId(e.target.value)}
                                                                    className="w-full h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold focus:ring-2 focus:ring-accent/20 outline-none"
                                                                    placeholder="123456789..."
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">API Key (Token)</label>
                                                                <input
                                                                    value={apiKey}
                                                                    onChange={(e) => setApiKey(e.target.value)}
                                                                    className="w-full h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold focus:ring-2 focus:ring-accent/20 outline-none"
                                                                    type="password"
                                                                    placeholder="••••••••"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5 md:col-span-2">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Webhook Verify Token</label>
                                                                <input
                                                                    value={verifyToken}
                                                                    onChange={(e) => setVerifyToken(e.target.value)}
                                                                    className="w-full h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold focus:ring-2 focus:ring-accent/20 outline-none"
                                                                    placeholder="Enter custom verify token"
                                                                />
                                                            </div>
                                                        </div>
                                                        <Button
                                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl h-11 tracking-widest uppercase text-xs"
                                                            onClick={() => handleSave(num)}
                                                            disabled={saving || loading}
                                                        >
                                                            {saving ? 'Saving...' : 'Save & Complete Connectivity'}
                                                        </Button>
                                                    </div>
                                                )}
                                                {num < steps.length && step.link && (
                                                    <Button variant="ghost" className="text-slate-400 font-bold hover:text-accent hover:bg-transparent" onClick={() => setActiveStep(num + 1)}>I already did this Step</Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Info Sidebar */}
                <div className="space-y-8">
                    <Card className="p-8 rounded-[3rem] bg-gradient-to-br from-emerald-500 to-green-600 text-white border-none shadow-xl shadow-emerald-200">
                        <MessageCircle className="w-12 h-12 mb-6 opacity-40 rotate-12" />
                        <h4 className="text-xl font-black mb-2 leading-tight">Webhook Configuration</h4>
                        <p className="text-sm font-medium text-emerald-100 leading-relaxed mb-6">Use this URL in your Meta Developer Dashboard to receive real-time message updates.</p>
                        <div className="bg-white/10 rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-all cursor-pointer group" onClick={() => copyToClipboard('https://api.your-crm.com/webhooks/whatsapp')}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Callback URL</span>
                                <Copy className="w-3.5 h-3.5 text-white/60 group-hover:scale-110 transition-transform" />
                            </div>
                            <p className="text-xs font-mono font-bold truncate">https://api.devex-crm.dz/webhooks/whatsapp</p>
                        </div>
                    </Card>

                    <Card className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-4">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Features Unlocked</h4>
                        <ul className="space-y-3">
                            {[
                                "One-click Invoice PDF to WhatsApp",
                                "Automated Payment Reminders",
                                "Client Receipt Confirmations",
                                "Verified Business Badge (Green Tick)"
                            ].map((feat, i) => (
                                <li key={i} className="flex gap-2 text-xs font-bold text-slate-500 italic">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {feat}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}
