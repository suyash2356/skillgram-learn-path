import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/useNotifications";

export function useUserFollows(targetUserId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUserId = user?.id;

  const { data: isFollowing, isLoading: isLoadingFollowStatus } = useQuery({
    queryKey: ['isFollowing', currentUserId, targetUserId],
    queryFn: async () => {
      if (!currentUserId || !targetUserId || currentUserId === targetUserId) return false;
      const { count, error } = await supabase
        .from('followers')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);

      if (error) throw new Error("Failed to fetch follow status");
      return (count || 0) > 0;
    },
    enabled: !!currentUserId && !!targetUserId && currentUserId !== targetUserId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const toggleFollow = useCallback(async () => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      toast({ title: "Cannot follow yourself or unauthenticated", variant: "destructive" });
      return;
    }

    // Optimistic update
    queryClient.setQueryData(['isFollowing', currentUserId, targetUserId], (old: boolean | undefined) => !old);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId);
        if (error) throw new Error(error.message);
        toast({ title: "Unfollowed user" });
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert({ follower_id: currentUserId, following_id: targetUserId });
        if (error) throw new Error(error.message);
        toast({ title: "Following user" });

        // Send notification to the followed user
        // You'd typically fetch the follower's name from their profile table
        // For simplicity, we'll use a generic message or try to get a display name
        const { data: followerProfile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', currentUserId)
          .single();

        await supabase.from('notifications').insert({
          user_id: targetUserId,
          type: 'follow',
          title: `${followerProfile?.display_name || 'Someone'} started following you!`,
          body: `You now have a new follower: ${followerProfile?.display_name || 'Someone'}`,
          data: { followerId: currentUserId, followerName: followerProfile?.display_name || 'Someone' },
        });

      }
    } catch (e: any) {
      // Revert optimistic update on error
      queryClient.setQueryData(['isFollowing', currentUserId, targetUserId], (old: boolean | undefined) => !old);
      toast({ title: `Failed to toggle follow: ${e.message}`, variant: "destructive" });
    } finally {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries(['isFollowing', currentUserId, targetUserId]);
      // Also invalidate queries that depend on follow counts if you implement them
    }
  }, [currentUserId, targetUserId, isFollowing, toast, queryClient]);

  // Optionally fetch followers/following counts for a profile
  const { data: followerCount, isLoading: isLoadingFollowerCount } = useQuery({
    queryKey: ['followerCount', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return 0;
      const { count, error } = await supabase
        .from('followers')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', targetUserId);
      if (error) throw new Error("Failed to fetch follower count");
      return count || 0;
    },
    enabled: !!targetUserId,
    staleTime: 1 * 60 * 1000,
  });

  const { data: followingCount, isLoading: isLoadingFollowingCount } = useQuery({
    queryKey: ['followingCount', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return 0;
      const { count, error } = await supabase
        .from('followers')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', targetUserId);
      if (error) throw new Error("Failed to fetch following count");
      return count || 0;
    },
    enabled: !!targetUserId,
    staleTime: 1 * 60 * 1000,
  });

  return {
    isFollowing: isFollowing || false,
    isLoadingFollowStatus,
    toggleFollow,
    followerCount: followerCount || 0,
    isLoadingFollowerCount,
    followingCount: followingCount || 0,
    isLoadingFollowingCount,
  };
}
