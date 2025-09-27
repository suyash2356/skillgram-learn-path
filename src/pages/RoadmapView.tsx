import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Clock, Target, CheckCircle, Edit3, Save, X, Plus, Link as LinkIcon, Menu, Calendar,
  BookOpen, Brain, Rocket, FlaskConical, Trophy, GraduationCap, Hourglass, ListChecks,
  Book, MonitorPlay, Youtube, Globe, Codepen, Users, Mail, Award, FolderOpen, ClipboardCheck, PenLine, CalendarCheck, Lightbulb, MessageCircle, Share2
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TypedSupabaseClient } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useUserFollows } from "@/hooks/useUserFollows";
import { CommentDialog } from "@/components/CommentDialog";
import { ShareLinkDialog } from "@/components/ShareLinkDialog";

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

const RoadmapView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth(); // Get current user from auth context
  const queryClient = useQueryClient();

  const [roadmap, setRoadmap] = useState<any | null>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [resourcesByStep, setResourcesByStep] = useState<Record<string, any[]>>({});
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [currentRoadmapComments, setCurrentRoadmapComments] = useState<any[]>([]);
  const [isPublic, setIsPublic] = useState(false); // New state for public status

  // Template state (editable + persisted)
  const [template, setTemplate] = useState<any | null>(null);

  // Build AI phases helper (unchanged)
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
      description: `Embark on your journey to master ${title.replace(' Learning Roadmap', '')}. This phase will establish foundational knowledge.`,
      duration: '1 week',
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

  const fetchRoadmapComments = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles(full_name, avatar_url)
      `)
      .eq('roadmap_id', id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching comments:", error);
      toast({ title: "Error loading comments", description: error.message, variant: "destructive" });
      return [];
    }
    setCurrentRoadmapComments(data as Comment[]);
    return data as Comment[];
  }, [id, toast]);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);

    const { data: r, error: roadmapError } = await supabase.from('roadmaps').select('*').eq('id', id).single();
    if (roadmapError) {
      console.error("Error fetching roadmap:", roadmapError);
      toast({ title: "Error loading roadmap", description: roadmapError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }
    setRoadmap(r);
    setIsPublic(r.is_public);

    const { data: s, error: stepsError } = await supabase
      .from('roadmap_steps')
      .select('id, title, description, order_index, duration, completed, topics, task, due_date, notes') // Select all columns needed for editing
      .eq('roadmap_id', id)
      .order('order_index', { ascending: true });

    if (stepsError) {
      console.error("Error fetching steps:", stepsError);
      toast({ title: "Error loading steps", description: stepsError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }
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
    setResourcesByStep(all);
    setIsLoading(false);

    // Fetch comments after roadmap and steps are loaded
    fetchRoadmapComments();

    // Hydrate template from localStorage or defaults using roadmap data
    const storageKey = `roadmapTemplate:${id}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try { setTemplate(JSON.parse(stored)); } catch { /* ignore */ }
    } else {
      const defaultTemplate = buildDefaultTemplate(r);
      setTemplate(defaultTemplate);
      localStorage.setItem(storageKey, JSON.stringify(defaultTemplate));
    }

    // After we have steps and resources, minimally populate template as per rules
    setTemplate((t: any) => {
      if (!t) return t;
      const updated = { ...t };

      // 1) Track Your Progress: only Phase column from step titles
      if (!Array.isArray(updated.progressTable) || updated.progressTable.length === 0) {
        updated.progressTable = (s || []).map((step: any) => ({ phase: step.title, status: '', timeline: '', notes: '' }));
      }

      // 2) Learning Resources: aggregate from roadmap_step_resources into categorized lists
      const flatRes = Object.values(all).flat();
      const dedupe = <T,>(arr: T[], getKey: (x: T) => string) => {
        const seen = new Set<string>();
        const out: T[] = [];
        for (const item of arr) {
          const k = getKey(item);
          if (seen.has(k)) continue;
          seen.add(k);
          out.push(item);
        }
        return out;
      };
      const categorize = (res: any) => {
        const url: string = res?.url || '';
        const host = (() => { try { return new URL(url).hostname || ''; } catch { return ''; } })().toLowerCase();
        if (res?.type && typeof res.type === 'string' && res.type.toLowerCase().includes('book')) return 'book';
        if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
        if (host.includes('coursera') || host.includes('udemy') || host.includes('edx') || host.includes('khanacademy') || host.includes('udacity')) return 'course';
        if (host.includes('medium') || host.includes('towardsdatascience') || host.includes('blog') || host.includes('docs') || host.includes('official')) return 'blog';
        return 'course';
      };
      const books = dedupe(
        flatRes.filter((r: any) => categorize(r) === 'book').map((r: any) => ({ title: r.title || '', checked: false })),
        (x: any) => x.title.trim().toLowerCase()
      );
      const courses = dedupe(
        flatRes.filter((r: any) => categorize(r) === 'course').map((r: any) => ({ title: r.title || '', url: r.url || '', checked: false })),
        (x: any) => `${x.title.trim().toLowerCase()}||${(x.url || '').trim().toLowerCase()}`
      );
      const channels = dedupe(
        flatRes.filter((r: any) => categorize(r) === 'youtube').map((r: any) => ({ title: r.title || '', url: r.url || '', checked: false })),
        (x: any) => `${x.title.trim().toLowerCase()}||${(x.url || '').trim().toLowerCase()}`
      );
      const blogs = dedupe(
        flatRes.filter((r: any) => categorize(r) === 'blog').map((r: any) => ({ title: r.title || '', url: r.url || '', checked: false })),
        (x: any) => `${x.title.trim().toLowerCase()}||${(x.url || '').trim().toLowerCase()}`
      );

      if (updated.resources) {
        const current = updated.resources;
        updated.resources = {
          books: (current.books?.length ? current.books : books) || [],
          onlineCourses: (current.onlineCourses?.length ? current.onlineCourses : courses) || [],
          youtubeChannels: (current.youtubeChannels?.length ? current.youtubeChannels : channels) || [],
          blogsWebsites: (current.blogsWebsites?.length ? current.blogsWebsites : blogs) || [],
        };
      }

      // 3) Topics & Skills: backfill from roadmap.technologies when empty
      const techs = Array.isArray(r?.technologies) ? r.technologies : [];
      if ((updated.learningGoals?.sideBySideTopics?.length || 0) === 0 && techs.length > 0) {
        updated.learningGoals.sideBySideTopics = techs.map((name: string) => ({ name, checked: false }));
      }
      if ((updated.learningGoals?.skillsToLearn?.length || 0) === 0 && techs.length > 0) {
        updated.learningGoals.skillsToLearn = techs.map((name: string) => ({ name, checked: false }));
      }

      // Keep user-owned sections empty (no changes)

      // Persist
      try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, [id, toast, fetchRoadmapComments]);

  useEffect(() => {
    load();
  }, [load]);

  // Persist template when it changes
  useEffect(() => {
    if (!id || !template) return;
    const storageKey = `roadmapTemplate:${id}`;
    localStorage.setItem(storageKey, JSON.stringify(template));
  }, [id, template, queryClient]); // Added queryClient to dependencies

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
          variant: 'default'
        });
        navigate('/roadmaps');
      } catch (e: any) {
        console.error('deleteRoadmap error', e);
        toast({ title: 'Failed to delete roadmap', description: e?.message || '', variant: 'destructive' });
      }
    }
  };

  if (!id) return null;

  const groupedSteps = steps.reduce((acc, step) => {
    let phase = 'General';
    if (step.title.includes('Introduction')) phase = 'Introduction';
    else if (step.title.includes('Milestone')) phase = 'Milestone';
    else if (step.title.includes('Final Outcome')) phase = 'Final Outcome';
    else if (step.order_index < steps.length / 3) phase = 'Beginner';
    else if (step.order_index < (steps.length * 2) / 3) phase = 'Intermediate';
    else phase = 'Advanced';

    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(step);
    return acc;
  }, {} as Record<string, any[]>);

  const phaseOrder = ['Introduction', 'Beginner', 'Intermediate', 'Advanced', 'Milestone', 'Final Outcome', 'General'];

  // Build default template content with roadmap hydration
  function buildDefaultTemplate(r: any) {
    const weekly = parseInt((r?.estimated_time || '').toString().replace(/[^0-9]/g, ''), 10) || 20;

    return {
      learningGoals: {
        experienceLevel: { beginner: (r?.difficulty || 'beginner').toLowerCase() === 'beginner', intermediate: (r?.difficulty || '').toLowerCase() === 'intermediate', advanced: (r?.difficulty || '').toLowerCase() === 'advanced' },
        timeCommitment: { weeklyHours: weekly, totalMonths: 12 },
        sideBySideTopics: (Array.isArray(r?.technologies) ? r.technologies : []).map((name: string) => ({ name, checked: false })),
        skillsToLearn: (Array.isArray(r?.technologies) ? r.technologies : []).map((name: string) => ({ name, checked: false })),
      },
      progressTable: [],
      resources: {
        books: [],
        onlineCourses: [],
        youtubeChannels: [],
        blogsWebsites: [],
      },
      tools: {
        practicePlatforms: [],
        communities: [],
        newsletters: [],
      },
      achievements: { certificates: [], projects: [], contributions: [] },
      journal: [],
      quarterly: {
        q1: { challenges: [], learning: [], needToFocused: [], goalsForNextQuarter: [] },
        q2: { progressMade: [], challenges: [], adjustmentsToRoadmap: [], goalsForNextQuarter: [] },
      },
      career: {
        skillsToDevelop: [],
        researchInterests: [],
        careerGoals: { shortTerm: '', mediumTerm: '', longTerm: '' },
      },
    };
  }

  // Helpers to update template
  const setLG = (updater: (prev: any) => any) => setTemplate((t: any) => ({ ...t, learningGoals: updater(t.learningGoals) }));
  const setResources = (updater: (prev: any) => any) => setTemplate((t: any) => ({ ...t, resources: updater(t.resources) }));
  const setTools = (updater: (prev: any) => any) => setTemplate((t: any) => ({ ...t, tools: updater(t.tools) }));
  const setAchievements = (updater: (prev: any) => any) => setTemplate((t: any) => ({ ...t, achievements: updater(t.achievements) }));
  const setJournal = (updater: (prev: any[]) => any[]) => setTemplate((t: any) => ({ ...t, journal: updater(t.journal) }));
  const setQuarterly = (updater: (prev: any) => any) => setTemplate((t: any) => ({ ...t, quarterly: updater(t.quarterly) }));
  const setCareer = (updater: (prev: any) => any) => setTemplate((t: any) => ({ ...t, career: updater(t.career) }));
  const setProgressTable = (updater: (prev: any[]) => any[]) => setTemplate((t: any) => ({ ...t, progressTable: updater(t.progressTable) }));

  // Add helpers for user-editable sections
  const addProgressRow = () => setProgressTable(prev => ([ ...prev, { phase: '', status: '', timeline: '', notes: '' } ]));
  const addCertificate = () => setAchievements(prev => ({ ...prev, certificates: [ ...(prev.certificates || []), { title: '', checked: false } ] }));
  const addProject = () => setAchievements(prev => ({ ...prev, projects: [ ...(prev.projects || []), { title: '', url: '', checked: false } ] }));
  const addContribution = () => setAchievements(prev => ({ ...prev, contributions: [ ...(prev.contributions || []), { title: '', url: '', checked: false } ] }));
  const addJournalRow = () => setJournal(prev => ([ ...prev, { time: '', topic: '', resourcesUsed: '', keyLearnings: '', questions: '' } ]));
  const addQ1Field = (key: 'challenges'|'learning'|'needToFocused'|'goalsForNextQuarter') => setQuarterly(prev => ({ ...prev, q1: { ...prev.q1, [key]: [ ...(prev.q1?.[key] || []), '' ] } }));
  const addQ2Field = (key: 'progressMade'|'challenges'|'adjustmentsToRoadmap'|'goalsForNextQuarter') => setQuarterly(prev => ({ ...prev, q2: { ...prev.q2, [key]: [ ...(prev.q2?.[key] || []), '' ] } }));
  const addCareerSkill = () => setCareer(prev => ({ ...prev, skillsToDevelop: [ ...(prev.skillsToDevelop || []), { name: 'Skill', details: '', checked: false } ] }));
  const addResearchInterest = () => setCareer(prev => ({ ...prev, researchInterests: [ ...(prev.researchInterests || []), { name: 'Topic', details: '', checked: false } ] }));

  // Add helpers for additional learning tools
  const addResourceBook = () => setResources(prev => ({ ...prev, books: [ ...(prev.books || []), { title: '', checked: false } ] }));
  const addResourceCourse = () => setResources(prev => ({ ...prev, onlineCourses: [ ...(prev.onlineCourses || []), { title: '', url: '', checked: false } ] }));
  const addResourceChannel = () => setResources(prev => ({ ...prev, youtubeChannels: [ ...(prev.youtubeChannels || []), { title: '', url: '', checked: false } ] }));
  const addResourceBlog = () => setResources(prev => ({ ...prev, blogsWebsites: [ ...(prev.blogsWebsites || []), { title: '', url: '', checked: false } ] }));

  // Remove helpers
  const removeProgressRow = (idx: number) => setProgressTable(prev => prev.filter((_, i) => i !== idx));
  const removeTopic = (idx: number) => setLG(prev => ({ ...prev, sideBySideTopics: prev.sideBySideTopics.filter((_: any, i: number) => i !== idx) }));
  const removeSkill = (idx: number) => setLG(prev => ({ ...prev, skillsToLearn: prev.skillsToLearn.filter((_: any, i: number) => i !== idx) }));
  const removeResourceBook = (idx: number) => setResources(prev => ({ ...prev, books: (prev.books || []).filter((_: any, i: number) => i !== idx) }));
  const removeResourceCourse = (idx: number) => setResources(prev => ({ ...prev, onlineCourses: (prev.onlineCourses || []).filter((_: any, i: number) => i !== idx) }));
  const removeResourceChannel = (idx: number) => setResources(prev => ({ ...prev, youtubeChannels: (prev.youtubeChannels || []).filter((_: any, i: number) => i !== idx) }));
  const removeResourceBlog = (idx: number) => setResources(prev => ({ ...prev, blogsWebsites: (prev.blogsWebsites || []).filter((_: any, i: number) => i !== idx) }));
  const removeCertificate = (idx: number) => setAchievements(prev => ({ ...prev, certificates: (prev.certificates || []).filter((_: any, i: number) => i !== idx) }));
  const removeProject = (idx: number) => setAchievements(prev => ({ ...prev, projects: (prev.projects || []).filter((_: any, i: number) => i !== idx) }));
  const removeContribution = (idx: number) => setAchievements(prev => ({ ...prev, contributions: (prev.contributions || []).filter((_: any, i: number) => i !== idx) }));
  const removeJournalRow = (idx: number) => setJournal(prev => prev.filter((_, i) => i !== idx));
  const removeQ1Field = (key: 'challenges'|'learning'|'needToFocused'|'goalsForNextQuarter', idx: number) => setQuarterly(prev => ({ ...prev, q1: { ...prev.q1, [key]: (prev.q1?.[key] || []).filter((_: any, i: number) => i !== idx) } }));
  const removeQ2Field = (key: 'progressMade'|'challenges'|'adjustmentsToRoadmap'|'goalsForNextQuarter', idx: number) => setQuarterly(prev => ({ ...prev, q2: { ...prev.q2, [key]: (prev.q2?.[key] || []).filter((_: any, i: number) => i !== idx) } }));
  const removeCareerSkill = (idx: number) => setCareer(prev => ({ ...prev, skillsToDevelop: (prev.skillsToDevelop || []).filter((_: any, i: number) => i !== idx) }));
  const removeResearchInterest = (idx: number) => setCareer(prev => ({ ...prev, researchInterests: (prev.researchInterests || []).filter((_: any, i: number) => i !== idx) }));
  const removeToolPractice = (idx: number) => setTools(prev => ({ ...prev, practicePlatforms: (prev.practicePlatforms || []).filter((_: any, i: number) => i !== idx) }));
  const removeToolCommunity = (idx: number) => setTools(prev => ({ ...prev, communities: (prev.communities || []).filter((_: any, i: number) => i !== idx) }));
  const removeToolNewsletter = (idx: number) => setTools(prev => ({ ...prev, newsletters: (prev.newsletters || []).filter((_: any, i: number) => i !== idx) }));

  // Add helpers for additional learning tools (re-added)
  const addToolPractice = () => setTools(prev => ({ ...prev, practicePlatforms: [ ...(prev.practicePlatforms || []), { title: '', url: '', checked: false } ] }));
  const addToolCommunity = () => setTools(prev => ({ ...prev, communities: [ ...(prev.communities || []), { title: '', url: '', checked: false } ] }));
  const addToolNewsletter = () => setTools(prev => ({ ...prev, newsletters: [ ...(prev.newsletters || []), { title: '', url: '', checked: false } ] }));

  const lg = template?.learningGoals;

  return (
    <Layout>
      <div className="dark bg-zinc-950 text-zinc-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl font-sans">

          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => navigate('/roadmaps')} className="text-zinc-300 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Roadmaps
          </Button>
            <div className="flex items-center">
              <Button variant="destructive" onClick={handleDeleteRoadmap}>
                Delete Roadmap
              </Button>
              <Button onClick={() => setCommentDialogOpen(true)} variant="secondary" className="ml-2">
                <MessageCircle className="h-4 w-4 mr-2" /> View/Add Comments
              </Button>
              {roadmap && user && roadmap.user_id === user.id && (
                <ShareLinkDialog roadmapId={roadmap.id} isPublic={isPublic} roadmapTitle={roadmap.title} onPublicToggle={togglePublicStatus} />
              )}
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">Welcome to Your {roadmap?.title || 'Learning'} Journey!</h1>
            <p className="text-xl text-zinc-300 mb-6 leading-relaxed">
              {roadmap?.description || `This template will help you navigate the ${roadmap?.title || 'selected'} journey with a structured path, resources, milestones, and practical projects tailored to your focus.`}
            </p>

            <div className="bg-blue-950/40 border-l-4 border-blue-500 text-blue-200 p-4 rounded-md shadow-sm mb-6">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-400" /> How to use this template:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-base">
                <li>Set your learning goals and timeline</li>
                <li>Track your progress with checkboxes</li>
                <li>Add notes and personalize each section</li>
                <li>Complete projects to build your portfolio</li>
                <li>Review and adjust your path regularly</li>
              </ul>
            </div>
            <hr className="my-8 border-zinc-800" />
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <ClipboardCheck className="h-7 w-7 text-green-400" /> Track Your Progress
            </h2>
            <div className="overflow-x-auto bg-zinc-900 rounded-lg shadow-sm border border-zinc-800">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Phase</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Timeline</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-zinc-950 divide-y divide-zinc-800">
                  {(template?.progressTable || []).map((row: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-100">
                        <Input value={row.phase} onChange={(e) => setProgressTable(prev => prev.map((r, i) => i === idx ? { ...r, phase: e.target.value } : r))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                        <Input value={row.status} onChange={(e) => setProgressTable(prev => prev.map((r, i) => i === idx ? { ...r, status: e.target.value } : r))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                        <Input value={row.timeline} onChange={(e) => setProgressTable(prev => prev.map((r, i) => i === idx ? { ...r, timeline: e.target.value } : r))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                        <div className="flex items-center gap-2">
                          <Input value={row.notes} onChange={(e) => setProgressTable(prev => prev.map((r, i) => i === idx ? { ...r, notes: e.target.value } : r))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                          <Button variant="ghost" size="sm" onClick={() => removeProgressRow(idx)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3"><Button variant="ghost" size="sm" onClick={addProgressRow} className="text-zinc-300">+ Add Row</Button></div>
            <hr className="my-8 border-zinc-800" />
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Target className="h-7 w-7 text-red-400" /> Set Your Learning Goals
            </h2>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-zinc-400" /> Your Experience Level
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              <div className="flex items-center space-x-2">
                <Checkbox id="exp-beginner" checked={!!lg?.experienceLevel.beginner} onCheckedChange={(v: boolean) => setLG(prev => ({ ...prev, experienceLevel: { ...prev.experienceLevel, beginner: v } }))} />
                <Label htmlFor="exp-beginner" className="text-base font-medium text-zinc-200">Beginner (No technical background)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="exp-intermediate" checked={!!lg?.experienceLevel.intermediate} onCheckedChange={(v: boolean) => setLG(prev => ({ ...prev, experienceLevel: { ...prev.experienceLevel, intermediate: v } }))} />
                <Label htmlFor="exp-intermediate" className="text-base font-medium text-zinc-200">Intermediate (Some programming experience)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="exp-advanced" checked={!!lg?.experienceLevel.advanced} onCheckedChange={(v: boolean) => setLG(prev => ({ ...prev, experienceLevel: { ...prev.experienceLevel, advanced: v } }))} />
                <Label htmlFor="exp-advanced" className="text-base font-medium text-zinc-200">Advanced (Some programming experience)</Label>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Hourglass className="h-6 w-6 text-zinc-400" /> Time Commitment
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              <div className="flex items-center gap-3">
                <Label htmlFor="weekly-time" className="text-base font-medium text-zinc-200 w-28">Weekly Time:</Label>
                <Input id="weekly-time" type="number" value={lg?.timeCommitment.weeklyHours ?? ''} onChange={(e) => setLG(prev => ({ ...prev, timeCommitment: { ...prev.timeCommitment, weeklyHours: Number(e.target.value) } }))} className="w-24 text-center bg-zinc-900 border-zinc-700 text-zinc-100" />
                <span className="text-base text-zinc-300">hours</span>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="total-months" className="text-base font-medium text-zinc-200 w-28">Total Months:</Label>
                <Input id="total-months" type="number" value={lg?.timeCommitment.totalMonths ?? ''} onChange={(e) => setLG(prev => ({ ...prev, timeCommitment: { ...prev.timeCommitment, totalMonths: Number(e.target.value) } }))} className="w-24 text-center bg-zinc-900 border-zinc-700 text-zinc-100" />
                <span className="text-base text-zinc-300">months</span>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-zinc-400" /> Side by Side topics
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                {(lg?.sideBySideTopics || []).map((topic: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox id={`sbs-topic-${index}`} checked={topic.checked} onCheckedChange={(v: boolean) => setLG(prev => ({ ...prev, sideBySideTopics: prev.sideBySideTopics.map((t: any, i: number) => i === index ? { ...t, checked: v } : t) }))} />
                    <Input value={topic.name} onChange={(e) => setLG(prev => ({ ...prev, sideBySideTopics: prev.sideBySideTopics.map((t: any, i: number) => i === index ? { ...t, name: e.target.value } : t) }))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                    <Button variant="ghost" size="sm" onClick={() => removeTopic(index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <FlaskConical className="h-6 w-6 text-zinc-400" /> Skill to learn
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                {(lg?.skillsToLearn || []).map((skill: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox id={`skill-to-learn-${index}`} checked={skill.checked} onCheckedChange={(v: boolean) => setLG(prev => ({ ...prev, skillsToLearn: prev.skillsToLearn.map((t: any, i: number) => i === index ? { ...t, checked: v } : t) }))} />
                    <Input value={skill.name} onChange={(e) => setLG(prev => ({ ...prev, skillsToLearn: prev.skillsToLearn.map((t: any, i: number) => i === index ? { ...t, name: e.target.value } : t) }))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                    <Button variant="ghost" size="sm" onClick={() => removeSkill(index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
            <hr className="my-8 border-zinc-800" />
        </div>

          <div className="mb-10">
            <a href="https://www.notion.so/2221c156c4d581c09ff5dce19e67533a?pvs=21" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-400 hover:underline mb-6 text-lg font-medium">
              <BookOpen className="h-5 w-5 mr-2" /> Learning Journey Phases
            </a>
            {isLoading ? (
              <div className="text-center py-8 text-zinc-400">Loading roadmap details...</div>
            ) : steps.length === 0 ? (
              <div className="text-center py-8 text-zinc-300 bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-800">
                <p className="mb-4 text-lg">No steps found for this roadmap. Generate them now!</p>
                <Button onClick={rebuildSteps} disabled={isRebuilding} className="px-6 py-3 text-base">
                  {isRebuilding ? 'Rebuilding...' : 'Rebuild Steps'}
                </Button>
            </div>
            ) : (
              <Accordion type="multiple" className="w-full space-y-3">
                {phaseOrder.map(phaseName => {
                  const phaseSteps = groupedSteps[phaseName];
                  if (!phaseSteps || phaseSteps.length === 0) return null;

                  const IconComponent = ({ phaseName }: { phaseName: string }) => {
                    switch (phaseName) {
                      case 'Introduction': return <BookOpen className="h-5 w-5 text-purple-400" />;
                      case 'Beginner': return <Brain className="h-5 w-5 text-green-400" />;
                      case 'Intermediate': return <Target className="h-5 w-5 text-blue-400" />;
                      case 'Advanced': return <Rocket className="h-5 w-5 text-red-400" />;
                      case 'Milestone': return <Trophy className="h-5 w-5 text-yellow-400" />;
                      case 'Final Outcome': return <CheckCircle className="h-5 w-5 text-teal-400" />;
                      default: return <Menu className="h-5 w-5 text-zinc-500" />;
                    }
                  };

                  return (
                    <AccordionItem key={phaseName} value={phaseName} className="bg-zinc-900 rounded-lg shadow-sm border border-zinc-800 overflow-hidden">
                      <AccordionTrigger className="flex items-center justify-between p-4 font-semibold text-lg text-zinc-100 hover:bg-zinc-800 transition-colors">
                        <span className="flex items-center gap-3">
                          <IconComponent phaseName={phaseName} />
                          {phaseName}
                          <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-300 font-normal">{phaseSteps.length} items</Badge>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 border-t border-zinc-800 bg-zinc-950">
                        <div className="space-y-6">
                          {phaseSteps.map((step: any) => (
                            <div key={step.id} className="bg-zinc-900 rounded-md p-4 shadow-xs border border-zinc-800 relative">
                              <div className="absolute -left-2 top-0 bottom-0 w-1 bg-blue-500 rounded-l-md" />
                              
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="text-md font-bold text-zinc-100 flex items-center gap-2">
                                  <Checkbox
                                    id={`step-${step.id}`}
                                    checked={!!step.completed}
                                    onCheckedChange={(v: boolean) => toggleStep(step.id, v)}
                                    className="mt-1"
                                  />
                                  <Input value={step.title} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, title: e.target.value } : s))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                                  {step.completed && <CheckCircle className="h-4 w-4 text-green-400 ml-2" />}
                                </h3>
                                <div className="flex items-center gap-2">
                                  {step.duration && <Badge variant="outline" className="text-xs bg-indigo-900/40 text-indigo-300 flex items-center gap-1"><Clock className="h-3 w-3" />{step.duration}</Badge>}
                                  {step.due_date && <Badge variant="outline" className="text-xs bg-purple-900/40 text-purple-300 flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(step.due_date).toLocaleDateString()}</Badge>}
                                  <Button variant="ghost" size="sm" onClick={() => setEditingStep(step.id)} className="text-zinc-400 hover:text-zinc-100"><Edit3 className="h-4 w-4" /></Button>
              </div>
            </div>

                              {editingStep === step.id ? (
                                <div className="space-y-3 mt-3">
                                  <div>
                                    <Label htmlFor={`title-${step.id}`} className="text-zinc-300">Title</Label>
                                    <Input id={`title-${step.id}`} value={step.title} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, title: e.target.value } : s))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                                  </div>
                                  <div>
                                    <Label htmlFor={`description-${step.id}`} className="text-zinc-300">Description</Label>
                                    <Textarea id={`description-${step.id}`} value={step.description || ''} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, description: e.target.value } : s))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                      <Label htmlFor={`duration-${step.id}`} className="text-zinc-300">Duration</Label>
                                      <Input id={`duration-${step.id}`} value={step.duration || ''} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, duration: e.target.value } : s))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                                    </div>
                                    <div>
                                      <Label htmlFor={`dueDate-${step.id}`} className="text-zinc-300">Due Date</Label>
                                      <Input type="date" id={`dueDate-${step.id}`} value={step.due_date || ''} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, due_date: e.target.value } : s))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                                    </div>
                    <div>
                                      <Label htmlFor={`notes-${step.id}`} className="text-zinc-300">Notes</Label>
                                      <Input id={`notes-${step.id}`} value={step.notes || ''} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, notes: e.target.value } : s))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2 mt-4">
                                    <Button variant="outline" size="sm" onClick={() => setEditingStep(null)}><X className="h-4 w-4 mr-2" /> Cancel</Button>
                                    <Button size="sm" onClick={() => saveStep(step)}><Save className="h-4 w-4 mr-2" /> Save</Button>
                                  </div>
                          </div>
                              ) : (
                                <div className="space-y-4">
                                  {step.description && (
                                    <Textarea value={step.description} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, description: e.target.value } : s))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                                  )}

                                  {step.topics && step.topics.length > 0 && (
                        <div>
                                      <h4 className="font-semibold text-sm text-zinc-200 mb-1">Topics:</h4>
                                      <ul className="list-disc list-inside space-y-0.5 text-zinc-300 text-sm">
                                        {step.topics.map((topic: string, tIdx: number) => (
                                          <li key={tIdx}>
                                            <Input value={topic} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, topics: s.topics.map((t: string, i: number) => i === tIdx ? e.target.value : t) } : s))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {step.task && (
                                    <div>
                                      <h4 className="font-semibold text-sm text-zinc-200 mb-1 mt-3">Practice Task:</h4>
                                      <Textarea value={step.task} onChange={(e) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, task: e.target.value } : s))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                        </div>
                                  )}

                                  {resourcesByStep[step.id] && resourcesByStep[step.id].length > 0 && (
                        <div>
                                      <h4 className="font-semibold text-sm text-zinc-200 mb-1 mt-3">Resources:</h4>
                                      <div className="space-y-2">
                                        {resourcesByStep[step.id].map((res: any) => (
                                          <div key={res.id} className="flex items-center gap-2 text-blue-400 text-sm">
                                            {getFavicon(res.url) ? (
                                              <img src={getFavicon(res.url) as string} alt="icon" className="h-4 w-4 rounded" />
                                            ) : (
                                              <LinkIcon className="h-4 w-4 flex-shrink-0" />
                                            )}
                                            <a href={res.url || '#'} target="_blank" rel="noreferrer" className="hover:underline">
                                              <Input value={res.title} onChange={(e) => setResourcesByStep(prev => ({ ...prev, [step.id]: prev[step.id].map(r => r.id === res.id ? { ...r, title: e.target.value } : r) }))} className="inline-block bg-zinc-900 border-zinc-700 text-zinc-100" />
                                            </a>
                                            {res.type && <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-300">{res.type}</Badge>}
                                            <Button variant="ghost" size="sm" onClick={() => removeResource(step.id, res.id)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                                          </div>
                                        ))}
                                        <Button variant="ghost" size="sm" onClick={() => addResource(step.id)} className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                          <Plus className="h-4 w-4" /> Add Resource
                                        </Button>
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
            <hr className="my-8 border-zinc-800" />
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Book className="h-7 w-7 text-teal-400" /> Learning Resources
            </h2>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-zinc-400" /> Essential Books
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              {(template?.resources.books || []).length === 0 && (
                <div className="text-sm text-zinc-500">No books yet. Paste a title below.</div>
              )}
              {(template?.resources.books || []).map((book: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox id={`book-${index}`} checked={book.checked} onCheckedChange={(v: boolean) => setResources(prev => ({ ...prev, books: prev.books.map((b: any, i: number) => i === index ? { ...b, checked: v } : b) }))} />
                  <Input value={book.title} onChange={(e) => setResources(prev => ({ ...prev, books: prev.books.map((b: any, i: number) => i === index ? { ...b, title: e.target.value } : b) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Button variant="ghost" size="sm" onClick={() => removeResourceBook(index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addResourceBook} className="text-zinc-300">+ Add Book</Button>
            </div>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <MonitorPlay className="h-6 w-6 text-zinc-400" /> Online Courses
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              {(template?.resources.onlineCourses || []).length === 0 && (
                <div className="text-sm text-zinc-500">No courses yet. Paste course link/title below.</div>
              )}
              {(template?.resources.onlineCourses || []).map((course: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox id={`course-${index}`} checked={course.checked} onCheckedChange={(v: boolean) => setResources(prev => ({ ...prev, onlineCourses: prev.onlineCourses.map((c: any, i: number) => i === index ? { ...c, checked: v } : c) }))} />
                  <Input value={course.title} onChange={(e) => setResources(prev => ({ ...prev, onlineCourses: prev.onlineCourses.map((c: any, i: number) => i === index ? { ...c, title: e.target.value } : c) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Input placeholder="https://" value={course.url || ''} onChange={(e) => setResources(prev => ({ ...prev, onlineCourses: prev.onlineCourses.map((c: any, i: number) => i === index ? { ...c, url: e.target.value } : c) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Button variant="ghost" size="sm" onClick={() => removeResourceCourse(index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addResourceCourse} className="text-zinc-300">+ Add Course</Button>
            </div>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Youtube className="h-6 w-6 text-zinc-400" /> YouTube Channels
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              {(template?.resources.youtubeChannels || []).length === 0 && (
                <div className="text-sm text-zinc-500">No channels/videos yet. Paste link/title below.</div>
              )}
              {(template?.resources.youtubeChannels || []).map((channel: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox id={`channel-${index}`} checked={channel.checked} onCheckedChange={(v: boolean) => setResources(prev => ({ ...prev, youtubeChannels: prev.youtubeChannels.map((c: any, i: number) => i === index ? { ...c, checked: v } : c) }))} />
                  <Input value={channel.title} onChange={(e) => setResources(prev => ({ ...prev, youtubeChannels: prev.youtubeChannels.map((c: any, i: number) => i === index ? { ...c, title: e.target.value } : c) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Input placeholder="https://" value={channel.url || ''} onChange={(e) => setResources(prev => ({ ...prev, youtubeChannels: prev.youtubeChannels.map((c: any, i: number) => i === index ? { ...c, url: e.target.value } : c) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Button variant="ghost" size="sm" onClick={() => removeResourceChannel(index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                    </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addResourceChannel} className="text-zinc-300">+ Add Channel/Video</Button>
                  </div>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Globe className="h-6 w-6 text-zinc-400" /> Blogs & Websites
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              {(template?.resources.blogsWebsites || []).length === 0 && (
                <div className="text-sm text-zinc-500">No blogs/sites yet. Paste link/title below.</div>
              )}
              {(template?.resources.blogsWebsites || []).map((blog: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox id={`blog-${index}`} checked={blog.checked} onCheckedChange={(v: boolean) => setResources(prev => ({ ...prev, blogsWebsites: prev.blogsWebsites.map((b: any, i: number) => i === index ? { ...b, checked: v } : b) }))} />
                  <Input value={blog.title} onChange={(e) => setResources(prev => ({ ...prev, blogsWebsites: prev.blogsWebsites.map((b: any, i: number) => i === index ? { ...b, title: e.target.value } : b) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Input placeholder="https://" value={blog.url || ''} onChange={(e) => setResources(prev => ({ ...prev, blogsWebsites: prev.blogsWebsites.map((b: any, i: number) => i === index ? { ...b, url: e.target.value } : b) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Button variant="ghost" size="sm" onClick={() => removeResourceBlog(index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addResourceBlog} className="text-zinc-300">+ Add Blog/Website</Button>
                  </div>
            <hr className="my-8 border-zinc-800" />
                </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Codepen className="h-7 w-7 text-orange-400" /> Additional Learning Tools
            </h2>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Codepen className="h-6 w-6 text-zinc-400" /> Practice Platforms
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              {(template?.tools.practicePlatforms || []).length === 0 && (
                <div className="text-sm text-zinc-500">No practice platforms yet. Paste title/link below.</div>
              )}
              {(template?.tools.practicePlatforms || []).map((platform: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox id={`platform-${index}`} checked={platform.checked} onCheckedChange={(v: boolean) => setTools(prev => ({ ...prev, practicePlatforms: prev.practicePlatforms.map((p: any, i: number) => i === index ? { ...p, checked: v } : p) }))} />
                  <Input value={platform.title} onChange={(e) => setTools(prev => ({ ...prev, practicePlatforms: prev.practicePlatforms.map((p: any, i: number) => i === index ? { ...p, title: e.target.value } : p) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Input placeholder="https://" value={platform.url || ''} onChange={(e) => setTools(prev => ({ ...prev, practicePlatforms: prev.practicePlatforms.map((p: any, i: number) => i === index ? { ...p, url: e.target.value } : p) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Button variant="ghost" size="sm" onClick={() => removeToolPractice(index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                  </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addToolPractice} className="text-zinc-300">+ Add Platform</Button>
                        </div>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Users className="h-6 w-6 text-zinc-400" /> Communities
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              {(template?.tools.communities || []).length === 0 && (
                <div className="text-sm text-zinc-500">No communities yet. Paste title/link below.</div>
              )}
              {(template?.tools.communities || []).map((community: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox id={`community-${index}`} checked={community.checked} onCheckedChange={(v: boolean) => setTools(prev => ({ ...prev, communities: prev.communities.map((c: any, i: number) => i === index ? { ...c, checked: v } : c) }))} />
                  <Input value={community.title} onChange={(e) => setTools(prev => ({ ...prev, communities: prev.communities.map((c: any, i: number) => i === index ? { ...c, title: e.target.value } : c) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Input placeholder="https://" value={community.url || ''} onChange={(e) => setTools(prev => ({ ...prev, communities: prev.communities.map((c: any, i: number) => i === index ? { ...c, url: e.target.value } : c) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Button variant="ghost" size="sm" onClick={() => removeToolCommunity(index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                      </div>
                    ))}
              <Button variant="ghost" size="sm" onClick={addToolCommunity} className="text-zinc-300">+ Add Community</Button>
            </div>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Mail className="h-6 w-6 text-zinc-400" /> Newsletters
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              {(template?.tools.newsletters || []).length === 0 && (
                <div className="text-sm text-zinc-500">No newsletters yet. Paste title/link below.</div>
              )}
              {(template?.tools.newsletters || []).map((newsletter: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox id={`newsletter-${index}`} checked={newsletter.checked} onCheckedChange={(v: boolean) => setTools(prev => ({ ...prev, newsletters: prev.newsletters.map((n: any, i: number) => i === index ? { ...n, checked: v } : n) }))} />
                  <Input value={newsletter.title} onChange={(e) => setTools(prev => ({ ...prev, newsletters: prev.newsletters.map((n: any, i: number) => i === index ? { ...n, title: e.target.value } : n) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Input placeholder="https://" value={newsletter.url || ''} onChange={(e) => setTools(prev => ({ ...prev, newsletters: prev.newsletters.map((n: any, i: number) => i === index ? { ...n, url: e.target.value } : n) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Button variant="ghost" size="sm" onClick={() => removeToolNewsletter(index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addToolNewsletter} className="text-zinc-300">+ Add Newsletter</Button>
            </div>
            <hr className="my-8 border-zinc-800" />
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Award className="h-7 w-7 text-yellow-400" /> Achievements & Portfolio
            </h2>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6 text-zinc-400" /> Certificates
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              {(template?.achievements.certificates || []).map((cert: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox id={`cert-${index}`} checked={cert.checked} onCheckedChange={(v: boolean) => setAchievements(prev => ({ ...prev, certificates: prev.certificates.map((c: any, i: number) => i === index ? { ...c, checked: v } : c) }))} />
                  <Input value={cert.title} onChange={(e) => setAchievements(prev => ({ ...prev, certificates: prev.certificates.map((c: any, i: number) => i === index ? { ...c, title: e.target.value } : c) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Button variant="ghost" size="sm" onClick={() => removeCertificate(index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addCertificate} className="text-zinc-300">+ Add Certificate</Button>
            </div>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-zinc-400" /> Projects Portfolio
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              {(template?.achievements.projects || []).map((project: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox id={`project-${index}`} checked={project.checked} onCheckedChange={(v: boolean) => setAchievements(prev => ({ ...prev, projects: prev.projects.map((p: any, i: number) => i === index ? { ...p, checked: v } : p) }))} />
                  <Input value={project.title} onChange={(e) => setAchievements(prev => ({ ...prev, projects: prev.projects.map((p: any, i: number) => i === index ? { ...p, title: e.target.value } : p) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Button variant="ghost" size="sm" onClick={() => removeProject(index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addProject} className="text-zinc-300">+ Add Project</Button>
            </div>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Users className="h-6 w-6 text-zinc-400" /> Community Contributions
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              {(template?.achievements.contributions || []).map((contribution: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox id={`contribution-${index}`} checked={contribution.checked} onCheckedChange={(v: boolean) => setAchievements(prev => ({ ...prev, contributions: prev.contributions.map((c: any, i: number) => i === index ? { ...c, checked: v } : c) }))} />
                  <Input value={contribution.title} onChange={(e) => setAchievements(prev => ({ ...prev, contributions: prev.contributions.map((c: any, i: number) => i === index ? { ...c, title: e.target.value } : c) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Button variant="ghost" size="sm" onClick={() => removeContribution(index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addContribution} className="text-zinc-300">+ Add Contribution</Button>
            </div>
            <hr className="my-8 border-zinc-800" />
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <PenLine className="h-7 w-7 text-indigo-400" /> Learning Journal
            </h2>
            <div className="overflow-x-auto bg-zinc-900 rounded-lg shadow-sm border border-zinc-800">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Topic</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Resources Used</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Key Learnings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Questions</th>
                  </tr>
                </thead>
                <tbody className="bg-zinc-950 divide-y divide-zinc-800">
                  {(template?.journal || []).map((entry: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-100">
                        <Input value={entry.time} onChange={(e) => setJournal(prev => prev.map((j, i) => i === index ? { ...j, time: e.target.value } : j))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                        <Input value={entry.topic} onChange={(e) => setJournal(prev => prev.map((j, i) => i === index ? { ...j, topic: e.target.value } : j))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                        <Input value={entry.resourcesUsed} onChange={(e) => setJournal(prev => prev.map((j, i) => i === index ? { ...j, resourcesUsed: e.target.value } : j))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                        <Input value={entry.keyLearnings} onChange={(e) => setJournal(prev => prev.map((j, i) => i === index ? { ...j, keyLearnings: e.target.value } : j))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                        <div className="flex items-center gap-2">
                          <Input value={entry.questions} onChange={(e) => setJournal(prev => prev.map((j, i) => i === index ? { ...j, questions: e.target.value } : j))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                          <Button variant="ghost" size="sm" onClick={() => removeJournalRow(index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3"><Button variant="ghost" size="sm" onClick={addJournalRow} className="text-zinc-300">+ Add Journal Entry</Button></div>
            <hr className="my-8 border-zinc-800" />
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <CalendarCheck className="h-7 w-7 text-pink-400" /> Quarterly Review
            </h2>

            <div className="mb-8 bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-800">
              <h3 className="text-2xl font-semibold text-zinc-100 mb-4">Q1 Review : Phase 1</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg text-zinc-200 mb-2">Challenges:</h4>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300">
                    {(template?.quarterly.q1.challenges || []).map((item: string, index: number) => (
                      <li key={index}>
                        <div className="flex items-center gap-2">
                          <Input value={item} onChange={(e) => setQuarterly(prev => ({ ...prev, q1: { ...prev.q1, challenges: prev.q1.challenges.map((c: string, i: number) => i === index ? e.target.value : c) } }))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                          <Button variant="ghost" size="sm" onClick={() => removeQ1Field('challenges', index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" size="sm" onClick={() => addQ1Field('challenges')} className="mt-2 text-zinc-300">+ Add Challenge</Button>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-zinc-200 mb-2">Learning:</h4>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300">
                    {(template?.quarterly.q1.learning || []).map((item: string, index: number) => (
                      <li key={index}>
                        <div className="flex items-center gap-2">
                          <Input value={item} onChange={(e) => setQuarterly(prev => ({ ...prev, q1: { ...prev.q1, learning: prev.q1.learning.map((c: string, i: number) => i === index ? e.target.value : c) } }))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                          <Button variant="ghost" size="sm" onClick={() => removeQ1Field('learning', index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" size="sm" onClick={() => addQ1Field('learning')} className="mt-2 text-zinc-300">+ Add Learning</Button>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-zinc-200 mb-2">Need to focused:</h4>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300">
                    {(template?.quarterly.q1.needToFocused || []).map((item: string, index: number) => (
                      <li key={index}>
                        <div className="flex items-center gap-2">
                          <Input value={item} onChange={(e) => setQuarterly(prev => ({ ...prev, q1: { ...prev.q1, needToFocused: prev.q1.needToFocused.map((c: string, i: number) => i === index ? e.target.value : c) } }))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                          <Button variant="ghost" size="sm" onClick={() => removeQ1Field('needToFocused', index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" size="sm" onClick={() => addQ1Field('needToFocused')} className="mt-2 text-zinc-300">+ Add Focus Item</Button>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-zinc-200 mb-2">Goals for Next Quarter:</h4>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300">
                    {(template?.quarterly.q1.goalsForNextQuarter || []).map((item: string, index: number) => (
                      <li key={index}>
                        <div className="flex items-center gap-2">
                          <Input value={item} onChange={(e) => setQuarterly(prev => ({ ...prev, q1: { ...prev.q1, goalsForNextQuarter: prev.q1.goalsForNextQuarter.map((c: string, i: number) => i === index ? e.target.value : c) } }))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                          <Button variant="ghost" size="sm" onClick={() => removeQ1Field('goalsForNextQuarter', index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" size="sm" onClick={() => addQ1Field('goalsForNextQuarter')} className="mt-2 text-zinc-300">+ Add Goal</Button>
                </div>
              </div>
            </div>

            <div className="mb-8 bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-800">
              <h3 className="text-2xl font-semibold text-zinc-100 mb-4">Q2 Review : Phase 2</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg text-zinc-200 mb-2">Progress Made:</h4>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300">
                    {(template?.quarterly.q2.progressMade || []).length > 0 ? (template?.quarterly.q2.progressMade || []).map((item: string, index: number) => (
                      <li key={index}>
                        <div className="flex items-center gap-2">
                          <Input value={item} onChange={(e) => setQuarterly(prev => ({ ...prev, q2: { ...prev.q2, progressMade: prev.q2.progressMade.map((c: string, i: number) => i === index ? e.target.value : c) } }))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                          <Button variant="ghost" size="sm" onClick={() => removeQ2Field('progressMade', index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                        </div>
                      </li>
                    )) : <li className="text-zinc-500">No progress made yet.</li>}
                  </ul>
                  <Button variant="ghost" size="sm" onClick={() => addQ2Field('progressMade')} className="mt-2 text-zinc-300">+ Add Progress</Button>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-zinc-200 mb-2">Challenges:</h4>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300">
                    {(template?.quarterly.q2.challenges || []).length > 0 ? (template?.quarterly.q2.challenges || []).map((item: string, index: number) => (
                      <li key={index}>
                        <div className="flex items-center gap-2">
                          <Input value={item} onChange={(e) => setQuarterly(prev => ({ ...prev, q2: { ...prev.q2, challenges: prev.q2.challenges.map((c: string, i: number) => i === index ? e.target.value : c) } }))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                          <Button variant="ghost" size="sm" onClick={() => removeQ2Field('challenges', index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                        </div>
                      </li>
                    )) : <li className="text-zinc-500">No challenges recorded yet.</li>}
                  </ul>
                  <Button variant="ghost" size="sm" onClick={() => addQ2Field('challenges')} className="mt-2 text-zinc-300">+ Add Challenge</Button>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-zinc-200 mb-2">Adjustments to Roadmap:</h4>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300">
                    {(template?.quarterly.q2.adjustmentsToRoadmap || []).length > 0 ? (template?.quarterly.q2.adjustmentsToRoadmap || []).map((item: string, index: number) => (
                      <li key={index}>
                        <div className="flex items-center gap-2">
                          <Input value={item} onChange={(e) => setQuarterly(prev => ({ ...prev, q2: { ...prev.q2, adjustmentsToRoadmap: prev.q2.adjustmentsToRoadmap.map((c: string, i: number) => i === index ? e.target.value : c) } }))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                          <Button variant="ghost" size="sm" onClick={() => removeQ2Field('adjustmentsToRoadmap', index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                        </div>
                      </li>
                    )) : <li className="text-zinc-500">No adjustments made yet.</li>}
                  </ul>
                  <Button variant="ghost" size="sm" onClick={() => addQ2Field('adjustmentsToRoadmap')} className="mt-2 text-zinc-300">+ Add Adjustment</Button>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-zinc-200 mb-2">Goals for Next Quarter:</h4>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300">
                    {(template?.quarterly.q2.goalsForNextQuarter || []).length > 0 ? (template?.quarterly.q2.goalsForNextQuarter || []).map((item: string, index: number) => (
                      <li key={index}>
                        <div className="flex items-center gap-2">
                          <Input value={item} onChange={(e) => setQuarterly(prev => ({ ...prev, q2: { ...prev.q2, goalsForNextQuarter: prev.q2.goalsForNextQuarter.map((c: string, i: number) => i === index ? e.target.value : c) } }))} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
                          <Button variant="ghost" size="sm" onClick={() => removeQ2Field('goalsForNextQuarter', index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                        </div>
                      </li>
                    )) : <li className="text-zinc-500">No goals set yet.</li>}
                  </ul>
                  <Button variant="ghost" size="sm" onClick={() => addQ2Field('goalsForNextQuarter')} className="mt-2 text-zinc-300">+ Add Goal</Button>
                  </div>
                </div>
            </div>
            <hr className="my-8 border-zinc-800" />
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Lightbulb className="h-7 w-7 text-purple-400" /> Next Steps & Career Planning
            </h2>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-zinc-400" /> Skills to Further Develop
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              {(template?.career.skillsToDevelop || []).map((skill: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox id={`dev-skill-${index}`} checked={skill.checked} onCheckedChange={(v: boolean) => setCareer(prev => ({ ...prev, skillsToDevelop: prev.skillsToDevelop.map((s: any, i: number) => i === index ? { ...s, checked: v } : s) }))} />
                  <Input value={`${skill.name}: ${skill.details}`} onChange={(e) => setCareer(prev => ({ ...prev, skillsToDevelop: prev.skillsToDevelop.map((s: any, i: number) => i === index ? { ...s, name: e.target.value.split(':')[0] || s.name, details: e.target.value.split(':').slice(1).join(':').trim() || s.details } : s) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Button variant="ghost" size="sm" onClick={() => removeCareerSkill(index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addCareerSkill} className="text-zinc-300">+ Add Skill</Button>
            </div>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Target className="h-6 w-6 text-zinc-400" /> Research Interests
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              {(template?.career.researchInterests || []).map((interest: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox id={`research-interest-${index}`} checked={interest.checked} onCheckedChange={(v: boolean) => setCareer(prev => ({ ...prev, researchInterests: prev.researchInterests.map((s: any, i: number) => i === index ? { ...s, checked: v } : s) }))} />
                  <Input value={`${interest.name}: ${interest.details}`} onChange={(e) => setCareer(prev => ({ ...prev, researchInterests: prev.researchInterests.map((s: any, i: number) => i === index ? { ...s, name: e.target.value.split(':')[0] || s.name, details: e.target.value.split(':').slice(1).join(':').trim() || s.details } : s) }))} className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100" />
                  <Button variant="ghost" size="sm" onClick={() => removeResearchInterest(index)} className="text-zinc-400 hover:text-zinc-100"><X className="h-4 w-4" /></Button>
              </div>
            ))}
              <Button variant="ghost" size="sm" onClick={addResearchInterest} className="text-zinc-300">+ Add Research Interest</Button>
            </div>

            <h3 className="text-2xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Rocket className="h-6 w-6 text-zinc-400" /> Career Goals
            </h3>
            <div className="space-y-3 mb-6 bg-zinc-900 p-5 rounded-lg shadow-sm border border-zinc-800">
              <div className="text-base text-zinc-300"><span className="font-medium">Short-term (6-12 months):</span> <Input value={template?.career.careerGoals.shortTerm || ''} onChange={(e) => setCareer(prev => ({ ...prev, careerGoals: { ...prev.careerGoals, shortTerm: e.target.value } }))} className="inline-block bg-zinc-900 border-zinc-700 text-zinc-100" /></div>
              <div className="text-base text-zinc-300"><span className="font-medium">Medium-term (1-2 years):</span> <Input value={template?.career.careerGoals.mediumTerm || ''} onChange={(e) => setCareer(prev => ({ ...prev, careerGoals: { ...prev.careerGoals, mediumTerm: e.target.value } }))} className="inline-block bg-zinc-900 border-zinc-700 text-zinc-100" /></div>
              <div className="text-base text-zinc-300"><span className="font-medium">Long-term (3-5 years):</span> <Input value={template?.career.careerGoals.longTerm || ''} onChange={(e) => setCareer(prev => ({ ...prev, careerGoals: { ...prev.careerGoals, longTerm: e.target.value } }))} className="inline-block bg-zinc-900 border-zinc-700 text-zinc-100" /></div>
            </div>
            <hr className="my-8 border-zinc-800" />
          </div>

        </div>
      </div>
      <CommentDialog
        open={commentDialogOpen}
        onOpenChange={setCommentDialogOpen}
        roadmapId={id}
        postTitle={roadmap?.title || "Roadmap"}
        comments={currentRoadmapComments}
        onCommentAdded={fetchRoadmapComments}
      />
    </Layout>
  );
};

export default RoadmapView;

