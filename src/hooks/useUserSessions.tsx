import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tables, Database } from '@/integrations/supabase/types';

export type UserSession = Tables<'public', 'user_sessions'>;

export const useUserSessions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const manageSession = async () => {
      if (!user?.id) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const deviceIdentifier = navigator.userAgent; // Simple identifier
      let sessionId = sessionStorage.getItem('session_id');

      if (!sessionId) {
        const { data, error } = await supabase
          .from('user_sessions')
          .insert({
            user_id: user.id,
            user_agent: deviceIdentifier,
            ip_address: session.user.user_metadata.ip_address,
          })
          .select('id')
          .single();
        
        if (data) {
          sessionId = data.id;
          sessionStorage.setItem('session_id', sessionId);
        }
      } else {
        await supabase
          .from('user_sessions')
          .update({ last_activity: new Date().toISOString() })
          .eq('id', sessionId);
      }
    };

    manageSession();
    const interval = setInterval(manageSession, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, [user?.id]);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['userSessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_activity', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const terminateSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSessions', user?.id] });
    },
  });

  return {
    sessions,
    isLoading,
    terminateSession: terminateSession.mutate,
  };
};
