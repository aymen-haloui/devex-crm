'use client';

import { User } from '@/types';
import { LogOut, Bell, Menu, Settings, Search, Plus, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NotificationList } from '@/components/notifications/NotificationList';
import { useNotificationStore } from '@/store/notificationStore';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export default function Header({ user, onLogout, onToggleSidebar }: HeaderProps) {
  const t = useTranslations('common');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  const getLocaleDisplay = (loc: string) => {
    switch (loc) {
      case 'en': return 'EN';
      case 'fr': return 'FR';
      case 'ar': return 'AR';
      default: return loc.toUpperCase();
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-3">
        <button
          type="button"
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden md:block w-80">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder', { entity: t('search') })}
            className="h-9 ps-9 bg-slate-50 border-slate-200 focus-visible:ring-accent rounded-full text-sm transition-all focus-visible:bg-white"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-slate-200 text-slate-600 hover:text-accent hover:bg-accent/5 transition-colors" title={t('create')} aria-label={t('create')}>
          <Plus className="w-5 h-5" />
        </Button>

        {/* Language Switcher */}
        <div className="relative group me-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 text-xs font-bold">
            <Globe className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">{getLocaleDisplay(locale)}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />
          </button>
          <div className="absolute end-0 top-full mt-2 w-32 bg-white rounded-xl border border-slate-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] py-2">
            <button
              onClick={() => handleLocaleChange('en')}
              className={`w-full text-start px-4 py-2 text-xs font-bold hover:bg-slate-50 flex items-center gap-2 ${locale === 'en' ? 'bg-blue-50 text-blue-600' : ''}`}
            >
              🇺🇸 English
            </button>
            <button
              onClick={() => handleLocaleChange('fr')}
              className={`w-full text-start px-4 py-2 text-xs font-bold hover:bg-slate-50 flex items-center gap-2 ${locale === 'fr' ? 'bg-blue-50 text-blue-600' : ''}`}
            >
              🇫🇷 Français
            </button>
            <button
              onClick={() => handleLocaleChange('ar')}
              className={`w-full text-start px-4 py-2 text-xs font-bold hover:bg-slate-50 flex items-center gap-2 ${locale === 'ar' ? 'bg-blue-50 text-blue-600' : ''}`}
            >
              🇩🇿 العربية
            </button>
          </div>
        </div>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Notifications"
              aria-label="Notifications"
              className="p-2 rounded-full hover:bg-slate-100 relative transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0 border-none bg-transparent shadow-none" align="end">
            <NotificationList />
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 ps-2 pe-4 py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.firstName?.[0] || 'U'}
              </span>
            </div>
            <div className="text-start hidden sm:block">
              <p className="text-xs font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">{user?.role.replace('_', ' ')}</p>
            </div>
          </button>

          {/* Dropdown menu */}
          {isUserMenuOpen && (
            <div className="absolute end-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
              <div className="p-4 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <div className="py-2">
                <Link href="/settings" className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  {t('settings')}
                </Link>
                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
