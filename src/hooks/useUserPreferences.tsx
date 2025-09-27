import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserPreferences {
  id?: string;
  user_id: string;
  display_name?: string;
  website?: string;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  profile_visibility: 'public' | 'private' | 'friends';
  show_online_status: boolean;
  allow_follow_requests: boolean;
  two_factor_enabled: boolean;
  login_notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  created_at?: string;
  updated_at?: string;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user preferences
  const { data: preferences, isLoading, error } = useQuery({
    queryKey: ['userPreferences', user?.id],
    queryFn: async (): Promise<UserPreferences | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update preferences mutation
  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences', user?.id] });
    },
  });

  // Migrate from localStorage (one-time migration)
  const migrateFromLocalStorage = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;

      const storageKey = `settings:${user.id}`;
      const saved = localStorage.getItem(storageKey);
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const { account, notifications, privacy, security } = parsed;
          
          const preferencesData: Partial<UserPreferences> = {
            display_name: account?.displayName,
            website: account?.website,
            email_notifications: notifications?.email_notifications ?? true,
            push_notifications: notifications?.push_notifications ?? true,
            marketing_emails: notifications?.marketing_emails ?? false,
            profile_visibility: privacy?.profile_visibility ?? 'public',
            show_online_status: privacy?.show_online_status ?? true,
            allow_follow_requests: privacy?.allow_follow_requests ?? true,
            two_factor_enabled: security?.two_factor_enabled ?? false,
            login_notifications: security?.login_notifications ?? true,
            theme: account?.theme ?? 'system',
            language: account?.language ?? 'en',
            timezone: account?.timezone ?? 'UTC',
          };

          await updatePreferences.mutateAsync(preferencesData);
          
          // Remove from localStorage after successful migration
          localStorage.removeItem(storageKey);
        } catch (error) {
          console.warn('Failed to migrate preferences from localStorage:', error);
        }
      }
    },
  });

  return {
    preferences,
    isLoading,
    error,
    updatePreferences: updatePreferences.mutate,
    isUpdating: updatePreferences.isPending,
    migrateFromLocalStorage: migrateFromLocalStorage.mutate,
  };
};
