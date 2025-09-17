import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CommentDialog } from "@/components/CommentDialog";
import { ShareDialog } from "@/components/ShareDialog";
import { useToast } from "@/hooks/use-toast";
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

const feedData = [
  {
    id: 1,
    author: {
      name: "Dr. Sarah Chen",
      username: "@sarahchen",
      avatar: "/placeholder.svg",
      title: "AI Research Scientist"
    },
    content: {
      type: "article",
      title: "The Future of Machine Learning: Trends to Watch in 2024",
      description: "Exploring the latest developments in AI and their impact on various industries. From transformer models to quantum computing integration.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
      readTime: "8 min read",
      category: "AI/ML"
    },
    engagement: {
      likes: 342,
      comments: 28,
      shares: 15
    },
    timestamp: "2 hours ago"
  },
  {
    id: 2,
    author: {
      name: "Tech Academy",
      username: "@techacademy",
      avatar: "/placeholder.svg",
      title: "Educational Platform"
    },
    content: {
      type: "video",
      title: "Complete Python Data Science Roadmap 2024",
      description: "A comprehensive guide covering everything from basics to advanced topics. Perfect for beginners and intermediate learners.",
      thumbnail: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=600&h=400&fit=crop",
      duration: "45:30",
      category: "Programming"
    },
    engagement: {
      likes: 892,
      comments: 67,
      shares: 234
    },
    timestamp: "4 hours ago"
  },
  {
    id: 3,
    author: {
      name: "DevOps Master",
      username: "@devopsmaster",
      avatar: "/placeholder.svg",
      title: "Senior DevOps Engineer"
    },
    content: {
      type: "resource",
      title: "Top 10 DevOps Tools Every Developer Should Know",
      description: "Curated list of essential DevOps tools with hands-on tutorials and implementation guides.",
      resources: [
        { name: "Docker", type: "Containerization" },
        { name: "Kubernetes", type: "Orchestration" },
        { name: "Jenkins", type: "CI/CD" }
      ],
      category: "DevOps"
    },
    engagement: {
      likes: 456,
      comments: 34,
      shares: 89
    },
    timestamp: "6 hours ago"
  },
  {
    id: 4,
    author: {
      name: "Design Hub",
      username: "@designhub",
      avatar: "/placeholder.svg",
      title: "UX/UI Community"
    },
    content: {
      type: "course",
      title: "UI/UX Design Fundamentals - Complete Certification Course",
      description: "Master the principles of user experience and interface design. Includes real-world projects and portfolio guidance.",
      image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&h=400&fit=crop",
      price: "Free",
      students: "12.5k",
      rating: 4.8,
      category: "Design"
    },
    engagement: {
      likes: 678,
      comments: 45,
      shares: 156
    },
    timestamp: "8 hours ago"
  }
];

const additionalFeedData = [
  {
    id: 5,
    author: {
      name: "Code Master",
      username: "@codemaster",
      avatar: "/placeholder.svg",
      title: "Full Stack Developer"
    },
    content: {
      type: "article",
      title: "Building Scalable React Applications: Best Practices",
      description: "Learn the essential patterns and practices for building maintainable and scalable React applications in 2024.",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop",
      readTime: "12 min read",
      category: "React"
    },
    engagement: {
      likes: 523,
      comments: 41,
      shares: 87
    },
    timestamp: "10 hours ago"
  },
  {
    id: 6,
    author: {
      name: "Data Science Hub",
      username: "@datascience",
      avatar: "/placeholder.svg",
      title: "Data Analytics Team"
    },
    content: {
      type: "video",
      title: "Machine Learning for Beginners - Complete Course",
      description: "Start your journey in machine learning with this comprehensive beginner-friendly course covering all fundamentals.",
      thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop",
      duration: "2:15:30",
      category: "Data Science"
    },
    engagement: {
      likes: 1247,
      comments: 89,
      shares: 312
    },
    timestamp: "12 hours ago"
  },
  {
    id: 7,
    author: {
      name: "Web Dev Pro",
      username: "@webdevpro",
      avatar: "/placeholder.svg",
      title: "Senior Frontend Engineer"
    },
    content: {
      type: "resource",
      title: "Essential CSS Grid and Flexbox Resources",
      description: "Curated collection of the best resources to master CSS Grid and Flexbox layouts.",
      resources: [
        { name: "CSS Grid Generator", type: "Tool" },
        { name: "Flexbox Guide", type: "Documentation" },
        { name: "Layout Examples", type: "Templates" }
      ],
      category: "CSS"
    },
    engagement: {
      likes: 334,
      comments: 22,
      shares: 67
    },
    timestamp: "14 hours ago"
  },
  {
    id: 8,
    author: {
      name: "Career Coach",
      username: "@careercoach",
      avatar: "/placeholder.svg",
      title: "Tech Career Advisor"
    },
    content: {
      type: "course",
      title: "Landing Your First Tech Job - Complete Guide",
      description: "Everything you need to know about breaking into the tech industry, from resume tips to interview preparation.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
      price: "$49",
      students: "8.2k",
      rating: 4.9,
      category: "Career"
    },
    engagement: {
      likes: 892,
      comments: 156,
      shares: 234
    },
    timestamp: "16 hours ago"
  }
];

const Home = () => {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<number>>(new Set());
  const [commentDialog, setCommentDialog] = useState<{ open: boolean; post: any }>({ open: false, post: null });
  const [shareDialog, setShareDialog] = useState<{ open: boolean; post: any }>({ open: false, post: null });
  const [feed, setFeed] = useState(feedData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadMoreContent = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add more content to feed
    const newPosts = additionalFeedData.map(post => ({
      ...post,
      id: post.id + feed.length // Ensure unique IDs
    }));
    
    setFeed(prevFeed => [...prevFeed, ...newPosts]);
    setHasMoreContent(false); // No more content after this load
    setIsLoading(false);
    
    toast({ title: "New content loaded!" });
  };


  const toggleLike = (postId: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleBookmark = (postId: number) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        toast({ title: "Removed from saved posts" });
      } else {
        newSet.add(postId);
        toast({ title: "Added to saved posts" });
      }
      return newSet;
    });
  };

  const openComments = (post: any) => {
    const comments = [
      {
        id: 1,
        author: "John Doe",
        avatar: "/placeholder.svg",
        content: "Great content! Very helpful for understanding the concepts.",
        timestamp: "2 hours ago",
        likes: 5
      },
      {
        id: 2,
        author: "Sarah Wilson",
        avatar: "/placeholder.svg", 
        content: "Thanks for sharing this. Looking forward to more content like this.",
        timestamp: "1 hour ago",
        likes: 2
      }
    ];
    setCommentDialog({ open: true, post: { ...post, comments } });
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

                {/* Media Content */}
                {post.content.type === "video" && (
                  <div className="relative mx-4 mb-4">
                    <img
                      src={post.content.thumbnail}
                      alt={post.content.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                      <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                        <Play className="h-8 w-8 text-white ml-1" fill="white" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {post.content.duration}
                    </div>
                  </div>
                )}

                {(post.content.type === "article" || post.content.type === "course") && post.content.image && (
                  <div className="mx-4 mb-4">
                    <img
                      src={post.content.image}
                      alt={post.content.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Course specific content */}
                {post.content.type === "course" && (
                  <div className="px-4 pb-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{post.content.students} students</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>⭐</span>
                          <span>{post.content.rating}</span>
                        </span>
                      </div>
                      <Badge variant="outline" className="text-success border-success">
                        {post.content.price}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Resource specific content */}
                {post.content.type === "resource" && post.content.resources && (
                  <div className="px-4 pb-3">
                    <div className="grid grid-cols-1 gap-2">
                      {post.content.resources.slice(0, 3).map((resource, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="font-medium text-sm">{resource.name}</span>
                          <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Article specific content */}
                {post.content.type === "article" && post.content.readTime && (
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
                      <span className="text-sm">{post.engagement.likes}</span>
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
        {hasMoreContent && (
          <div className="text-center py-8">
            <Button 
              variant="outline" 
              className="w-full max-w-sm"
              onClick={loadMoreContent}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More Content"}
            </Button>
          </div>
        )}

        {/* Comment Dialog */}
        <CommentDialog
          open={commentDialog.open}
          onOpenChange={(open) => setCommentDialog({ open, post: null })}
          postTitle={commentDialog.post?.content?.title || ""}
          comments={commentDialog.post?.comments || []}
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