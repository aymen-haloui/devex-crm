'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Trash2, ExternalLink, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import { useTranslations } from 'next-intl';

export function NotificationList() {
    const t = useTranslations('notifications');
    const {
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loading
    } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    if (notifications.length === 0 && !loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-white">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                    <Inbox className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-900">{t('emptyTitle')}</p>
                <p className="text-xs text-slate-500 mt-1">{t('emptyDescription')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[400px] w-80 sm:w-96 bg-white overflow-hidden shadow-2xl rounded-xl border border-slate-100">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('title')}</h3>
                    {unreadCount > 0 && <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] px-1.5 py-0">{unreadCount}</Badge>}
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="h-7 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                    >
                        {t('markAllAsRead')}
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1">
                <div className="divide-y divide-slate-50">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={cn(
                                "p-4 transition-colors group relative",
                                !notification.read ? "bg-blue-50/20" : "hover:bg-slate-50"
                            )}
                        >
                            <div className="flex gap-3">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    !notification.read ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                                )}>
                                    <Bell className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0 pr-8">
                                    <p className={cn(
                                        "text-sm",
                                        !notification.read ? "font-bold text-slate-900" : "font-medium text-slate-600"
                                    )}>
                                        {notification.title}
                                    </p>
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                        {notification.message}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-4 end-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notification.read && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => markAsRead(notification.id)}
                                        className="h-6 w-6 rounded-full hover:bg-emerald-50 hover:text-emerald-600"
                                        title={t('markAsRead')}
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteNotification(notification.id)}
                                    className="h-6 w-6 rounded-full hover:bg-red-50 hover:text-red-600"
                                    title={t('delete')}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                                {notification.actionUrl && (
                                    <Link href={notification.actionUrl}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-full hover:bg-slate-100 hover:text-slate-900"
                                            title={t('view')}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
