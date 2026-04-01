import { create } from 'zustand';

export type Notification = {
    id: string;
    type: string;
    title: string;
    message: string;
    actionUrl: string | null;
    read: boolean;
    createdAt: string;
};

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async () => {
        if (get().loading) return;
        set({ loading: true });
        try {
            const response = await fetch('/api/notifications');
            const data = await response.json();
            if (data.success) {
                set({
                    notifications: data.data,
                    unreadCount: data.data.filter((n: Notification) => !n.read).length
                });
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            set({ loading: false });
        }
    },

    markAsRead: async (id) => {
        try {
            const response = await fetch(`/api/notifications?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read: true }),
            });
            if (response.ok) {
                const { notifications } = get();
                const updated = notifications.map((n) =>
                    n.id === id ? { ...n, read: true } : n
                );
                set({
                    notifications: updated,
                    unreadCount: updated.filter((n) => !n.read).length
                });
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    },

    markAllAsRead: async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ all: true, read: true }),
            });
            if (response.ok) {
                const { notifications } = get();
                const updated = notifications.map((n) => ({ ...n, read: true }));
                set({
                    notifications: updated,
                    unreadCount: 0
                });
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    },

    deleteNotification: async (id) => {
        try {
            const response = await fetch(`/api/notifications?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                const { notifications } = get();
                const updated = notifications.filter((n) => n.id !== id);
                set({
                    notifications: updated,
                    unreadCount: updated.filter((n) => !n.read).length
                });
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    },

    clearAll: async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ all: true }),
            });
            if (response.ok) {
                set({ notifications: [], unreadCount: 0 });
            }
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    },
}));
