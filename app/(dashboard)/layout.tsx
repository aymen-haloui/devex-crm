'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { User } from '@/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });

        if (!response.ok) {
          console.error('Session check failed:', response.status);
          setLoading(false);
          router.push('/');
          return;
        }

        const data = await response.json();
        if (!data.success) {
          console.error('Session check returned success=false');
          setLoading(false);
          router.push('/');
          return;
        }

        if (isMounted) {
          setUser(data.data as User);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        setLoading(false);
        router.push('/');
      }
    };

    loadUser();

    // Sync with sidebar toggle
    const handleToggle = (e: any) => {
      setSidebarOpen(!e.detail.collapsed);
    };
    window.addEventListener('sidebar-toggle', handleToggle);

    return () => {
      isMounted = false;
      window.removeEventListener('sidebar-toggle', handleToggle);
    };
  }, [router]);

  useEffect(() => {
    // Force cleanup of any Radix or dialog-induced interaction locks
    const cleanup = () => {
      if (typeof document !== 'undefined') {
        document.body.style.pointerEvents = 'auto';
        document.body.style.overflow = 'auto';
        document.body.style.userSelect = 'auto';
        document.body.removeAttribute('data-radix-scroll-lock');
      }
    };

    cleanup();
    const timer = setInterval(cleanup, 1000);
    setTimeout(() => clearInterval(timer), 5000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore network errors on logout
    } finally {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-3 md:p-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
