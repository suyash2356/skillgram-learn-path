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
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreateRoadmap = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);
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
    if (topic) {
      setFormData(prev => ({
        ...prev,
        title: `${topic} Learning Roadmap`,
        description: `Comprehensive learning path for mastering ${topic}`
      }));
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
    setIsGenerating(true);
    
    // Simulate AI roadmap generation
    setTimeout(() => {
      toast({
        title: "Roadmap Generated!",
        description: "Your personalized learning roadmap has been created successfully.",
      });
      setIsGenerating(false);
      // Navigate to roadmaps page
      window.location.href = "/roadmaps";
    }, 3000);
  };

  const previewRoadmap = {
    title: formData.title || "Your Custom Learning Path",
    estimatedDuration: "3-4 months",
    totalMilestones: 8,
    skills: formData.focusAreas.slice(0, 3),
    phases: [
      { name: "Foundation", duration: "2-3 weeks", modules: 4 },
      { name: "Core Skills", duration: "6-8 weeks", modules: 8 },
      { name: "Advanced Topics", duration: "4-6 weeks", modules: 6 },
      { name: "Project Portfolio", duration: "2-3 weeks", modules: 3 }
    ]
  };

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
              <Button variant="outline" className="px-8">
                Save Draft
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
                      <span>{previewRoadmap.totalMilestones} milestones</span>
                    </div>
                  </div>
                </div>

                {formData.focusAreas.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Focus Areas</h4>
                    <div className="flex flex-wrap gap-1">
                      {previewRoadmap.skills.map((skill) => (
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
                            <p className="text-xs text-muted-foreground">{phase.duration}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {phase.modules} modules
                          </Badge>
                        </div>
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