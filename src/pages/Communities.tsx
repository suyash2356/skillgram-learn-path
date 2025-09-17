import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageCircle, TrendingUp, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Communities = () => {
  const communities = [
    {
      id: 1,
      name: "JavaScript Developers",
      description: "A community for JavaScript enthusiasts, from beginners to experts",
      members: 25400,
      posts: 1240,
      category: "Programming",
      image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=100&h=100&fit=crop",
      isJoined: true
    },
    {
      id: 2,
      name: "Data Science Hub",
      description: "Discuss machine learning, AI, and data analysis techniques",
      members: 18700,
      posts: 890,
      category: "Data Science",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop",
      isJoined: false
    },
    {
      id: 3,
      name: "UI/UX Designers",
      description: "Share designs, get feedback, and discuss design trends",
      members: 12300,
      posts: 670,
      category: "Design",
      image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=100&h=100&fit=crop",
      isJoined: true
    },
    {
      id: 4,
      name: "Medical Students",
      description: "Study groups, resources, and support for medical education",
      members: 9800,
      posts: 450,
      category: "Education",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&h=100&fit=crop",
      isJoined: false
    }
  ];

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
          {communities.map((community) => (
            <Card key={community.id} className="shadow-card hover:shadow-elevated transition-all duration-300">
              <CardHeader className="flex flex-row items-center space-y-0 pb-3">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={community.image} />
                  <AvatarFallback>{community.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{community.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {community.category}
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
                    {community.members.toLocaleString()} members
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {community.posts} posts
                  </span>
                  <span className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Active
                  </span>
                </div>

                <Button 
                  variant={community.isJoined ? "outline" : "default"} 
                  className="w-full"
                >
                  {community.isJoined ? "Joined" : "Join Community"}
                </Button>
              </CardContent>
            </Card>
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

export default Communities;