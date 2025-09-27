import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useCommunityMembership(communityId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUserId = user?.id;

  const { data: isMember, isLoading: isLoadingMembershipStatus } = useQuery({
    queryKey: ['isCommunityMember', currentUserId, communityId],
    queryFn: async () => {
      if (!currentUserId || !communityId) return false;
      const { count, error } = await supabase
        .from('community_members')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', currentUserId)
        .eq('community_id', communityId);

      if (error) throw new Error("Failed to fetch membership status");
      return (count || 0) > 0;
    },
    enabled: !!currentUserId && !!communityId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const toggleMembership = useCallback(async () => {
    if (!currentUserId || !communityId) {
      toast({ title: "Authentication required or invalid community", variant: "destructive" });
      return;
    }

    // Optimistic update
    queryClient.setQueryData(['isCommunityMember', currentUserId, communityId], (old: boolean | undefined) => !old);
    
    try {
      if (isMember) {
        // Leave community
        const { error } = await supabase
          .from('community_members')
          .delete()
          .eq('user_id', currentUserId)
          .eq('community_id', communityId);
        if (error) throw new Error(error.message);
        toast({ title: "Left community" });
      } else {
        // Join community
        const { error } = await supabase
          .from('community_members')
          .insert({ user_id: currentUserId, community_id: communityId });
        if (error) throw new Error(error.message);
        toast({ title: "Joined community" });
      }
    } catch (e: any) {
      // Revert optimistic update on error
      queryClient.setQueryData(['isCommunityMember', currentUserId, communityId], (old: boolean | undefined) => !old);
      toast({ title: `Failed to toggle membership: ${e.message}`, variant: "destructive" });
    } finally {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries(['isCommunityMember', currentUserId, communityId]);
      // Also invalidate the 'joinedCommunities' query in MyCommunities.tsx
      queryClient.invalidateQueries(['joinedCommunities', currentUserId]);
      // Invalidate the overall communities list to update member counts
      queryClient.invalidateQueries(['communities']);
    }
  }, [currentUserId, communityId, isMember, toast, queryClient]);

  return {
    isMember: isMember || false,
    isLoadingMembershipStatus,
    toggleMembership,
  };
}

