import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Clock, Target, CheckCircle, Edit3, Save, X, Plus, Link as LinkIcon, Menu, Calendar,
  BookOpen, Brain, Rocket, FlaskConical, Trophy, GraduationCap, Hourglass, ListChecks,
  Book, MonitorPlay, Youtube, Globe, Codepen, Users, Mail, Award, FolderOpen, ClipboardCheck, PenLine, CalendarCheck, Lightbulb, MessageCircle, Share2, Trash2, Eye, EyeOff
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useUserFollows } from "@/hooks/useUserFollows";
import { CommentDialog } from "@/components/CommentDialog";
import { ShareLinkDialog } from "@/components/ShareLinkDialog";
import { useRoadmapTemplates } from "@/hooks/useRoadmapTemplates";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getFavicon = (url?: string | null) => {
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${host}`;
  } catch {
    return null;
  }
};

const RoadmapView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const { data: roadmap, isLoading: isLoadingRoadmap } = useQuery({
    queryKey: ['roadmap', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('roadmaps')
        .select(`
          *,
          profiles (id, full_name, avatar_url)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;

      // Manually remap profiles to user
      const roadmapData = { ...data, user: data.profiles };
      delete (roadmapData as any).profiles;

      return roadmapData;
    },
    enabled: !!id,
  });

  const { data: steps, isLoading: isLoadingSteps } = useQuery({
    queryKey: ['roadmapSteps', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('roadmap_steps')
        .select('*')
        .eq('roadmap_id', id)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: resourcesByStep, isLoading: isLoadingResources } = useQuery({
    queryKey: ['roadmapResources', id],
    queryFn: async () => {
      if (!steps || steps.length === 0) return {};
      const stepIds = steps.map(s => s.id);
      const { data, error } = await supabase
        .from('roadmap_step_resources')
        .select('*')
        .in('step_id', stepIds);
      if (error) throw error;
      return data.reduce((acc, resource) => {
        if (!acc[resource.step_id]) {
          acc[resource.step_id] = [];
        }
        acc[resource.step_id].push(resource);
        return acc;
      }, {} as Record<string, any[]>);
    },
    enabled: !!steps && steps.length > 0,
  });

  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ['roadmapComments', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('comments')
        .select('*, profile:profiles!user_id(full_name, avatar_url)')
        .eq('roadmap_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { templates, createTemplate, isLoading: isLoadingTemplate } = useRoadmapTemplates(id);
  const { isFollowing, toggleFollow } = useUserFollows(roadmap?.user_id);

  const updateRoadmapMutation = useMutation({
    mutationFn: async (updates: Partial<any>) => {
      if (!id) throw new Error("Roadmap ID not found");
      const { data, error } = await supabase.from('roadmaps').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['roadmap', id], data);
      toast({ title: "Roadmap updated!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update roadmap", description: error.message, variant: "destructive" });
    }
  });

  const updateStepMutation = useMutation({
    mutationFn: async (updates: Partial<any> & { id: string }) => {
      const { id: stepId, ...rest } = updates;
      const { data, error } = await supabase.from('roadmap_steps').update(rest).eq('id', stepId).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['roadmapSteps', id], (old: any[] | undefined) => old?.map(s => s.id === data.id ? data : s));
      if (editingStep === data.id) setEditingStep(null);
      toast({ title: "Step updated!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update step", description: error.message, variant: "destructive" });
    }
  });

  const toggleStepCompletion = (stepId: string, completed: boolean) => {
    updateStepMutation.mutate({ id: stepId, completed: completed });
    // Optimistically update progress
    const total = steps?.length || 0;
    const done = (steps || []).filter(s => (s.id === stepId ? completed : s.completed)).length;
    const newProgress = total > 0 ? Math.round((done / total) * 100) : 0;
    if (roadmap && roadmap.progress !== newProgress) {
        updateRoadmapMutation.mutate({ progress: newProgress, status: newProgress === 100 ? 'completed' : 'in-progress' });
    }
  };

  const addResourceMutation = useMutation({
    mutationFn: async ({ stepId, title, url, type }: { stepId: string, title: string, url?: string, type?: string }) => {
      const { data, error } = await supabase.from('roadmap_step_resources').insert({ step_id: stepId, title, url, type }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['roadmapResources', id], (old: Record<string, any[]> | undefined) => {
        const newRes = { ...(old || {}) };
        if (!newRes[data.step_id]) newRes[data.step_id] = [];
        newRes[data.step_id].push(data);
        return newRes;
      });
    }
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async ({ stepId, resourceId }: { stepId: string, resourceId: string }) => {
      const { error } = await supabase.from('roadmap_step_resources').delete().eq('id', resourceId);
      if (error) throw error;
      return { stepId, resourceId };
    },
    onSuccess: ({ stepId, resourceId }) => {
      queryClient.setQueryData(['roadmapResources', id], (old: Record<string, any[]> | undefined) => {
        const newRes = { ...(old || {}) };
        if (newRes[stepId]) {
          newRes[stepId] = newRes[stepId].filter(r => r.id !== resourceId);
        }
        return newRes;
      });
    }
  });

  const deleteRoadmapMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Roadmap ID not found");
      // This should ideally be a single RPC call on the backend to ensure atomicity
      const { error } = await supabase.from('roadmaps').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Roadmap deleted successfully" });
      navigate('/my-roadmaps');
      queryClient.invalidateQueries({ queryKey: ['myRoadmaps'] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete roadmap", description: error.message, variant: "destructive" });
    }
  });

  const isLoading = isLoadingRoadmap || isLoadingSteps || isLoadingResources || isLoadingComments || isLoadingTemplate;

  if (isLoading) {
    return <Layout><div>Loading roadmap...</div></Layout>;
  }

  if (!roadmap) {
    return <Layout><div>Roadmap not found.</div></Layout>;
  }

  const isOwner = user?.id === roadmap.user_id;

  const groupedSteps = (steps || []).reduce((acc, step) => {
    let phase = 'General';
    if (step.title.includes('Introduction')) phase = 'Introduction';
    else if (step.title.includes('Milestone')) phase = 'Milestone';
    else if (step.title.includes('Final Outcome')) phase = 'Final Outcome';
    else if (step.order_index < (steps?.length || 0) / 3) phase = 'Beginner';
    else if (step.order_index < ((steps?.length || 0) * 2) / 3) phase = 'Intermediate';
    else phase = 'Advanced';

    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(step);
    return acc;
  }, {} as Record<string, any[]>);

  const phaseOrder = ['Introduction', 'Beginner', 'Intermediate', 'Advanced', 'Milestone', 'Final Outcome', 'General'];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => updateRoadmapMutation.mutate({ is_public: !roadmap.is_public })}>
                {roadmap.is_public ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {roadmap.is_public ? 'Make Private' : 'Make Public'}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => deleteRoadmapMutation.mutate()}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          )}
        </div>

        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="secondary" className="mb-2">{roadmap.category || 'Learning'}</Badge>
                <CardTitle className="text-3xl font-bold">{roadmap.title}</CardTitle>
                <p className="text-muted-foreground mt-2">{roadmap.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {roadmap.user && (
                  <Link to={`/profile/${roadmap.user.id}`} className="flex items-center gap-2 text-sm font-medium">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={roadmap.user.avatar_url} />
                      <AvatarFallback>{roadmap.user.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span>{roadmap.user.full_name}</span>
                  </Link>
                )}
                {!isOwner && user && roadmap.user && (
                  <Button size="sm" variant={isFollowing ? "outline" : "default"} onClick={() => toggleFollow()}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {roadmap.estimated_time}</span>
                <span className="flex items-center gap-1"><Target className="h-4 w-4" /> {roadmap.difficulty}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Created on {new Date(roadmap.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCommentDialogOpen(true)}>
                  <MessageCircle className="h-4 w-4 mr-2" /> Comments ({comments?.length || 0})
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Progress value={roadmap.progress} className="w-full" />
              <span className="font-bold text-lg">{roadmap.progress}%</span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="steps" className="space-y-6">
          <TabsList>
            <TabsTrigger value="steps">Roadmap Steps</TabsTrigger>
            <TabsTrigger value="template">My Template</TabsTrigger>
          </TabsList>
          <TabsContent value="steps">
            {phaseOrder.map(phase => (
              groupedSteps[phase] && (
                <div key={phase} className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 border-b pb-2">{phase}</h2>
                  <Accordion type="single" collapsible className="w-full" defaultValue={phase === 'Introduction' ? `item-${groupedSteps[phase][0].id}` : undefined}>
                    {(groupedSteps[phase] || []).map((step: any) => (
                      <AccordionItem value={`item-${step.id}`} key={step.id}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-4 w-full">
                            {isOwner && <Checkbox checked={step.completed} onCheckedChange={(checked) => toggleStepCompletion(step.id, !!checked)} onClick={(e) => e.stopPropagation()} />}
                            <span className={`flex-1 text-left ${step.completed ? 'line-through text-muted-foreground' : ''}`}>{step.title}</span>
                            <Badge variant="outline">{step.duration}</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 bg-muted/40 rounded-md">
                          {editingStep === step.id ? (
                            <div className="space-y-4">
                              <Input defaultValue={step.title} onBlur={(e) => updateStepMutation.mutate({ id: step.id, title: e.target.value })} />
                              <Textarea defaultValue={step.description} onBlur={(e) => updateStepMutation.mutate({ id: step.id, description: e.target.value })} />
                              {/* Add more editable fields here */}
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => setEditingStep(null)}><Save className="h-4 w-4 mr-2" />Done</Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="mb-4">{step.description}</p>
                              {step.task && <p className="mb-4 p-2 bg-background rounded"><b>Task:</b> {step.task}</p>}
                              {step.topics && step.topics.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="font-semibold mb-2">Topics to cover:</h4>
                                  <ul className="list-disc list-inside space-y-1">
                                    {step.topics.map((topic: string, i: number) => <li key={i}>{topic}</li>)}
                                  </ul>
                                </div>
                              )}
                              <div className="mb-4">
                                <h4 className="font-semibold mb-2">Resources:</h4>
                                <div className="space-y-2">
                                  {(resourcesByStep?.[step.id] || []).map((res: any) => (
                                    <div key={res.id} className="flex items-center justify-between gap-2 p-2 bg-background rounded">
                                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                                        <img src={getFavicon(res.url)} alt="" className="h-4 w-4" />
                                        <span>{res.title}</span>
                                        <Badge variant="secondary">{res.type}</Badge>
                                      </a>
                                      {isOwner && <Button size="icon" variant="ghost" onClick={() => deleteResourceMutation.mutate({ stepId: step.id, resourceId: res.id })}><Trash2 className="h-4 w-4" /></Button>}
                                    </div>
                                  ))}
                                  {isOwner && (
                                    <Button size="sm" variant="outline" onClick={() => {
                                      const title = prompt("Resource title:");
                                      if (title) {
                                        const url = prompt("Resource URL (optional):") || undefined;
                                        const type = prompt("Resource type (e.g., video, article):") || undefined;
                                        addResourceMutation.mutate({ stepId: step.id, title, url, type });
                                      }
                                    }}><Plus className="h-4 w-4 mr-2" />Add Resource</Button>
                                  )}
                                </div>
                              </div>
                              {isOwner && <Button size="sm" variant="ghost" onClick={() => setEditingStep(step.id)}><Edit3 className="h-4 w-4 mr-2" />Edit Step</Button>}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )
            ))}
          </TabsContent>
          <TabsContent value="template">
            <Card>
              <CardHeader>
                <CardTitle>Personalized Learning Template</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Render the template sections here using the `template` state and `updateTemplate` function */}
                <p className="text-muted-foreground">Editable template coming soon. Use this space to organize your personal notes, track resources, and customize your learning journey.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <CommentDialog
        isOpen={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        roadmapId={id!}
        comments={comments?.map(c => ({
          id: c.id,
          author: (c.profile as any)?.full_name || 'Anonymous',
          avatar: (c.profile as any)?.avatar_url,
          content: c.content,
          timestamp: new Date(c.created_at).toISOString(),
          likes: 0, // You might need to fetch likes separately if needed
        })) || []}
      />
      <ShareLinkDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        link={window.location.href}
      />
    </Layout>
  );
};

export default RoadmapView;

