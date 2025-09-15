import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Play,
  ExternalLink,
  TrendingUp,
  Clock,
  Users
} from "lucide-react";

const Home = () => {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<number>>(new Set());

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
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Stories/Quick Access */}
        <Card className="mb-6 shadow-card">
          <CardContent className="p-4">
            <div className="flex space-x-4 overflow-x-auto pb-2">
              <div className="flex-shrink-0 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs text-muted-foreground">Trending</span>
              </div>
              <div className="flex-shrink-0 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-2">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs text-muted-foreground">New Videos</span>
              </div>
              <div className="flex-shrink-0 text-center">
                <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs text-muted-foreground">Communities</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feed */}
        <div className="space-y-6">
          {feedData.map((post) => (
            <Card key={post.id} className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in">
              <CardContent className="p-0">
                {/* Author Header */}
                <div className="flex items-center justify-between p-4 pb-3">
                  <div className="flex items-center space-x-3">
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

                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{post.engagement.comments}</span>
                    </Button>

                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
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
                    <Button variant="ghost" size="sm">
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
          <Button variant="outline" className="w-full max-w-sm">
            Load More Content
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Home;