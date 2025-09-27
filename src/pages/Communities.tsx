import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageCircle, TrendingUp, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useCommunityMembership } from "@/hooks/useCommunityMembership";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Communities = () => {
  const { user } = useAuth();
  // const [communities, setCommunities] = useState<any[]>([]);
  // const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  const { data: communities, isLoading: isLoadingCommunities, error: communitiesError } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          community_members(count)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return data?.map(comm => ({
        ...comm,
        member_count: comm.community_members[0]?.count || 0
      })) || [];
    },
    staleTime: 1 * 60 * 1000,
  });

  // useEffect(() => {
  //   const load = async () => {
  //     const { data: comms } = await supabase
  //       .from('communities')
  //       .select('*')
  //       .order('created_at', { ascending: false })
  //       .limit(50);
  //     setCommunities(comms || []);

  //     if (user) {
  //       const { data: memberships } = await supabase
  //         .from('community_members')
  //         .select('community_id')
  //         .eq('user_id', user.id);
  //       setJoinedIds(new Set((memberships || []).map(m => m.community_id)));
  //     }
  //   };
  //   load();
  // }, [user]);

  // const toggleJoin = async (communityId: string) => {
  //   if (!user) return;
  //   const isJoined = joinedIds.has(communityId);
  //   if (isJoined) {
  //     await supabase
  //       .from('community_members')
  //       .delete()
  //       .eq('community_id', communityId)
  //       .eq('user_id', user.id);
  //     setJoinedIds(prev => {
  //       const s = new Set(prev);
  //       s.delete(communityId);
  //       return s;
  //     });
  //   } else {
  //     await supabase
  //       .from('community_members')
  //       .insert({ community_id: communityId, user_id: user.id });
  //     setJoinedIds(prev => new Set(prev).add(communityId));
  //   }
  // };

  if (isLoadingCommunities) return <Layout><div className="container mx-auto px-4 py-6 text-center">Loading communities...</div></Layout>;
  if (communitiesError) return <Layout><div className="container mx-auto px-4 py-6 text-red-500">Error: {communitiesError.message}</div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Communities</h1>
            <p className="text-muted-foreground">Connect with like-minded learners</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Community
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(communities || []).map((community: any) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>

        {/* Popular Topics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Popular Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["React", "Python", "Machine Learning", "UI Design", "DevOps", "Medical Study", "Web Development", "Data Analysis"].map((topic) => (
                <Badge key={topic} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

interface CommunityCardProps {
  community: any;
}

const CommunityCard = ({ community }: CommunityCardProps) => {
  const { isMember, isLoadingMembershipStatus, toggleMembership } = useCommunityMembership(community.id);
  const { user } = useAuth();

  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
      <CardHeader className="flex flex-row items-center space-y-0 pb-3">
        <Avatar className="h-12 w-12 mr-3">
          <AvatarImage src={community.image || ''} />
          <AvatarFallback>{community.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg">{community.name}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {community.category || 'General'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">
          {community.description}
        </p>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {community.member_count} members
          </span>
          <span className="flex items-center">
            <MessageCircle className="h-4 w-4 mr-1" />
            {(community.posts_count || 0)} posts
          </span>
          <span className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            Active
          </span>
        </div>

        <Button 
          variant={isMember ? "outline" : "default"} 
          className="w-full"
          onClick={toggleMembership}
          disabled={isLoadingMembershipStatus || !user}
        >
          {isMember ? "Joined" : "Join Community"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Communities;