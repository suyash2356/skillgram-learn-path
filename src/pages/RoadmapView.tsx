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
import { ArrowLeft, Clock, Target, CheckCircle, Edit3, Save, X, Plus, Link as LinkIcon, Menu, Calendar, BookOpen, Brain, Rocket, FlaskConical, Trophy } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TypedSupabaseClient } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// import { useRef } from "react"; // Not needed for Notion clone

const rawSupabase = supabase;
const supabaseTyped = rawSupabase as TypedSupabaseClient;

// Helper function to bypass Supabase type inference issues
const getTypedTable = <T extends keyof Database['public']['Tables']>(tableName: T) => {
  return supabaseTyped.from(tableName as any);
};

const getFavicon = (url?: string | null) => {
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${host}`;
  } catch {
    return null;
  }
};

// Icons for phases to mimic Notion's visual cues
const phaseIcons: Record<string, JSX.Element> = {
  'Introduction': <BookOpen className="h-5 w-5" />,
  'Beginner': <Brain className="h-5 w-5" />,
  'Intermediate': <Target className="h-5 w-5" />,
  'Advanced': <Rocket className="h-5 w-5" />,
  'Milestone': <Trophy className="h-5 w-5" />,
  'Final Outcome': <CheckCircle className="h-5 w-5" />,
  'General': <FlaskConical className="h-5 w-5" />,
};

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
  const [isRebuilding, setIsRebuilding] = useState(false);
  // const [selectedStepId, setSelectedStepId] = useState<string | null>(null); // Not needed for Notion clone
  // const [overlaySide, setOverlaySide] = useState<'above' | 'below'>('above'); // Not needed for Notion clone
  // const roadWrapperRef = useRef<HTMLDivElement | null>(null); // Not needed for Notion clone
  // const svgRef = useRef<SVGSVGElement | null>(null); // Not needed for Notion clone

  const buildPromptFromRoadmap = (r: any) => {
    const skillLabel = (r?.difficulty || '').toLowerCase();
    const time = r?.estimated_time || '';
    const focusAreas = Array.isArray(r?.technologies) ? r.technologies : [];
    let prompt = `Generate a detailed learning roadmap for "${r?.title || 'Personalized Learning Roadmap'}".\n\n`;
    prompt += `Objective: ${r?.description || 'A comprehensive learning path tailored to your needs.'}.\n`;
    prompt += `Current Skill Level: ${skillLabel || 'Not specified'}.\n`;
    prompt += `Weekly Time Commitment: ${time || 'Not specified'}.\n`;
    if (focusAreas.length > 0) prompt += `Key Focus Areas: ${focusAreas.join(', ')}.\n`;
    return prompt;
  };

  const generatePhases = (prompt: string) => {
    const titleMatch = prompt.match(/Generate a detailed learning roadmap for "(.*?)"/);
    const title = titleMatch ? titleMatch[1] : 'Personalized Learning Roadmap';
    const estimatedDurationMatch = prompt.match(/Weekly Time Commitment: (.*?)\./);
    const rawEstimatedTime = estimatedDurationMatch ? estimatedDurationMatch[1] : '5-10 hours per week';
    let totalWeeks = 12;
    if (rawEstimatedTime.includes('2-5')) totalWeeks = 16;
    else if (rawEstimatedTime.includes('10-15')) totalWeeks = 8;
    else if (rawEstimatedTime.includes('15+')) totalWeeks = 6;
    const focusAreasMatch = prompt.match(/Key Focus Areas: (.*?)\./);
    const focusAreas = focusAreasMatch ? focusAreasMatch[1].split(', ').map(s => s.trim()) : [];
    const phases: any[] = [];
    let currentWeek = 1;
    phases.push({
      name: 'Introduction: Getting Started',
      description: `Embark on your journey to master ${title.replace(' Learning Roadmap', '')}. This phase will establish foundational knowledge.`,      duration: '1 week',
      topics: [
        `Understanding the basics of ${title.replace(' Learning Roadmap', '')}`,
        'Setting up your environment',
        'Core concepts and terminology',
      ],
      task: 'Complete a "Hello World" equivalent project.',
      resources: [],
    });
    currentWeek++;
    while (currentWeek <= totalWeeks) {
      let name = '';
      let description = '';
      let topics: string[] = [];
      let task = '';
      if (currentWeek <= totalWeeks / 3) {
        name = `Week ${currentWeek}: Fundamentals`;
        description = 'Deep dive into foundational concepts and basic syntax.';
        topics = [
          `Fundamental concepts of ${title.replace(' Learning Roadmap', '')}`,
          'Basic data structures and algorithms',
          'Control flow and functions',
        ];
        if (focusAreas.length > 0) topics.push(`Introduction to ${focusAreas[0]} concepts`);
        task = 'Implement a simple calculator or data manipulation script.';
      } else if (currentWeek <= (totalWeeks * 2) / 3) {
        name = `Week ${currentWeek}: Intermediate Concepts`;
        description = 'Develop core skills with practical application and problem-solving.';
        topics = [
          'OOP or advanced paradigms',
          'API integration',
          'Error handling and debugging',
        ];
        if (focusAreas.length > 0) topics.push(`Intermediate ${focusAreas[0]} techniques`);
        task = 'Build a small web app or a data analysis pipeline.';
      } else {
        name = `Week ${currentWeek}: Advanced Topics & Specialization`;
        description = 'Master complex areas and explore specialized topics.';
        topics = [
          'Advanced patterns or architecture',
          'Performance optimization and scaling',
          'Security best practices',
        ];
        if (focusAreas.length > 0) topics.push(`Advanced ${focusAreas[0]} concepts and tools`);
        task = 'Lead a significant feature or complex project.';
      }
      phases.push({ name, description, duration: '1 week', topics, task, resources: [] });
      if (currentWeek % 4 === 0 && currentWeek < totalWeeks) {
        phases.push({
          name: `Milestone: End of Week ${currentWeek}`,
          description: 'Key achievements and progress markers.',
          duration: 'N/A',
          type: 'milestone',
          topics: ['Skills gained', 'Projects completed'],
        });
      }
      currentWeek++;
    }
    phases.push({
      name: 'Final Outcome: Mastery Achieved',
      description: 'Congratulations! You completed your journey.',
      duration: 'N/A',
      type: 'final-outcome',
      topics: ['Skills mastered', 'Certifications readiness', 'Portfolio projects'],
    });
    return phases;
  };

  const rebuildSteps = async () => {
    if (!roadmap?.id) return;
    try {
      setIsRebuilding(true);
      const prompt = buildPromptFromRoadmap(roadmap);
      const phases = generatePhases(prompt);
      let order = 0;
      for (const phase of phases) {
        const { data: stepRows, error: stepErr } = await supabase
          .from('roadmap_steps')
          .insert({
            roadmap_id: roadmap.id,
            title: phase.name,
            description: phase.description,
            order_index: order,
            duration: phase.duration,
            completed: false,
            topics: phase.topics || null,
            task: phase.task || null,
          })
          .select('id');
        if (stepErr) {
          console.error('Failed to insert step:', stepErr);
          continue;
        }
        const stepId = stepRows?.[0]?.id;
        order++;
        if (stepId && Array.isArray(phase.resources) && phase.resources.length > 0) {
          const payload = phase.resources.map((res: any) => ({
            step_id: stepId,
            title: res.title,
            url: res.url || null,
            type: res.type || null,
          }));
          const { error: resErr } = await supabase.from('roadmap_step_resources').insert(payload);
          if (resErr) console.error('Failed to insert resources:', resErr);
        }
      }
      await load();
      toast({ title: 'Steps rebuilt', description: 'We generated steps for this roadmap.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to rebuild steps', variant: 'destructive' });
    } finally {
      setIsRebuilding(false);
    }
  };

  const load = async () => {
    if (!id) return;
    setIsLoading(true);

    const { data: r, error: roadmapError } = await supabase.from('roadmaps').select('*').eq('id', id).single();
    if (roadmapError) {
      console.error("Error fetching roadmap:", roadmapError);
      toast({ title: "Error loading roadmap", description: roadmapError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }
    // console.log("Fetched Roadmap:", r);
    setRoadmap(r);

    const { data: s, error: stepsError } = await supabase
      .from('roadmap_steps')
      .select('*')
      .eq('roadmap_id', id)
      .order('order_index', { ascending: true });

    if (stepsError) {
      console.error("Error fetching steps:", stepsError);
      toast({ title: "Error loading steps", description: stepsError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }
    // console.log("Fetched Steps:", s);
    setSteps(s || []);
    
    const all: Record<string, any[]> = {};
    await Promise.all((s || []).map(async (st) => {
      const { data: res, error: resErr } = await supabase
        .from('roadmap_step_resources')
        .select('*')
        .eq('step_id', st.id)
        .order('created_at', { ascending: true });
      if (resErr) {
        console.error('Error fetching resources for step', st.id, resErr);
      }
      all[st.id] = res || [];
    }));
    // console.log("Processed Resources By Step:", all);
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
      .update({
        title: step.title,
        description: step.description,
        duration: step.duration,
        due_date: step.due_date,
        notes: step.notes,
        topics: step.topics,
        task: step.task,
      })
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

  const handleDeleteRoadmap = async () => {
    if (!id || !roadmap) return;

    if (confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) {
      try {
        const { error } = await getTypedTable('roadmaps')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Roadmap Deleted!',
          description: 'The roadmap and all its associated steps and resources have been removed.',
          variant: 'success'
        });
        navigate('/roadmaps');
      } catch (e: any) {
        console.error('deleteRoadmap error', e);
        toast({ title: 'Failed to delete roadmap', description: e?.message || '', variant: 'destructive' });
      }
    }
  };

  if (!id) return null;

  // Group steps by inferred phases (e.g., Introduction, Beginner, Intermediate, Advanced, Milestone, Final Outcome)
  const groupedSteps = steps.reduce((acc, step) => {
    let phase = 'General'; // Default phase
    if (step.title.includes('Introduction')) phase = 'Introduction';
    else if (step.title.includes('Milestone')) phase = 'Milestone';
    else if (step.title.includes('Final Outcome')) phase = 'Final Outcome';
    else if (step.order_index < steps.length / 3) phase = 'Beginner';
    else if (step.order_index < (steps.length * 2) / 3) phase = 'Intermediate';
    else phase = 'Advanced';

    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(step);
    return acc;
  }, {});

  const phaseOrder = ['Introduction', 'Beginner', 'Intermediate', 'Advanced', 'Milestone', 'Final Outcome', 'General'];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/roadmaps')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Roadmaps
          </Button>
          <Button variant="destructive" onClick={handleDeleteRoadmap}>
            Delete Roadmap
          </Button>
        </div>

        {/* Notion-style Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{roadmap?.title || 'Loading Roadmap...'}</h1>
          <p className="text-gray-600 mb-4">{roadmap?.description || 'A comprehensive learning path.'}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Estimated: {roadmap?.estimated_time || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created: {new Date(roadmap?.created_at).toLocaleDateString()}</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800">{(roadmap?.status || 'not-started').replace('-', ' ')}</Badge>
          </div>
          <div className="mt-6">
            <div className="text-sm font-medium text-gray-700 mb-2">Progress: {roadmap?.progress || 0}%</div>
            <Progress value={roadmap?.progress || 0} className="h-2 bg-gray-200" indicatorClassName="bg-blue-500" />
          </div>
        </div>

        {/* Roadmap Sections (Notion-style Toggles) */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading roadmap details...</div>
          ) : steps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No steps found for this roadmap.</p>
              <Button onClick={rebuildSteps} disabled={isRebuilding}>
                {isRebuilding ? 'Rebuilding...' : 'Rebuild Steps'}
              </Button>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full space-y-3">
              {phaseOrder.map(phaseName => {
                const phaseSteps = groupedSteps[phaseName];
                if (!phaseSteps || phaseSteps.length === 0) return null;

                return (
                  <AccordionItem key={phaseName} value={phaseName} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <AccordionTrigger className="flex items-center justify-between p-4 font-semibold text-lg text-gray-800 hover:bg-gray-50 transition-colors">
                      <span className="flex items-center gap-2">
                        {phaseIcons[phaseName] || <Menu className="h-5 w-5 text-gray-400" />}
                        {phaseName}
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">{phaseSteps.length} items</Badge>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="space-y-6">
                        {phaseSteps.map((step: any, index: number) => (
                          <div key={step.id} className="bg-white rounded-md p-4 shadow-xs border border-gray-150 relative">
                            <div className="absolute -left-2 top-0 bottom-0 w-1 bg-blue-400 rounded-l-md" />
                            
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-md font-bold text-gray-900 flex items-center gap-2">
                                <Checkbox
                                  id={`step-${step.id}`}
                                  checked={!!step.completed}
                                  onCheckedChange={(v: boolean) => toggleStep(step.id, v)}
                                />
                                <span>{step.title}</span>
                                {step.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                              </h3>
                              <div className="flex items-center gap-2">
                                {step.duration && <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 flex items-center gap-1"><Clock className="h-3 w-3" />{step.duration}</Badge>}
                                {step.due_date && <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 flex items-center gap-1"><Calendar className="h-3 w-4" />{new Date(step.due_date).toLocaleDateString()}</Badge>}
                                <Button variant="ghost" size="sm" onClick={() => setEditingStep(step.id)} className="text-gray-500 hover:text-gray-900"><Edit3 className="h-4 w-4" /></Button>
                              </div>
                            </div>

                            {editingStep === step.id ? (
                              <div className="space-y-3 mt-3">
                                <div>
                                  <Label htmlFor={`title-${step.id}`}>Title</Label>
                                  <Input id={`title-${step.id}`} value={step.title} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, title: e.target.value } : s))} />
                                </div>
                                <div>
                                  <Label htmlFor={`description-${step.id}`}>Description</Label>
                                  <Textarea id={`description-${step.id}`} value={step.description || ''} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, description: e.target.value } : s))} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <Label htmlFor={`duration-${step.id}`}>Duration</Label>
                                    <Input id={`duration-${step.id}`} value={step.duration || ''} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, duration: e.target.value } : s))} />
                                  </div>
                                  <div>
                                    <Label htmlFor={`dueDate-${step.id}`}>Due Date</Label>
                                    <Input type="date" id={`dueDate-${step.id}`} value={step.due_date || ''} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, due_date: e.target.value } : s))} />
                                  </div>
                                  <div>
                                    <Label htmlFor={`notes-${step.id}`}>Notes</Label>
                                    <Input id={`notes-${step.id}`} value={step.notes || ''} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, notes: e.target.value } : s))} />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" onClick={() => setEditingStep(null)}><X className="h-4 w-4 mr-2" /> Cancel</Button>
                                  <Button size="sm" onClick={() => saveStep(step)}><Save className="h-4 w-4 mr-2" /> Save</Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {step.description && (
                                  <p className="text-gray-700 text-sm">{step.description}</p>
                                )}

                                {step.topics && step.topics.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-800 mb-1">Topics:</h4>
                                    <ul className="list-disc list-inside space-y-0.5 text-gray-700 text-sm">
                                      {step.topics.map((topic: string, tIdx: number) => (
                                        <li key={tIdx}>{topic}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {step.task && (
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-800 mb-1 mt-3">Practice Task:</h4>
                                    <p className="text-gray-700 text-sm">{step.task}</p>
                                  </div>
                                )}

                                {resourcesByStep[step.id] && resourcesByStep[step.id].length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-800 mb-1 mt-3">Resources:</h4>
                                    <div className="space-y-2">
                                      {resourcesByStep[step.id].map((res: any) => (
                                        <a
                                          key={res.id}
                                          href={res.url || '#'}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                                        >
                                          {getFavicon(res.url) ? (
                                            <img src={getFavicon(res.url) as string} alt="icon" className="h-4 w-4 rounded" />
                                          ) : (
                                            <LinkIcon className="h-4 w-4 flex-shrink-0" />
                                          )}
                                          <span className="font-medium">{res.title}</span>
                                          {res.type && <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">{res.type}</Badge>}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RoadmapView;

