import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';

type UserActivity = Tables<'user_activity'>;
type ActivityType = UserActivity['activity_type'];

export const useUserActivity = () => {
  const { user } = useAuth();

  const trackActivity = useCallback(async (
    activity_type: ActivityType,
    metadata: Partial<UserActivity> = {}
  ) => {
    if (!user?.id) return;

    const { error } = await supabase.from('user_activity').insert({
      user_id: user.id,
      activity_type,
      ...metadata,
    });

    if (error) {
      console.error('Error tracking activity:', error);
    }
  }, [user?.id]);

  return { trackActivity };
};
