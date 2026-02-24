import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';
import { notificationApi } from '../api/notifications';
import type { Notification } from '../types/notification';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

const HUB_URL = `${import.meta.env.VITE_API_BASE_URL || 'https://acme.localhost:5000'}/hubs/notifications`;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  // Load initial notifications + unread count from REST on auth
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    notificationApi.getAll().then(setNotifications).catch(() => {});
    notificationApi.getUnreadCount().then(setUnreadCount).catch(() => {});
  }, [isAuthenticated]);

  // Manage SignalR connection lifecycle
  useEffect(() => {
    if (!isAuthenticated || !token) {
      connectionRef.current?.stop();
      connectionRef.current = null;
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_URL}?access_token=${token}`, {
        skipNegotiation: false,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('notification', (incoming: Notification) => {
      setNotifications((prev) => [incoming, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    connection.start().catch((err) => {
      console.warn('SignalR connection failed:', err);
    });

    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
  }, [isAuthenticated, token]);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const markRead = useCallback(async (id: string) => {
    await notificationApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, drawerOpen, openDrawer, closeDrawer, markRead, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
