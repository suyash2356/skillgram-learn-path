import { useEffect, useMemo, useState } from "react";
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
  ExternalLink,
  TrendingUp,
  Clock,
  Users,
  Plus
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
type DbPost = {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  category: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

type Profile = {
  user_id: string;
  full_name: string | null;
  title: string | null;
  avatar_url: string | null;
};

type FeedPost = {
  id: string;
  author: {
    name: string;
    title: string;
    avatar: string;
  };
  content: {
    type: "article";
    title: string;
    description: string;
    category: string;
    readTime?: string;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  timestamp: string;
};

const Home = () => {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [commentDialog, setCommentDialog] = useState<{ open: boolean; post: FeedPost | null }>({ open: false, post: null });
  const [shareDialog, setShareDialog] = useState<{ open: boolean; post: FeedPost | null }>({ open: false, post: null });
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const loadPosts = async (reset = false) => {
    if (isLoading) return;
    setIsLoading(true);
    const from = reset ? 0 : page * pageSize;
    const to = from + pageSize - 1;
    const { data: posts, error } = await supabase
      .from("posts")
      .select("id,user_id,title,content,category,tags,created_at,updated_at")
      .order("created_at", { ascending: false })
      .range(from, to);

      if (error) {
        toast({ title: "Failed to load posts", variant: "destructive" });
        setIsLoading(false);
        return;
      }

    const userIds = Array.from(new Set((posts || []).map(p => p.user_id)));
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id,full_name,title,avatar_url")
        .in("user_id", userIds);

      if (profilesError) {
        toast({ title: "Failed to load profiles", variant: "destructive" });
      }

      const profileByUserId = new Map<string, Profile>();
      (profiles || []).forEach(pr => profileByUserId.set(pr.user_id, pr as Profile));

      // Optionally fetch comment counts per post
      const counts = new Map<string, number>();
      await Promise.all(
        (posts || []).map(async (p) => {
          const { count } = await supabase
            .from("comments")
            .select("id", { count: "exact", head: true })
            .eq("post_id", p.id);
          counts.set(p.id, count || 0);
        })
      );

    const mapped: FeedPost[] = (posts || []).map((p: DbPost) => {
        const prof = profileByUserId.get(p.user_id);
        return {
          id: p.id,
          author: {
            name: prof?.full_name || "Anonymous",
            title: prof?.title || "Learner",
            avatar: prof?.avatar_url || "/placeholder.svg",
          },
          content: {
            type: "article",
            title: p.title,
            description: p.content || "",
            category: p.category || "General",
          },
          engagement: {
            likes: 0,
            comments: counts.get(p.id) || 0,
            shares: 0,
          },
          timestamp: new Date(p.created_at).toLocaleString(),
        };
      });

    setFeed(prev => reset ? mapped : [...prev, ...mapped]);
    setHasMoreContent((posts || []).length === pageSize);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const toggleLike = async (postId: string) => {
    if (!user) return;
    const hasLiked = likedPosts.has(postId);
    setLikedPosts(prev => {
      const s = new Set(prev);
      hasLiked ? s.delete(postId) : s.add(postId);
      return s;
    });
    if (hasLiked) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
    }
  };

  const toggleBookmark = async (postId: string) => {
    if (!user) return;
    const hasBookmarked = bookmarkedPosts.has(postId);
    setBookmarkedPosts(prev => {
      const s = new Set(prev);
      hasBookmarked ? s.delete(postId) : s.add(postId);
      return s;
    });
    if (hasBookmarked) {
      await supabase.from('bookmarks').delete().eq('post_id', postId).eq('user_id', user.id);
      toast({ title: "Removed from saved posts" });
    } else {
      await supabase.from('bookmarks').insert({ post_id: postId, user_id: user.id });
      toast({ title: "Added to saved posts" });
    }
  };

  const [currentComments, setCurrentComments] = useState<any[]>([]);

  const openComments = async (post: FeedPost) => {
    // Fetch real comments for the post
    const { data, error } = await supabase
      .from("comments")
      .select("id, content, created_at, user_id")
      .eq("post_id", post.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load comments", variant: "destructive" });
      setCurrentComments([]);
    } else {
      setCurrentComments(
        (data || []).map((c) => ({
          id: c.id,
          author: "User",
          avatar: "/placeholder.svg",
          content: c.content,
          timestamp: new Date(c.created_at).toLocaleString(),
          likes: 0,
        }))
      );
    }
    setCommentDialog({ open: true, post });
  };

  const openShare = (post: any) => {
    setShareDialog({ open: true, post });
  };

  const handleExternalLink = (post: any) => {
    // Simulate opening external content
    window.open('#', '_blank');
    toast({ title: "Opening content..." });
  };

  const handleAuthorClick = (author: any) => {
    // Navigate to author profile
    navigate('/profile');
    toast({ title: `Viewing ${author.name}'s profile` });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">

        {/* Quick Access */}
        <Card className="mb-6 shadow-card">
          <CardContent className="p-4">
            <div className="flex space-x-4 overflow-x-auto pb-2">
              <Link to="/explore" className="flex-shrink-0 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs text-muted-foreground">Trending</span>
              </Link>
              <Link to="/new-videos" className="flex-shrink-0 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-2">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs text-muted-foreground">New Videos</span>
              </Link>
              <Link to="/communities" className="flex-shrink-0 text-center">
                <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs text-muted-foreground">Communities</span>
              </Link>
              <Link to="/create-post" className="flex-shrink-0 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-2">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs text-muted-foreground">Create Post</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Feed */}
        <div className="space-y-6">
          {feed.map((post) => (
            <Card key={post.id} className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in">
              <CardContent className="p-0">
                {/* Author Header */}
                <div className="flex items-center justify-between p-4 pb-3">
                  <div 
                    className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleAuthorClick(post.author)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>
                        {post.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{post.author.name}</p>
                      <p className="text-xs text-muted-foreground">{post.author.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.content.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 pb-3">
                  <h3 className="font-semibold text-lg mb-2 leading-tight">
                    {post.content.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                    {post.content.description}
                  </p>
                </div>

                {/* Optional read time placeholder */}
                {post.content.readTime && (
                  <div className="px-4 pb-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{post.content.readTime}</span>
                    </div>
                  </div>
                )}

                {/* Engagement Actions */}
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <div className="flex items-center space-x-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center space-x-2 ${
                        likedPosts.has(post.id) ? "text-red-500" : ""
                      }`}
                      onClick={() => toggleLike(post.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${likedPosts.has(post.id) ? "fill-current" : ""}`}
                      />
                      <span className="text-sm">{post.engagement.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center space-x-2"
                      onClick={() => openComments(post)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{post.engagement.comments}</span>
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center space-x-2"
                      onClick={() => openShare(post)}
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="text-sm">{post.engagement.shares}</span>
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={bookmarkedPosts.has(post.id) ? "text-primary" : ""}
                      onClick={() => toggleBookmark(post.id)}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${bookmarkedPosts.has(post.id) ? "fill-current" : ""}`}
                      />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleExternalLink(post)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center py-8">
          <Button 
            variant="outline" 
            className="w-full max-w-sm"
            onClick={async () => { await loadPosts(false); setPage(p => p + 1); }}
            disabled={isLoading || !hasMoreContent}
          >
            {isLoading ? "Loading..." : hasMoreContent ? "Load More" : "No more posts"}
          </Button>
        </div>

        {/* Comment Dialog */}
        <CommentDialog
          open={commentDialog.open}
          onOpenChange={(open) => setCommentDialog({ open, post: null })}
          postTitle={commentDialog.post?.content?.title || ""}
          comments={currentComments}
          postId={commentDialog.post?.id || ""}
          onCommentAdded={() => {
            // Refresh comment count for that post
            if (commentDialog.post) {
              setFeed(prev => prev.map(p => p.id === commentDialog.post!.id ? {
                ...p,
                engagement: { ...p.engagement, comments: p.engagement.comments + 1 }
              } : p));
            }
          }}
        />

        {/* Share Dialog */}
        <ShareDialog
          open={shareDialog.open}
          onOpenChange={(open) => setShareDialog({ open, post: null })}
          title={shareDialog.post?.content?.title || ""}
        />
      </div>
    </Layout>
  );
};

export default Home;