import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Target, 
  Calendar, 
  BookOpen, 
  Sparkles,
  Plus,
  X,
  Clock,
  TrendingUp,
  LinkIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase as rawSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TypedSupabaseClient } from "@/integrations/supabase/client";
import { TablesInsert, Database } from "@/integrations/supabase/types";

const supabase = rawSupabase as TypedSupabaseClient;

// Helper function to bypass Supabase type inference issues
const getTypedTable = <T extends keyof Database['public']['Tables']>(tableName: T) => {
  return supabase.from(tableName as any);
};

type IdResult = { id: string }[];

const CreateRoadmap = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendedResources, setRecommendedResources] = useState<any[]>([]);
  const [useRecommendedResources, setUseRecommendedResources] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skillLevel: "",
    timeCommitment: "",
    targetRole: "",
    preferredLearningStyle: "",
    focusAreas: [] as string[],
    deadline: ""
  });

  useEffect(() => {
    const topic = searchParams.get('topic');
    const recommendationsParam = searchParams.get('recommendations');

    if (topic) {
      setFormData(prev => ({
        ...prev,
        title: `${topic} Learning Roadmap`,
        description: `Comprehensive learning path for mastering ${topic}`
      }));
    }

    if (recommendationsParam) {
      try {
        const parsedRecommendations = JSON.parse(decodeURIComponent(recommendationsParam));
        setRecommendedResources(parsedRecommendations);
        setUseRecommendedResources(true); // Default to true if recommendations are present
      } catch (error) {
        console.error("Error parsing recommendations from URL:", error);
      }
    }
  }, [searchParams]);

  const skillLevels = [
    { value: "beginner", label: "Beginner - New to this field" },
    { value: "intermediate", label: "Intermediate - Some experience" },
    { value: "advanced", label: "Advanced - Experienced professional" }
  ];

  const timeCommitments = [
    { value: "2-5", label: "2-5 hours per week" },
    { value: "5-10", label: "5-10 hours per week" },
    { value: "10-15", label: "10-15 hours per week" },
    { value: "15+", label: "15+ hours per week" }
  ];

  const learningStyles = [
    { value: "visual", label: "Visual (videos, diagrams)" },
    { value: "reading", label: "Reading (articles, documentation)" },
    { value: "hands-on", label: "Hands-on (projects, coding)" },
    { value: "mixed", label: "Mixed approach" }
  ];

  const availableFocusAreas = [
    "Frontend Development", "Backend Development", "Mobile Development",
    "Data Science", "Machine Learning", "DevOps", "Cloud Computing",
    "Cybersecurity", "UI/UX Design", "Product Management", "System Design",
    "Database Management", "API Development", "Testing", "Web3/Blockchain"
  ];

  const handleFocusAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(item => item !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateRoadmap = async () => {
    if (!user) {
      toast({ title: 'Please log in', description: 'You must be logged in to generate a roadmap.', variant: 'destructive' });
      return;
    }
    setIsGenerating(true);
    try {
      // 1. Construct a comprehensive prompt for the AI
      let aiPrompt = `Generate a detailed learning roadmap for "${formData.title}".\n\n`;
      aiPrompt += `Objective: ${formData.description}.\n`;
      aiPrompt += `Current Skill Level: ${skillLevels.find(level => level.value === formData.skillLevel)?.label || 'Not specified'}.\n`;
      aiPrompt += `Weekly Time Commitment: ${timeCommitments.find(time => time.value === formData.timeCommitment)?.label || 'Not specified'}.\n`;
      if (formData.targetRole) {
        aiPrompt += `Target Role/Position: ${formData.targetRole}.\n`;
      }
      if (formData.preferredLearningStyle) {
        aiPrompt += `Preferred Learning Style: ${learningStyles.find(style => style.value === formData.preferredLearningStyle)?.label || 'Not specified'}.\n`;
      }
      if (formData.focusAreas.length > 0) {
        aiPrompt += `Key Focus Areas: ${formData.focusAreas.join(', ')}.\n`;
      }
      if (formData.deadline) {
        aiPrompt += `Target Completion Date: ${formData.deadline}.\n`;
      }

      if (useRecommendedResources && recommendedResources.length > 0) {
        aiPrompt += `\nConsider integrating the following recommended resources:\n`;
        recommendedResources.forEach((res, index) => {
          aiPrompt += `${index + 1}. ${res.title} (${res.type}): ${res.url}\n`;
        });
      }

      aiPrompt += `\nStructure the roadmap into phases (e.g., Beginner, Intermediate, Advanced), with detailed modules and sub-modules within each phase. Suggest specific learning activities or resources for each module.`;

      console.log("AI Prompt:", aiPrompt);

      // 2. Simulate AI response (replace with actual AI API call in a real scenario)
      const simulatedAIResponse = generateMockRoadmap(aiPrompt, recommendedResources, useRecommendedResources);
      console.log("Simulated AI Response:", simulatedAIResponse);

      // 3. Insert the main roadmap entry
      const insertedRoadmapData: TablesInsert<'roadmaps'> = {
        user_id: user.id,
        title: simulatedAIResponse.title || formData.title || 'Custom Roadmap',
        description: simulatedAIResponse.description || formData.description || null,
        category: formData.targetRole || null,
        difficulty: formData.skillLevel || null,
        estimated_time: simulatedAIResponse.estimatedDuration || formData.timeCommitment || null,
        technologies: formData.focusAreas,
        status: 'not-started',
        progress: 0,
        is_public: false,
      };
      console.log("Inserting Roadmap Data:", insertedRoadmapData);
      const { data: insertedRoadmap, error: roadmapError } = await getTypedTable('roadmaps')
        .insert(insertedRoadmapData)
        .select('id') as { data: IdResult | null, error: any };

      if (roadmapError || !insertedRoadmap || insertedRoadmap.length === 0) {
        console.error("Roadmap insertion error:", roadmapError);
        throw roadmapError || new Error('Failed to create roadmap');
      }
      const roadmapId = insertedRoadmap[0].id;
      console.log("Roadmap inserted with ID:", roadmapId);

      // 4. Insert roadmap steps and resources from the simulated AI response
      let currentOrderIndex = 0;
      for (const phase of simulatedAIResponse.phases) {
        const stepData: TablesInsert<'roadmap_steps'> = {
          roadmap_id: roadmapId,
          title: phase.name,
          description: phase.description,
          order_index: currentOrderIndex,
          duration: phase.duration,
          completed: false,
          topics: phase.topics || null,
          task: phase.task || null,
        };
        console.log("Inserting Step Data:", stepData);
        const { data: insertedStep, error: stepError } = await getTypedTable('roadmap_steps')
          .insert(stepData)
          .select('id') as { data: IdResult | null, error: any };

        if (stepError || !insertedStep || insertedStep.length === 0) {
          console.error("Roadmap step insertion error:", stepError);
          continue;
        }
        const stepId = insertedStep[0].id;
        console.log("Roadmap Step inserted with ID:", stepId);
        currentOrderIndex++;

        if (phase.resources && phase.resources.length > 0) {
          const resourcePayload: TablesInsert<'roadmap_step_resources'>[] = phase.resources.map((resource: any) => ({
            step_id: stepId,
            title: resource.title,
            url: resource.url || null,
            type: resource.type || null,
          }));
          console.log("Inserting Resources Data:", resourcePayload);
          const { error: resourcesError } = await getTypedTable('roadmap_step_resources').insert(resourcePayload);
          if (resourcesError) {
            console.error("Resources insertion error:", resourcesError);
          }
        }
      }

      toast({
        title: 'Roadmap Generated!',
        description: 'Your personalized learning roadmap has been created successfully.',
      });
      window.location.href = `/roadmaps/${roadmapId}`;
    } catch (e: any) {
      console.error('generateRoadmap error', e);
      toast({ title: 'Failed to generate roadmap', description: e?.message || '', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Mock AI response function
  const generateMockRoadmap = (prompt: string, recommendedResources: any[], useRecommendedResources: boolean) => {
    const titleMatch = prompt.match(/Generate a detailed learning roadmap for "(.*?)"/);
    const title = titleMatch ? titleMatch[1] : 'Personalized Learning Roadmap';

    const descriptionMatch = prompt.match(/Objective: (.*?)\n/);
    const description = descriptionMatch ? descriptionMatch[1] : 'A comprehensive learning path tailored to your needs.';

    const estimatedDurationMatch = prompt.match(/Weekly Time Commitment: (.*?)\./);
    const rawEstimatedTime = estimatedDurationMatch ? estimatedDurationMatch[1] : '5-10 hours per week';
    let totalWeeks = 12; // Default total duration
    if (rawEstimatedTime.includes('2-5')) totalWeeks = 16; // Longer for less time commitment
    else if (rawEstimatedTime.includes('10-15')) totalWeeks = 8;
    else if (rawEstimatedTime.includes('15+')) totalWeeks = 6; // Shorter for high time commitment

    const skillLevelMatch = prompt.match(/Current Skill Level: (.*?)\./);
    const skillLevel = skillLevelMatch ? skillLevelMatch[1].toLowerCase() : 'beginner';

    const focusAreasMatch = prompt.match(/Key Focus Areas: (.*?)\./);
    const focusAreas = focusAreasMatch ? focusAreasMatch[1].split(', ').map(s => s.trim()) : [];

    // Roadmap Structure (Mold)
    const phases: any[] = [];
    let currentWeek = 1;

    // Introduction Phase
    phases.push({
      name: 'Introduction: Getting Started',
      description: `Embark on your journey to master ${title.replace(' Learning Roadmap', '')}. This phase will establish foundational knowledge tailored to your ${skillLevel} level.`,      duration: '1 week',
      resources: useRecommendedResources ? recommendedResources : [],
      topics: [
        `Understanding the basics of ${title.replace(' Learning Roadmap', '')}`,
        'Setting up your development environment (if applicable)',
        'Core concepts and terminology',
      ],
      task: 'Complete a "Hello World" equivalent project.',
    });
    currentWeek++;

    // Weekly/Phase Breakdown
    while (currentWeek <= totalWeeks) {
      let phaseName = '';
      let phaseDescription = '';
      let topics: string[] = [];
      let task = '';
      let phaseDuration = '1 week';

      if (currentWeek <= totalWeeks / 3) {
        phaseName = `Week ${currentWeek}: Fundamentals`;
        phaseDescription = 'Deep dive into foundational concepts and basic syntax.';
        topics = [
          `Fundamental concepts of ${title.replace(' Learning Roadmap', '')}`,
          'Basic data structures and algorithms (if applicable)',
          'Control flow and functions',
        ];
        if (focusAreas.length > 0) {
          topics.push(`Introduction to ${focusAreas[0]} concepts`);
        }
        task = 'Implement a simple calculator or data manipulation script.';
      } else if (currentWeek <= (totalWeeks * 2) / 3) {
        phaseName = `Week ${currentWeek}: Intermediate Concepts`;
        phaseDescription = 'Develop core skills with practical application and problem-solving.';
        topics = [
          'Object-Oriented Programming or advanced paradigms',
          'API integration or system interaction (if applicable)',
          'Error handling and debugging',
        ];
        if (focusAreas.length > 0) {
          topics.push(`Intermediate ${focusAreas[0]} techniques`);
        }
        task = 'Build a small web application or a data analysis pipeline.';
      } else {
        phaseName = `Week ${currentWeek}: Advanced Topics & Specialization`;
        phaseDescription = 'Master complex areas and explore specialized topics.';
        topics = [
          'Advanced design patterns or architectural principles',
          'Performance optimization and scaling',
          'Security best practices',
        ];
        if (focusAreas.length > 0) {
          topics.push(`Advanced ${focusAreas[0]} concepts and tools`);
          if (focusAreas.length > 1) topics.push(`Exploring ${focusAreas[1]} integration`);
        }
        task = 'Lead a significant feature development or a complex data science project.';
      }

      phases.push({
        name: phaseName,
        description: phaseDescription,
        duration: phaseDuration,
        topics: topics,
        task: task,
        resources: [], // Resources can be added dynamically here if needed beyond initial recommendations
      });

      // Milestones
      if (currentWeek % 4 === 0 && currentWeek < totalWeeks) {
        phases.push({
          name: `Milestone: End of Week ${currentWeek}`,
          description: `Key achievements: Demonstrated proficiency in core ${title.replace(' Learning Roadmap', '')} concepts, completed hands-on projects.`,          duration: 'N/A',
          type: 'milestone',
          topics: [
            'Skills gained: Core syntax, basic problem-solving',
            'Progress markers: Successfully completed several mini-projects',
          ],
        });
      }
      currentWeek++;
    }
    // Final Outcome
    phases.push({
      name: 'Final Outcome: Mastery Achieved',
      description: `Congratulations! You have completed your ${title.replace(' Learning Roadmap', '')} journey.`,      duration: 'N/A',
      type: 'final-outcome',
      topics: [
        `Skills: Mastered ${title.replace(' Learning Roadmap', '')}, including ${focusAreas.join(', ') || 'all key areas'}.`,
        'Certifications: Prepared for relevant industry certifications.',
        'Portfolio: Developed a strong portfolio with practical projects.',
        `Ready for ${descriptionMatch ? descriptionMatch[1].toLowerCase() : 'new challenges'}.`,
      ],
    });

    return {
      title: title,
      description: description,
      estimatedDuration: totalWeeks === 1 ? '1 week' : `${totalWeeks} weeks`,
      phases: phases,
    };
  };

  const [isSaving, setIsSaving] = useState(false);
  const saveDraft = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const insertedRoadmapData: TablesInsert<'roadmaps'> = {
        user_id: user.id,
        title: formData.title || 'Untitled Roadmap',
        description: formData.description || null,
        category: formData.targetRole || null,
        difficulty: formData.skillLevel || null,
        estimated_time: formData.timeCommitment || null,
        technologies: formData.focusAreas,
        status: 'not-started',
        progress: 0,
        is_public: false,
      };
      const { error } = await getTypedTable('roadmaps')
        .insert(insertedRoadmapData);
      if (error) throw error;
      toast({ title: 'Draft saved' });
      window.location.href = '/roadmaps';
    } catch (e: any) {
      console.error('saveDraft error', e);
      toast({ title: 'Failed to save draft', description: e?.message || '', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const previewRoadmap = generateMockRoadmap(
    `Generate a detailed learning roadmap for "${formData.title}".\n\n` +
    `Objective: ${formData.description}.\n` +
    `Current Skill Level: ${skillLevels.find(level => level.value === formData.skillLevel)?.label || 'Not specified'}.\n` +
    `Weekly Time Commitment: ${timeCommitments.find(time => time.value === formData.timeCommitment)?.label || 'Not specified'}.\n` +
    (formData.targetRole ? `Target Role/Position: ${formData.targetRole}.\n` : '') +
    (formData.preferredLearningStyle ? `Preferred Learning Style: ${learningStyles.find(style => style.value === formData.preferredLearningStyle)?.label || 'Not specified'}.\n` : '') +
    (formData.focusAreas.length > 0 ? `Key Focus Areas: ${formData.focusAreas.join(', ')}.\n` : '') +
    (formData.deadline ? `Target Completion Date: ${formData.deadline}.\n` : '')
    , [], false // No recommended resources for preview, and don't use them.
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Create AI{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Roadmap
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Let our AI create a personalized learning path tailored to your goals, experience, and schedule
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Learning Goals</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Roadmap Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Full Stack Developer Roadmap"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Learning Objective</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you want to achieve with this roadmap..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetRole">Target Role/Position</Label>
                  <Input
                    id="targetRole"
                    placeholder="e.g., Frontend Developer, Data Scientist"
                    value={formData.targetRole}
                    onChange={(e) => handleInputChange("targetRole", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Your Background</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Current Skill Level</Label>
                  <Select onValueChange={(value) => handleInputChange("skillLevel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Learning Style</Label>
                  <Select onValueChange={(value) => handleInputChange("preferredLearningStyle", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="How do you learn best?" />
                    </SelectTrigger>
                    <SelectContent>
                      {learningStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Schedule & Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Weekly Time Commitment</Label>
                  <Select onValueChange={(value) => handleInputChange("timeCommitment", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="How much time can you dedicate?" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeCommitments.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Target Completion Date (Optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Focus Areas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select the areas you want to focus on in your learning journey
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableFocusAreas.map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox
                          id={area}
                          checked={formData.focusAreas.includes(area)}
                          onCheckedChange={() => handleFocusAreaToggle(area)}
                        />
                        <Label
                          htmlFor={area}
                          className="text-sm cursor-pointer"
                        >
                          {area}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {formData.focusAreas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.focusAreas.map((area) => (
                        <Badge key={area} variant="secondary" className="flex items-center space-x-1">
                          <span>{area}</span>
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleFocusAreaToggle(area)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {recommendedResources.length > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <span>Recommended Resources</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-recommendations"
                      checked={useRecommendedResources}
                      onCheckedChange={(checked: boolean) => setUseRecommendedResources(checked)}
                    />
                    <Label htmlFor="use-recommendations" className="text-sm cursor-pointer">
                      Include these recommended resources in my roadmap
                    </Label>
                  </div>
                  {useRecommendedResources && (
                    <div className="space-y-3 mt-4">
                      {recommendedResources.map((resource, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <span className="text-muted-foreground">•</span>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {resource.title} ({resource.type})
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex space-x-4">
              <Button
                onClick={generateRoadmap}
                disabled={isGenerating || !formData.title || formData.focusAreas.length === 0}
                className="flex-1 shadow-glow"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating Roadmap...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate AI Roadmap
                  </>
                )}
              </Button>
              <Button variant="outline" className="px-8" onClick={saveDraft} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card className="shadow-card sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Roadmap Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{previewRoadmap.title}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Estimated: {previewRoadmap.estimatedDuration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4" />
                      <span>{previewRoadmap.phases.length} phases</span>
                    </div>
                  </div>
                </div>

                {formData.focusAreas.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Focus Areas</h4>
                    <div className="flex flex-wrap gap-1">
                      {formData.focusAreas.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {formData.focusAreas.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{formData.focusAreas.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-3">Learning Phases</h4>
                  <div className="space-y-3">
                    {previewRoadmap.phases.map((phase, index) => (
                      <div key={index} className="border-l-2 border-primary pl-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-sm">{phase.name}</h5>
                            <p className="text-xs text-muted-foreground">{phase.description}</p>
                            <p className="text-xs text-muted-foreground">Duration: {phase.duration}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {phase.resources?.length || 0} resources
                          </Badge>
                        </div>
                        {phase.resources && phase.resources.length > 0 && (
                          <div className="mt-2 space-y-1 text-xs">
                            <p className="font-medium text-muted-foreground">Key Resources:</p>
                            {phase.resources.map((res: any, resIndex: number) => (
                              <div key={resIndex} className="flex items-center space-x-1">
                                <LinkIcon className="h-3 w-3" />
                                <a href={res.url || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                  {res.title} ({res.type})
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    This is a preview based on your selections. The final roadmap will include 
                    detailed modules, resources, and milestones.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateRoadmap;