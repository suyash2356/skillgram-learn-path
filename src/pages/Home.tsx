import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CommentDialog } from "@/components/CommentDialog";
import { ShareDialog } from "@/components/ShareDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Play,
  TrendingUp,
  Users,
  Plus,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useInfiniteQuery, useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";

import type { Database } from '@/integrations/supabase/types';
type Post = Database['public']['Tables']['posts']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type PostWithProfile = Post & { 
  profiles: Pick<Profile, 'full_name' | 'title' | 'avatar_url'> | null 
  likes_count: number;
  comments_count: number;
};

const Home = () => {
  const [commentDialogOpen, setCommentDialogOpen] = useState<{ open: boolean; postId: string | null }>({ open: false, postId: null });
  const [shareDialogOpen, setShareDialogOpen] = useState<{ open: boolean; post: PostWithProfile | null }>({ open: false, post: null });
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: likedPosts = new Set<string>(), } = useQuery({
    queryKey: ['userLikes', user?.id],
    queryFn: async () => {
      if (!user?.id) return new Set<string>();
      const { data, error } = await supabase.from('likes').select('post_id').eq('user_id', user.id);
      if (error) throw error;
      return new Set((data || []).map((r) => r.post_id));
    },
    enabled: !!user,
  });

  const { data: bookmarkedPosts = new Set<string>(), } = useQuery({
    queryKey: ['userBookmarks', user?.id],
    queryFn: async () => {
      if (!user?.id) return new Set<string>();
      const { data, error } = await supabase.from('bookmarks').select('post_id').eq('user_id', user.id);
      if (error) throw error;
      return new Set((data || []).map((r) => r.post_id));
    },
    enabled: !!user,
  });

  const { data: commentsData } = useQuery({
    queryKey: ['postComments', commentDialogOpen.postId],
    queryFn: async () => {
        if (!commentDialogOpen.postId) return [];
    const { data, error } = await supabase
      .from('comments')
      .select('*, profile:profiles!user_id(full_name, avatar_url)')
      .eq('post_id', commentDialogOpen.postId)
      .order('created_at', { ascending: true });
        if (error) throw error;
        return data;
    },
    enabled: !!commentDialogOpen.postId,
  });

  const pageSize = 10;

  const fetchPosts = async ({ pageParam = 0 }) => {
    const from = pageParam * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles(full_name, title, avatar_url)")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new Error("Failed to load posts: " + error.message);
    
    const posts: PostWithProfile[] = (data || []).map((post: any) => ({
      ...post,
      profiles: post.profiles ? {
        full_name: post.profiles.full_name,
        title: post.profiles.title,
        avatar_url: post.profiles.avatar_url,
      } : { full_name: '', title: '', avatar_url: '' },
      likes_count: 0,
      comments_count: 0,
    }));

    const postIds = posts.map(p => p.id);

    const [{ data: likesData }, { data: commentsData }] = await Promise.all([
        supabase.from('likes').select('post_id, user_id').in('post_id', postIds),
        supabase.from('comments').select('post_id, user_id').in('post_id', postIds)
    ]);

    const likesByPost = (likesData || []).reduce((acc, like) => {
        acc[like.post_id] = (acc[like.post_id] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const commentsByPost = (commentsData || []).reduce((acc, comment) => {
        acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const postsWithCounts = posts.map(p => ({
        ...p,
        likes_count: likesByPost[p.id] || 0,
        comments_count: commentsByPost[p.id] || 0,
    }));

    return { posts: postsWithCounts, nextPage: posts.length === pageSize ? pageParam + 1 : undefined };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingPosts,
  } = useInfiniteQuery({
    queryKey: ['feedPosts'],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 60 * 1000, // 1 minute
  });

  const feed = useMemo(() => data?.pages.flatMap(page => page.posts) || [], [data]);

  const likeMutation = useMutation({
    mutationFn: async ({ postId, hasLiked }: { postId: string, hasLiked: boolean }) => {
      if (!user) throw new Error("User not authenticated");
      if (hasLiked) {
        await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id });
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
      }
      return { postId, hasLiked };
    },
    onMutate: async ({ postId, hasLiked }) => {
        await queryClient.cancelQueries({ queryKey: ['feedPosts'] });
        const previousFeed = queryClient.getQueryData(['feedPosts']);
        queryClient.setQueryData(['feedPosts'], (oldData: any) => {
            const newData = { ...oldData };
            newData.pages = newData.pages.map((page: any) => ({
                ...page,
                posts: page.posts.map((p: any) => {
                    if (p.id === postId) {
                        return { ...p, likes_count: p.likes_count + (hasLiked ? -1 : 1) };
                    }
                    return p;
                })
            }));
            return newData;
        });
        return { previousFeed };
    },
    onError: (err, variables, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['feedPosts'], context.previousFeed);
      }
      toast({ title: "Failed to update like", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feedPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userLikes', user?.id] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("User not authenticated");
      const hasBookmarked = bookmarkedPosts.has(postId);
      if (hasBookmarked) {
        await supabase.from('bookmarks').delete().match({ post_id: postId, user_id: user.id });
        toast({ title: "Removed from saved posts" });
      } else {
        await supabase.from('bookmarks').insert({ post_id: postId, user_id: user.id });
        toast({ title: "Added to saved posts" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookmarks', user?.id] });
    },
    onError: () => {
      toast({ title: "Failed to update bookmark", variant: "destructive" });
    },
  });

  const renderContent = (raw: string | null) => {
    if (!raw) return null;
    const blocks = raw.split(/\n\n+/).slice(0, 3);
    return (
      <div className="space-y-3">
        {blocks.map((block, idx) => {
          const imgMatch = block.match(/!\[[^\]]*\]\(([^)]+)\)/);
          if (imgMatch) {
            const url = imgMatch[1];
            if (url.startsWith('data:image') || url.startsWith('http')) {
              return (
                <div key={idx} className="rounded-lg overflow-hidden border">
                  <img src={url} alt="post" className="w-full h-auto object-contain max-h-96" />
                </div>
              );
            }
          }
          if (block.startsWith('data:image')) {
            return (
              <div key={idx} className="rounded-lg overflow-hidden border">
                <img src={block} alt="post" className="w-full h-auto object-contain max-h-96" />
              </div>
            );
          }
          const urlMatch = block.match(/https?:\/\/\S+/);
          if (urlMatch) {
            const url = urlMatch[0];
            return (
              <a key={idx} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm break-all">
                <FileText className="h-4 w-4" />
                <span className="break-all">{url}</span>
              </a>
            );
          }
          return <p key={idx} className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap break-words">{block.length > 300 ? block.slice(0, 300) + '…' : block}</p>;
        })}
      </div>
    );
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 container mx-auto px-4 py-6">
        <aside className="md:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">My Roadmaps</h3>
              <div className="space-y-3">
                <Link to="/my-roadmaps" className="flex items-center justify-between text-sm hover:text-primary">
                  <span>🚀 My Learning Paths</span>
                  <Badge variant="secondary">3</Badge>
                </Link>
                <Link to="/my-roadmaps" className="flex items-center justify-between text-sm hover:text-primary">
                  <span>💡 AI Generated</span>
                  <Badge variant="secondary">1</Badge>
                </Link>
              </div>
              <Link to="/create-roadmap">
                <Button className="w-full mt-4" size="sm"><Plus className="h-4 w-4 mr-2" />Create Roadmap</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">My Communities</h3>
              <div className="space-y-3">
                <Link to="/my-communities" className="flex items-center gap-3 text-sm hover:text-primary">
                  <Avatar className="h-8 w-8"><AvatarImage src="/placeholder.svg" /><AvatarFallback>R</AvatarFallback></Avatar>
                  <span>React Developers</span>
                </Link>
                <Link to="/my-communities" className="flex items-center gap-3 text-sm hover:text-primary">
                  <Avatar className="h-8 w-8"><AvatarImage src="/placeholder.svg" /><AvatarFallback>V</AvatarFallback></Avatar>
                  <span>Vite Enthusiasts</span>
                </Link>
              </div>
              <Link to="/communities">
                <Button variant="outline" className="w-full mt-4" size="sm"><Users className="h-4 w-4 mr-2" />Explore Communities</Button>
              </Link>
            </CardContent>
          </Card>
        </aside>

        <main className="md:col-span-6 space-y-6">
          {isLoadingPosts ? (
            <div className="text-center text-muted-foreground">Loading feed...</div>
          ) : (
            feed.map((post) => (
              <Card key={post.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarImage src={post.profiles?.avatar_url || undefined} />
                      <AvatarFallback>{post.profiles?.full_name?.[0] || 'A'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{post.profiles?.full_name || 'Anonymous'}</h4>
                      <p className="text-sm text-muted-foreground">{post.profiles?.title || 'Learner'} • {new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <div className="mb-4">{renderContent(post.content)}</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{post.category || 'General'}</Badge>
                    {(post.tags || []).map((tag, i) => <Badge key={i} variant="outline">{tag}</Badge>)}
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <div className="flex items-center gap-6">
                      <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => likeMutation.mutate({ postId: post.id, hasLiked: likedPosts.has(post.id) })}>
                        <Heart className={`h-5 w-5 ${likedPosts.has(post.id) ? 'text-red-500 fill-current' : ''}`} />
                        <span>{post.likes_count}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => setCommentDialogOpen({ open: true, postId: post.id })}>
                        <MessageCircle className="h-5 w-5" />
                        <span>{post.comments_count}</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setShareDialogOpen({ open: true, post })}>
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => bookmarkMutation.mutate(post.id)}>
                      <Bookmark className={`h-5 w-5 ${bookmarkedPosts.has(post.id) ? 'text-blue-500 fill-current' : ''}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          {hasNextPage && (
            <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="w-full">
              {isFetchingNextPage ? 'Loading more...' : 'Load More'}
            </Button>
          )}
        </main>

        <aside className="md:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Trending Topics</h3>
              <div className="space-y-3">
                <Link to="/explore?q=ai" className="flex items-center gap-2 text-sm hover:text-primary"><TrendingUp className="h-4 w-4" /> AI & Machine Learning</Link>
                <Link to="/explore?q=react19" className="flex items-center gap-2 text-sm hover:text-primary"><TrendingUp className="h-4 w-4" /> React 19 Features</Link>
                <Link to="/explore?q=serverless" className="flex items-center gap-2 text-sm hover:text-primary"><TrendingUp className="h-4 w-4" /> Serverless GPUs</Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">New Videos</h3>
              <div className="space-y-4">
                <Link to="/videos/1" className="flex items-start gap-3 group">
                  <div className="relative">
                    <img src="/placeholder.svg" alt="Video thumbnail" className="w-24 h-14 rounded-md object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm leading-snug group-hover:text-primary">Full-stack Next.js 14 Tutorial</p>
                    <p className="text-xs text-muted-foreground mt-1">The Net Ninja</p>
                  </div>
                </Link>
              </div>
              <Link to="/new-videos">
                <Button variant="outline" size="sm" className="w-full mt-4">View All Videos</Button>
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
      {commentDialogOpen.open && commentDialogOpen.postId && (
        <CommentDialog
          isOpen={commentDialogOpen.open}
          onClose={() => setCommentDialogOpen({ open: false, postId: null })}
          roadmapId={commentDialogOpen.postId}
          comments={commentsData?.map(c => ({
            id: c.id,
            author: (c.profile as any)?.full_name || 'Anonymous',
            avatar: (c.profile as any)?.avatar_url,
            content: c.content,
            timestamp: new Date(c.created_at).toISOString(),
            likes: 0, // Placeholder
          })) || []}
        />
      )}
      {shareDialogOpen.open && shareDialogOpen.post && (
        <ShareDialog
          open={shareDialogOpen.open}
          onOpenChange={(open) => setShareDialogOpen({ open, post: open ? shareDialogOpen.post : null })}
          title={shareDialogOpen.post.title}
          url={`${window.location.origin}/posts/${shareDialogOpen.post.id}`}
        />
      )}
    </Layout>
  );
};

export default Home;