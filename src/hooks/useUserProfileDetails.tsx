import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SocialLink {
  platform: string;
  url: string;
}

export interface Skill {
  name: string;
  category: string;
  level: number; // 0-100
}

export interface Achievement {
  name: string;
  description: string;
  icon: string;
  date: string;
}

export interface LearningPathItem {
  skill: string;
  progress: number;
  totalLessons: number;
  currentLesson: number;
}

export interface UserProfileDetails {
  id?: string;
  user_id: string;
  bio?: string;
  location?: string;
  join_date?: string;
  portfolio_url?: string;
  job_title?: string;
  company?: string;
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  social_links: SocialLink[];
  skills: Skill[];
  achievements: Achievement[];
  learning_path: LearningPathItem[];
  total_posts: number;
  total_roadmaps: number;
  total_likes_received: number;
  total_comments_received: number;
  created_at?: string;
  updated_at?: string;
}

export const useUserProfileDetails = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  // Fetch user profile details
  const { data: profileDetails, isLoading, error } = useQuery({
    queryKey: ['userProfileDetails', targetUserId],
    queryFn: async (): Promise<UserProfileDetails | null> => {
      if (!targetUserId) return null;
      
      const { data, error } = await supabase
        .from('user_profile_details')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    },
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update profile details mutation
  const updateProfileDetails = useMutation({
    mutationFn: async (updates: Partial<UserProfileDetails>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profile_details')
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
      queryClient.invalidateQueries({ queryKey: ['userProfileDetails', user?.id] });
    },
  });

  // Migrate from localStorage (one-time migration)
  const migrateFromLocalStorage = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;

      const storageKey = `profile:${user.id}`;
      const saved = localStorage.getItem(storageKey);
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          
          const profileData: Partial<UserProfileDetails> = {
            bio: parsed.bio,
            location: parsed.location,
            join_date: parsed.joinDate,
            portfolio_url: parsed.portfolioUrl,
            job_title: parsed.title,
            social_links: parsed.socialLinks || [],
            skills: parsed.skills || [],
            achievements: parsed.achievements || [],
            learning_path: parsed.learningPath || [],
          };

          await updateProfileDetails.mutateAsync(profileData);
          
          // Remove from localStorage after successful migration
          localStorage.removeItem(storageKey);
        } catch (error) {
          console.warn('Failed to migrate profile details from localStorage:', error);
        }
      }
    },
  });

  return {
    profileDetails,
    isLoading,
    error,
    updateProfileDetails: updateProfileDetails.mutate,
    isUpdating: updateProfileDetails.isPending,
    migrateFromLocalStorage: migrateFromLocalStorage.mutate,
  };
};
