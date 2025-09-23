import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Map, 
  Plus, 
  Calendar, 
  Clock, 
  Star, 
  Play,
  CheckCircle,
  Circle,
  MoreHorizontal,
  Edit,
  Trash2,
  Share2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const MyRoadmaps = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setIsLoading(true);
      const { data, error } = await supabase
        .from('roadmaps')
        .select('id,title,description,category,difficulty,status,progress,estimated_time,technologies,created_at,updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        toast({ title: 'Failed to load roadmaps', variant: 'destructive' });
      } else {
        setRoadmaps(data || []);
      }
      setIsLoading(false);
    };
    load();
  }, [user, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'not-started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filterRoadmaps = (status: string) => {
    if (status === 'all') return roadmaps;
    return roadmaps.filter(roadmap => roadmap.status === status);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Learning Roadmaps</h1>
            <p className="text-muted-foreground">
              Track your progress and manage your learning journey
            </p>
          </div>
          <Button asChild>
            <Link to="/create-roadmap">
              <Plus className="h-4 w-4 mr-2" />
              Create New Roadmap
            </Link>
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{roadmaps.length}</div>
              <div className="text-sm text-muted-foreground">Total Roadmaps</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {roadmaps.filter(r => r.status === 'in-progress').length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {roadmaps.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(roadmaps.reduce((acc, r) => acc + r.progress, 0) / roadmaps.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Progress</div>
            </CardContent>
          </Card>
        </div>

        {/* Roadmaps */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({roadmaps.length})</TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress ({roadmaps.filter(r => r.status === 'in-progress').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({roadmaps.filter(r => r.status === 'completed').length})
            </TabsTrigger>
            <TabsTrigger value="not-started">
              Not Started ({roadmaps.filter(r => r.status === 'not-started').length})
            </TabsTrigger>
          </TabsList>

          {['all', 'in-progress', 'completed', 'not-started'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {filterRoadmaps(status).map((roadmap) => (
                  <Card key={roadmap.id} className="shadow-card hover:shadow-elevated transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-lg leading-tight">
                            {roadmap.title}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {roadmap.category || 'General'}
                            </Badge>
                            <Badge className={getStatusColor(roadmap.status)}>
                              {roadmap.status.replace('-', ' ')}
                            </Badge>
                            <Badge className={getDifficultyColor(roadmap.difficulty)}>
                              {roadmap.difficulty || 'Beginner'}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm">
                        {roadmap.description}
                      </p>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{roadmap.progress || 0}%</span>
                        </div>
                        <Progress value={roadmap.progress || 0} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span></span>
                          <span>{roadmap.status === 'completed' ? 'Completed!' : (roadmap.estimated_time || '')}</span>
                        </div>
                      </div>

                      {/* Technologies */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Technologies</div>
                        <div className="flex flex-wrap gap-1">
                          {(roadmap.technologies || []).map((tech: string) => (
                            <Badge key={tech} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Created {new Date(roadmap.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Updated {new Date(roadmap.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          className="flex-1" 
                          variant={roadmap.status === 'completed' ? 'secondary' : 'default'}
                          onClick={() => window.location.href = `/roadmaps/${roadmap.id}`}
                        >
                          {roadmap.status === 'completed' ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Review
                            </>
                          ) : roadmap.status === 'not-started' ? (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Start Learning
                            </>
                          ) : (
                            <>
                              <Circle className="h-4 w-4 mr-2" />
                              Continue
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = `/roadmaps/${roadmap.id}`}>
                          <Map className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filterRoadmaps(status).length === 0 && (
                <div className="text-center py-12">
                  <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No roadmaps found</h3>
                  <p className="text-muted-foreground mb-4">
                    {status === 'all' 
                      ? "Create your first learning roadmap to get started"
                      : `No ${status.replace('-', ' ')} roadmaps found`
                    }
                  </p>
                  {status === 'all' && (
                    <Button asChild>
                      <Link to="/create-roadmap">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Roadmap
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyRoadmaps;