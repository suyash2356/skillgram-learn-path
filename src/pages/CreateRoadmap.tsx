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
import { generateAIPrompt, callAIGenerator } from "@/lib/aiRoadmapGenerator";

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
  const [isPublic, setIsPublic] = useState(false); // New state for public/private
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
      const aiPrompt = generateAIPrompt({
        title: formData.title,
        description: formData.description,
        skillLevel: skillLevels.find(level => level.value === formData.skillLevel)?.label || 'Not specified',
        timeCommitment: timeCommitments.find(time => time.value === formData.timeCommitment)?.label || 'Not specified',
        targetRole: formData.targetRole,
        preferredLearningStyle: learningStyles.find(style => style.value === formData.preferredLearningStyle)?.label || 'Not specified',
        focusAreas: formData.focusAreas,
        deadline: formData.deadline,
        recommendedResources: recommendedResources,
        useRecommendedResources: useRecommendedResources,
      });

      console.log("AI Prompt:", aiPrompt);

      // 2. Make actual AI API call
      const aiResponse = await callAIGenerator(aiPrompt);
      console.log("AI Response:", aiResponse);

      // 3. Use the AI response directly, assuming it returns structured data
      const roadmapDataFromAI = aiResponse;

      // 4. Insert the main roadmap entry
      const insertedRoadmapData: TablesInsert<'roadmaps'> = {
        user_id: user.id,
        title: roadmapDataFromAI.title || formData.title || 'Custom Roadmap',
        description: roadmapDataFromAI.description || formData.description || null,
        category: formData.targetRole || null,
        difficulty: formData.skillLevel || null,
        estimated_time: roadmapDataFromAI.estimatedDuration || formData.timeCommitment || null,
        technologies: formData.focusAreas,
        status: 'not-started',
        progress: 0,
        is_public: isPublic, // Include the isPublic flag
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
      for (const phase of roadmapDataFromAI.phases) {
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

  // Remove old mock AI response function
  // const generateRoadmapFromAI = async (prompt: string): Promise<any> => { ... };

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
        is_public: isPublic, // Include the isPublic flag
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

  const previewRoadmap = generateAIPrompt({
    title: formData.title,
    description: formData.description,
    skillLevel: skillLevels.find(level => level.value === formData.skillLevel)?.label || 'Not specified',
    timeCommitment: timeCommitments.find(time => time.value === formData.timeCommitment)?.label || 'Not specified',
    targetRole: formData.targetRole,
    preferredLearningStyle: learningStyles.find(style => style.value === formData.preferredLearningStyle)?.label || 'Not specified',
    focusAreas: formData.focusAreas,
    deadline: formData.deadline,
  }, [], false // No recommended resources for preview, and don't use them.
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-public"
                checked={isPublic}
                onCheckedChange={(checked: boolean) => setIsPublic(checked)}
              />
              <Label htmlFor="is-public" className="text-sm cursor-pointer">
                Make this roadmap public (discoverable by others)
              </Label>
            </div>

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