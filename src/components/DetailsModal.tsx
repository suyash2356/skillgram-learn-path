import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  Users, 
  Clock, 
  BookOpen, 
  ExternalLink,
  Award,
  DollarSign,
  Calendar,
  Target,
  Play
} from "lucide-react";

interface SkillDetails {
  name: string;
  category: string;
  learners: string;
  difficulty: string;
  rating: number;
  description: string;
  link: string;
  prerequisites: string[];
  curriculum: string[];
  skillsGained: string[];
  learningObjectives: string[];
  estimatedTime: string;
}

interface CertificationDetails {
  name: string;
  provider: string;
  difficulty: string;
  passingScore: string;
  avgSalary: string;
  nextExam: string;
  duration: string;
  cost: string;
  description: string;
  link: string;
  prerequisites: string[];
  examTopics: string[];
  studyMaterials: string[];
  skillsValidated: string[];
  careerPaths: string[];
}

interface PathDetails {
  title: string;
  description: string;
  duration: string;
  skills: string[];
  level: string;
  students: string;
  rating: number;
  price: string;
  projects: number;
  link: string;
  prerequisites: string[];
  modules: string[];
  learningOutcomes: string[];
  tools: string[];
  assignments: string[];
}

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'skill' | 'certification' | 'path';
  data: SkillDetails | CertificationDetails | PathDetails | null;
  onStart: () => void;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  type, 
  data, 
  onStart 
}) => {
  if (!data) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'associate': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderSkillDetails = (skill: SkillDetails) => (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">{skill.name}</h2>
          <Badge variant="outline" className="mb-3">{skill.category}</Badge>
        </div>
        <Badge className={getDifficultyColor(skill.difficulty)}>
          {skill.difficulty}
        </Badge>
      </div>

      <p className="text-muted-foreground leading-relaxed">{skill.description}</p>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Learners</p>
              <p className="font-semibold">{skill.learners}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Star className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Rating</p>
              <div className="flex items-center space-x-1">
                <span className="font-semibold">{skill.rating}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3 w-3 ${i < Math.floor(skill.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Clock className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Estimated Time</p>
              <p className="font-semibold">{skill.estimatedTime || 'Self-paced'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Prerequisites
          </h3>
          <div className="flex flex-wrap gap-2">
            {(skill.prerequisites || []).map((prereq, index) => (
              <Badge key={index} variant="outline">{prereq}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            What You'll Learn
          </h3>
          <ul className="space-y-1">
            {(skill.learningObjectives || []).map((objective, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start">
                <span className="text-primary mr-2">•</span>
                {objective}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <Award className="h-4 w-4 mr-2" />
            Skills You'll Gain
          </h3>
          <div className="flex flex-wrap gap-2">
            {(skill.skillsGained || []).map((skillGained, index) => (
              <Badge key={index} variant="secondary">{skillGained}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Course Curriculum</h3>
          <div className="space-y-2">
            {(skill.curriculum || []).map((module, index) => (
              <div key={index} className="flex items-center text-sm">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs mr-3">{index + 1}</span>
                <span>{module}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex space-x-3">
        <Button onClick={onStart} className="flex-1">
          <Play className="h-4 w-4 mr-2" />
          Start Learning
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );

  const renderCertificationDetails = (cert: CertificationDetails) => (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">{cert.name}</h2>
          <Badge variant="outline" className="mb-3">{cert.provider}</Badge>
        </div>
        <Badge className={getDifficultyColor(cert.difficulty)}>
          {cert.difficulty}
        </Badge>
      </div>

      <p className="text-muted-foreground leading-relaxed">{cert.description}</p>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <DollarSign className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Average Salary</p>
              <p className="font-semibold">{cert.avgSalary}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Target className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Passing Score</p>
              <p className="font-semibold">{cert.passingScore}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Clock className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-semibold">{cert.duration}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Next Exam</p>
              <p className="font-semibold">{cert.nextExam}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Award className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Exam Cost</p>
              <p className="font-semibold">{cert.cost}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Prerequisites
          </h3>
          <div className="flex flex-wrap gap-2">
            {(cert.prerequisites || []).map((prereq, index) => (
              <Badge key={index} variant="outline">{prereq}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Exam Topics
          </h3>
          <ul className="space-y-1">
            {(cert.examTopics || []).map((topic, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start">
                <span className="text-primary mr-2">•</span>
                {topic}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <Award className="h-4 w-4 mr-2" />
            Skills Validated
          </h3>
          <div className="flex flex-wrap gap-2">
            {(cert.skillsValidated || []).map((skill, index) => (
              <Badge key={index} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Study Materials</h3>
          <div className="space-y-2">
            {(cert.studyMaterials || []).map((material, index) => (
              <div key={index} className="flex items-center text-sm">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs mr-3">{index + 1}</span>
                <span>{material}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Career Paths</h3>
          <div className="flex flex-wrap gap-2">
            {(cert.careerPaths || []).map((path, index) => (
              <Badge key={index} variant="outline" className="bg-green-50 text-green-700">{path}</Badge>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex space-x-3">
        <Button onClick={onStart} className="flex-1">
          <ExternalLink className="h-4 w-4 mr-2" />
          Start Preparation
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );

  const renderPathDetails = (path: PathDetails) => (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">{path.title}</h2>
          <Badge variant="outline" className="mb-3">{path.level}</Badge>
        </div>
        <Badge className="bg-green-100 text-green-800">
          {path.price}
        </Badge>
      </div>

      <p className="text-muted-foreground leading-relaxed">{path.description}</p>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Students</p>
              <p className="font-semibold">{path.students}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Star className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Rating</p>
              <div className="flex items-center space-x-1">
                <span className="font-semibold">{path.rating}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3 w-3 ${i < Math.floor(path.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Clock className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-semibold">{path.duration}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <BookOpen className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Projects</p>
              <p className="font-semibold">{path.projects}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Prerequisites
          </h3>
          <div className="flex flex-wrap gap-2">
            {(path.prerequisites || []).map((prereq, index) => (
              <Badge key={index} variant="outline">{prereq}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Learning Path Modules
          </h3>
          <div className="space-y-2">
            {(path.modules || []).map((module, index) => (
              <div key={index} className="flex items-center text-sm">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs mr-3">{index + 1}</span>
                <span>{module}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Learning Outcomes</h3>
          <ul className="space-y-1">
            {(path.learningOutcomes || []).map((outcome, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start">
                <span className="text-primary mr-2">•</span>
                {outcome}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Skills You'll Learn</h3>
          <div className="flex flex-wrap gap-2">
            {path.skills.map((skill, index) => (
              <Badge key={index} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Tools & Technologies</h3>
          <div className="flex flex-wrap gap-2">
            {(path.tools || []).map((tool, index) => (
              <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">{tool}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Assignments & Projects</h3>
          <div className="space-y-2">
            {(path.assignments || []).map((assignment, index) => (
              <div key={index} className="flex items-center text-sm">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-3">Project {index + 1}</span>
                <span>{assignment}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex space-x-3">
        <Button onClick={onStart} className="flex-1">
          <Play className="h-4 w-4 mr-2" />
          Start Learning Path
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Course Details</DialogTitle>
        </DialogHeader>
        
        {type === 'skill' && renderSkillDetails(data as SkillDetails)}
        {type === 'certification' && renderCertificationDetails(data as CertificationDetails)}
        {type === 'path' && renderPathDetails(data as PathDetails)}
      </DialogContent>
    </Dialog>
  );
};