import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const usePostCollections = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const getCollections = async () => {
        if (!user) return [];
        const { data, error } = await supabase
            .from('post_collections')
            .select('*')
            .eq('user_id', user.id);
        if (error) throw error;
        return data;
    };

    const addCollection = async (name: string) => {
        if (!user) throw new Error('User not authenticated');
        const { data, error } = await supabase
            .from('post_collections')
            .insert({ user_id: user.id, name })
            .select()
            .single();
        if (error) throw error;
        return data;
    };

    const deleteCollection = async (id: string) => {
        const { error } = await supabase
            .from('post_collections')
            .delete()
            .eq('id', id);
        if (error) throw error;
    };

    const assignPostToCollection = async ({ postId, collectionId }: { postId: string, collectionId: string | null }) => {
        const { error } = await supabase
            .from('posts')
            .update({ post_collection_id: collectionId })
            .eq('id', postId);
        if (error) throw error;
    };

    const collectionsQuery = useQuery({
        queryKey: ['postCollections', user?.id],
        queryFn: getCollections,
        enabled: !!user,
    });

    const addMutation = useMutation({
        mutationFn: addCollection,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['postCollections', user?.id] });
            toast({ title: 'Collection added' });
        },
        onError: (error: any) => {
            toast({ title: 'Failed to add collection', description: error.message, variant: 'destructive' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCollection,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['postCollections', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['posts', user?.id] }); // To refetch posts
            toast({ title: 'Collection deleted' });
        },
        onError: (error: any) => {
            toast({ title: 'Failed to delete collection', description: error.message, variant: 'destructive' });
        },
    });

    const assignMutation = useMutation({
        mutationFn: assignPostToCollection,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts', user?.id] });
        },
        onError: (error: any) => {
            toast({ title: 'Failed to assign collection', description: error.message, variant: 'destructive' });
        },
    });

    return {
        collections: collectionsQuery.data,
        isLoading: collectionsQuery.isLoading,
        addCollection: addMutation.mutate,
        deleteCollection: deleteMutation.mutate,
        assignPostToCollection: assignMutation.mutate,
    };
};
