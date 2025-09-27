import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SavedPostCollection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedPost {
  id: string;
  user_id: string;
  post_id: string;
  collection_id?: string;
  notes?: string;
  created_at: string;
  // Joined data
  post?: {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    created_at: string;
    user_id: string;
  };
  collection?: SavedPostCollection;
}

export const useSavedPosts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's collections
  const { data: collections, isLoading: isLoadingCollections } = useQuery({
    queryKey: ['savedPostCollections', user?.id],
    queryFn: async (): Promise<SavedPostCollection[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('saved_posts_collections')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch saved posts
  const { data: savedPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['savedPosts', user?.id],
    queryFn: async (): Promise<SavedPost[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          *,
          post:posts(*),
          collection:saved_posts_collections(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create collection mutation
  const createCollection = useMutation({
    mutationFn: async (data: { name: string; description?: string; color?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('saved_posts_collections')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description,
          color: data.color || '#3B82F6',
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedPostCollections', user?.id] });
    },
  });

  // Save post mutation
  const savePost = useMutation({
    mutationFn: async (data: { postId: string; collectionId?: string; notes?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('saved_posts')
        .insert({
          user_id: user.id,
          post_id: data.postId,
          collection_id: data.collectionId,
          notes: data.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedPosts', user?.id] });
    },
  });

  // Remove saved post mutation
  const removeSavedPost = useMutation({
    mutationFn: async (postId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedPosts', user?.id] });
    },
  });

  // Update collection mutation
  const updateCollection = useMutation({
    mutationFn: async (data: { id: string; name?: string; description?: string; color?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('saved_posts_collections')
        .update({
          name: data.name,
          description: data.description,
          color: data.color,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedPostCollections', user?.id] });
    },
  });

  // Delete collection mutation
  const deleteCollection = useMutation({
    mutationFn: async (collectionId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('saved_posts_collections')
        .delete()
        .eq('id', collectionId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedPostCollections', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['savedPosts', user?.id] });
    },
  });

  // Migrate from localStorage (one-time migration)
  const migrateFromLocalStorage = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;

      const storageKey = `savedPosts:${user.id}`;
      const collectionsKey = `savedCollections:${user.id}`;
      
      try {
        // Migrate collections
        const collectionsData = localStorage.getItem(collectionsKey);
        if (collectionsData) {
          const parsed = JSON.parse(collectionsData);
          const collections = parsed.collections || [];
          
          for (const collectionName of collections) {
            if (collectionName !== 'All') {
              await createCollection.mutateAsync({
                name: collectionName,
                color: '#3B82F6',
              });
            }
          }
        }

        // Migrate saved posts
        const savedPostsData = localStorage.getItem(storageKey);
        if (savedPostsData) {
          const posts = JSON.parse(savedPostsData);
          const postCollection = JSON.parse(localStorage.getItem(collectionsKey) || '{}').map || {};
          
          for (const post of posts) {
            // Find collection ID for this post
            const collectionName = postCollection[post.id];
            let collectionId = undefined;
            
            if (collectionName && collectionName !== 'All') {
              const collection = collections?.find(c => c.name === collectionName);
              collectionId = collection?.id;
            }
            
            await savePost.mutateAsync({
              postId: post.id,
              collectionId,
              notes: post.notes,
            });
          }
        }

        // Remove from localStorage after successful migration
        localStorage.removeItem(storageKey);
        localStorage.removeItem(collectionsKey);
      } catch (error) {
        console.warn('Failed to migrate saved posts from localStorage:', error);
      }
    },
  });

  return {
    collections,
    savedPosts,
    isLoading: isLoadingCollections || isLoadingPosts,
    createCollection: createCollection.mutate,
    savePost: savePost.mutate,
    removeSavedPost: removeSavedPost.mutate,
    updateCollection: updateCollection.mutate,
    deleteCollection: deleteCollection.mutate,
    isCreating: createCollection.isPending,
    isSaving: savePost.isPending,
    isRemoving: removeSavedPost.isPending,
    migrateFromLocalStorage: migrateFromLocalStorage.mutate,
  };
};
