import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Clock, Eye, Heart, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NewVideos = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const categories = ["All", "Programming", "AI/ML", "Design", "Education", "Data Science", "Business"];

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      setVideos(data || []);
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">New Videos</h1>
            <p className="text-muted-foreground">Latest educational content just uploaded</p>
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === "All" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground whitespace-nowrap"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer">
              <CardContent className="p-0">
                {/* Video Thumbnail */}
                <div className="relative">
                  <img
                    src={video.thumbnail || ''}
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-t-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                      <Play className="h-8 w-8 text-white ml-1" fill="white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                    {video.duration || ''}
                  </div>
                  <Badge className="absolute top-2 left-2" variant="secondary">
                    {video.category || 'General'}
                  </Badge>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2 leading-tight line-clamp-2">
                    {video.title}
                  </h3>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={video.channel_avatar || '/placeholder.svg'} />
                      <AvatarFallback>{(video.channel || 'C')[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{video.channel || 'Channel'}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {video.views || ''}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {video.upload_time || ''}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-auto p-0">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More placeholder */}
        <div className="text-center py-8">
          <Button variant="outline" className="w-full max-w-sm" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Loaded' }
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NewVideos;