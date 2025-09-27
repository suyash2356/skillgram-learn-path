import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';

export type RoadmapTemplate = Tables<'roadmap_templates'>;

export const useRoadmapTemplates = (roadmapId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['roadmapTemplates', user?.id, roadmapId],
    queryFn: async () => {
      if (!user?.id || !roadmapId) return [];
      const { data, error } = await supabase
        .from('roadmap_templates')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .or(`user_id.eq.${user.id},is_public.eq.true`);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!roadmapId,
  });

  const createTemplate = useMutation({
    mutationFn: async (templateData: Partial<RoadmapTemplate>) => {
      if (!user?.id || !roadmapId) throw new Error('User or roadmap not specified');
      const { data, error } = await supabase
        .from('roadmap_templates')
        .insert({
          user_id: user.id,
          roadmap_id: roadmapId,
          ...templateData,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmapTemplates', user?.id, roadmapId] });
    },
  });

  return {
    templates,
    isLoading,
    createTemplate: createTemplate.mutate,
  };
};
