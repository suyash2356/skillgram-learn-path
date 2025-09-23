import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Target, CheckCircle, Edit3, Save, X, Plus, Link as LinkIcon } from "lucide-react";

const RoadmapView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [roadmap, setRoadmap] = useState<any | null>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [resourcesByStep, setResourcesByStep] = useState<Record<string, any[]>>({});

  const load = async () => {
    if (!id) return;
    setIsLoading(true);
    const { data: r, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      toast({ title: 'Failed to load roadmap', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    setRoadmap(r);
    const { data: s } = await supabase
      .from('roadmap_steps')
      .select('*')
      .eq('roadmap_id', id)
      .order('order_index', { ascending: true });
    setSteps(s || []);
    // Load resources for steps
    const all: Record<string, any[]> = {};
    await Promise.all((s || []).map(async (st) => {
      const { data: res } = await supabase
        .from('roadmap_step_resources')
        .select('*')
        .eq('step_id', st.id)
        .order('created_at', { ascending: true });
      all[st.id] = res || [];
    }));
    setResourcesByStep(all);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleStep = async (stepId: string, completed: boolean) => {
    const prev = steps;
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, completed } : s));
    const { error } = await supabase
      .from('roadmap_steps')
      .update({ completed })
      .eq('id', stepId);
    if (error) {
      toast({ title: 'Failed to update step', variant: 'destructive' });
      setSteps(prev); // revert
      return;
    }
    // Update roadmap progress
    const total = steps.length;
    const done = steps.filter(s => (s.id === stepId ? completed : s.completed)).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    setRoadmap((r: any) => ({ ...r, progress: pct, status: pct === 100 ? 'completed' : r?.status || 'in-progress' }));
    await supabase
      .from('roadmaps')
      .update({ progress: pct, status: pct === 100 ? 'completed' : 'in-progress' })
      .eq('id', id);
  };

  const saveStep = async (step: any) => {
    const { error } = await supabase
      .from('roadmap_steps')
      .update({ title: step.title, description: step.description, duration: step.duration, due_date: step.due_date, notes: step.notes })
      .eq('id', step.id);
    if (error) {
      toast({ title: 'Failed to save step', variant: 'destructive' });
      return;
    }
    setEditingStep(null);
    toast({ title: 'Step updated' });
  };

  const addResource = async (stepId: string) => {
    const title = prompt('Resource title');
    if (!title) return;
    const url = prompt('Resource URL (optional)') || null;
    const type = prompt('Type (video/article/tool) (optional)') || null;
    const { data, error } = await supabase
      .from('roadmap_step_resources')
      .insert({ step_id: stepId, title, url, type })
      .select('*');
    if (error) {
      toast({ title: 'Failed to add resource', variant: 'destructive' });
      return;
    }
    setResourcesByStep(prev => ({ ...prev, [stepId]: [ ...(prev[stepId] || []), ...(data || []) ] }));
  };

  const removeResource = async (stepId: string, resId: string) => {
    const { error } = await supabase
      .from('roadmap_step_resources')
      .delete()
      .eq('id', resId);
    if (error) {
      toast({ title: 'Failed to remove resource', variant: 'destructive' });
      return;
    }
    setResourcesByStep(prev => ({ ...prev, [stepId]: (prev[stepId] || []).filter(r => r.id !== resId) }));
  };

  const moveStep = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= steps.length) return;
    const reordered = [...steps];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);
    // Update order_index locally
    const withOrder = reordered.map((s, i) => ({ ...s, order_index: i }));
    setSteps(withOrder);
    // Persist order changes
    await Promise.all(withOrder.map(s => supabase.from('roadmap_steps').update({ order_index: s.order_index }).eq('id', s.id)));
  };

  if (!id) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/roadmaps')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Roadmaps
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{roadmap?.title || 'Roadmap'}</span>
              <Badge>{(roadmap?.status || 'not-started').replace('-', ' ')}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">{roadmap?.description}</p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="flex items-center"><Target className="h-3 w-3 mr-1" />{roadmap?.category || 'General'}</span>
              <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{roadmap?.estimated_time || ''}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{roadmap?.progress || 0}%</span>
              </div>
              <Progress value={roadmap?.progress || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card mt-6">
          <CardHeader>
            <CardTitle>Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && (
              <div className="text-sm text-muted-foreground">Loading...</div>
            )}
            {steps.map((step, idx) => (
              <div key={step.id} className="p-3 border rounded-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox id={step.id} checked={!!step.completed} onCheckedChange={(v) => toggleStep(step.id, !!v)} />
                    <div>
                      {editingStep === step.id ? (
                        <>
                          <input className="font-medium bg-transparent border-b outline-none" value={step.title} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, title: e.target.value } : s))} />
                          <div className="text-xs text-muted-foreground mt-1">
                            <input className="bg-transparent border-b outline-none w-full" value={step.description || ''} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, description: e.target.value } : s))} placeholder="Description" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium">{idx + 1}. {step.title}</div>
                          <div className="text-xs text-muted-foreground">{step.description}</div>
                        </>
                      )}
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        <div>
                          <span className="mr-1">Duration:</span>
                          {editingStep === step.id ? (
                            <input className="bg-transparent border-b outline-none w-24" value={step.duration || ''} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, duration: e.target.value } : s))} />
                          ) : (
                            <span>{step.duration || ''}</span>
                          )}
                        </div>
                        <div>
                          <span className="mr-1">Due:</span>
                          {editingStep === step.id ? (
                            <input type="date" className="bg-transparent border-b outline-none" value={step.due_date || ''} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, due_date: e.target.value } : s))} />
                          ) : (
                            <span>{step.due_date ? new Date(step.due_date).toLocaleDateString() : ''}</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        {editingStep === step.id ? (
                          <textarea className="w-full bg-transparent border rounded p-2 text-xs" rows={2} placeholder="Notes" value={step.notes || ''} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, notes: e.target.value } : s))} />
                        ) : (
                          step.notes && <div className="text-xs">{step.notes}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingStep === step.id ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => saveStep(step)}><Save className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingStep(null)}><X className="h-4 w-4" /></Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setEditingStep(step.id)}><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => moveStep(idx, -1)} disabled={idx === 0}>↑</Button>
                        <Button variant="ghost" size="sm" onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1}>↓</Button>
                      </>
                    )}
                    {step.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                </div>
                {/* Resources */}
                <div className="mt-3 pl-7">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium">Resources</div>
                    <Button variant="ghost" size="sm" onClick={() => addResource(step.id)}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-1 mt-1">
                    {(resourcesByStep[step.id] || []).map((res) => (
                      <div key={res.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-3 w-3" />
                          <a href={res.url || '#'} target="_blank" rel="noreferrer" className="underline">
                            {res.title}
                          </a>
                          {res.type && <Badge variant="outline">{res.type}</Badge>}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeResource(step.id, res.id)}>Remove</Button>
                      </div>
                    ))}
                    {(resourcesByStep[step.id] || []).length === 0 && (
                      <div className="text-xs text-muted-foreground">No resources yet.</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(!isLoading && steps.length === 0) && (
              <div className="text-sm text-muted-foreground">No steps yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RoadmapView;

