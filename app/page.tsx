'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('auth');
  const locale = useLocale();

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (response.ok) {
          router.push('/home');
        }
      } catch (err) {
        // Not logged in, stay on login page
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push('/home');
      } else {
        setError(data.error || t('invalidCredentials'));
      }
    } catch (err) {
      setError(t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans overflow-hidden">
      {/* Left panel - Full Full-Bleed Branded Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#002a42] overflow-hidden">
        <Image
          src="/devex-logo.png"
          alt="Devex Branding"
          fill
          className="object-cover"
          priority
          sizes="50vw"
        />

        {/* Subtle overlay branding */}
        <div className="absolute inset-0 bg-black/5 pointer-events-none" />

        {/* Minimal branding details at corner */}
        <div className="absolute bottom-8 start-8 z-10 flex flex-col gap-1">
          <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium transition-opacity hover:text-white/60">
            © 2026 Devex Solutions
          </p>
        </div>
      </div>

      {/* Right panel - Auth form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-slate-50 relative">
        {/* Mobile Logo - Centered at top */}
        <div className="lg:hidden flex flex-col items-center mb-10">
          <div className="w-24 h-24 mb-4 relative rounded-2xl overflow-hidden shadow-xl border border-white/20">
            <Image
              src="/devex-logo.png"
              alt="Devex Logo"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto">
          {/* Section: Language Switcher for Login */}
          <div className="absolute top-8 end-8 flex items-center gap-2">
            <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm">
              <button
                onClick={() => handleLocaleChange('en')}
                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${locale === 'en' ? 'bg-[#002a42] text-white' : 'text-slate-500 hover:text-slate-700'}`}
              >
                EN
              </button>
              <button
                onClick={() => handleLocaleChange('fr')}
                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${locale === 'fr' ? 'bg-[#002a42] text-white' : 'text-slate-500 hover:text-slate-700'}`}
              >
                FR
              </button>
              <button
                onClick={() => handleLocaleChange('ar')}
                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${locale === 'ar' ? 'bg-[#002a42] text-white' : 'text-slate-500 hover:text-slate-700'}`}
              >
                AR
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#002a42] mb-2 drop-shadow-sm">
              {t('welcomeBack')}
            </h1>
            <p className="text-slate-500 text-[15px]">
              {t('enterCredentials')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                {t('emailAddress')}
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@dx.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-11 border-slate-200 focus:border-[#002a42] shadow-sm rounded-xl px-4 transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  {t('password')}
                </label>
                <a href="#" className="text-sm font-medium text-[#002a42] hover:underline transition-colors focus:outline-none focus:underline">{t('forgotPassword')}</a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="h-11 border-slate-200 focus:border-[#002a42] shadow-sm rounded-xl px-4 transition-all"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center animate-in fade-in zoom-in duration-300">
                <span className="me-2">⚠️</span> {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 bg-[#002a42] hover:bg-[#003d5c] text-white shadow-md hover:shadow-lg transition-all rounded-xl mt-2 font-semibold text-[15px] group" disabled={loading}>
              {loading ? t('signingIn') : t('signInButton')}
              {!loading && <ArrowRight className="w-4 h-4 ms-2 group-hover:translate-s-1 transition-transform" />}
            </Button>
          </form>

          {/* Demo Credentials Section */}
          <div className="mt-10 p-6 bg-slate-100/50 border border-slate-200 rounded-2xl backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-[#002a42] rounded-full animate-pulse" />
              <h3 className="text-sm font-bold text-[#002a42] uppercase tracking-wider">{t('demoAccessCenter')}</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-[#002a42]/30 transition-colors">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase mb-0.5">{t('adminRole')}</p>
                  <p className="text-[13px] font-medium text-slate-700">admin@dx.local</p>
                </div>
                <div className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono font-bold text-slate-600">
                  admin123
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-[#002a42]/30 transition-colors">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{t('managerRole')}</p>
                  <p className="text-[12px] font-medium text-slate-700 truncate">sales@dx.local</p>
                </div>
                <div className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-[#002a42]/30 transition-colors">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{t('salesRepRole')}</p>
                  <p className="text-[12px] font-medium text-slate-700 truncate">rep@dx.local</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-[#002a42]/30 transition-colors">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{t('marketingRole')}</p>
                  <p className="text-[12px] font-medium text-slate-700 truncate">mkt@dx.local</p>
                </div>
                <div className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-[#002a42]/30 transition-colors">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{t('supportRole')}</p>
                  <p className="text-[12px] font-medium text-slate-700 truncate">support@dx.local</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center p-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
              <p className="text-[11px] text-slate-500 italic">
                {t('hoverNotice')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
