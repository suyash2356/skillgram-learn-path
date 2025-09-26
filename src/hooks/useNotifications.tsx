import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppNotification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body?: string | null;
  data?: Record<string, any> | null;
  read_at?: string | null;
  created_at: string;
};

type UseNotificationsResult = {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAllAsRead: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  createTestNotification: (partial?: Partial<AppNotification>) => Promise<void>;
};

export function useNotifications(): UseNotificationsResult {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const userId = user?.id;

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("id,user_id,type,title,body,data,read_at,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) setNotifications(data as AppNotification[]);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications((prev) => [payload.new as AppNotification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) => prev.map((n) => (n.id === (payload.new as any).id ? (payload.new as AppNotification) : n)));
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) => prev.filter((n) => n.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read_at).length, [notifications]);

  const markAsRead = useCallback(async (id: string) => {
    const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
    if (!error) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null)
      .eq('user_id', userId);
    if (!error) {
      setNotifications((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })));
    }
  }, [userId]);

  const deleteNotification = useCallback(async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (!error) setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const createTestNotification = useCallback(async (partial?: Partial<AppNotification>) => {
    if (!userId) return;
    const payload = {
      user_id: userId,
      type: partial?.type || 'general',
      title: partial?.title || 'Welcome to notifications',
      body: partial?.body || 'This is a test notification. You can mark as read.',
      data: partial?.data || null,
    };
    await supabase.from('notifications').insert(payload as any);
  }, [userId]);

  return { notifications, unreadCount, isLoading, markAllAsRead, markAsRead, deleteNotification, createTestNotification };
}


