import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  TrendingUp, 
  Code, 
  Palette, 
  Database, 
  Brain, 
  Shield,
  Smartphone,
  Users,
  Star,
  Clock,
  BookOpen
} from "lucide-react";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "Programming", icon: Code, count: 245, color: "bg-blue-500" },
    { name: "Design", icon: Palette, count: 128, color: "bg-pink-500" },
    { name: "Data Science", icon: Database, count: 187, color: "bg-green-500" },
    { name: "AI/ML", icon: Brain, count: 156, color: "bg-purple-500" },
    { name: "Cybersecurity", icon: Shield, count: 89, color: "bg-red-500" },
    { name: "Mobile Dev", icon: Smartphone, count: 134, color: "bg-orange-500" }
  ];

  const trendingSkills = [
    {
      name: "React 18",
      category: "Frontend",
      learners: "23.5k",
      difficulty: "Intermediate",
      rating: 4.8,
      trending: true
    },
    {
      name: "Python for Data Science",
      category: "Data Science",
      learners: "45.2k",
      difficulty: "Beginner",
      rating: 4.9,
      trending: true
    },
    {
      name: "Machine Learning Fundamentals",
      category: "AI/ML",
      learners: "18.7k",
      difficulty: "Advanced",
      rating: 4.7,
      trending: true
    },
    {
      name: "Node.js Backend Development",
      category: "Backend",
      learners: "31.8k",
      difficulty: "Intermediate",
      rating: 4.6,
      trending: false
    },
    {
      name: "UI/UX Design Principles",
      category: "Design",
      learners: "27.3k",
      difficulty: "Beginner",
      rating: 4.8,
      trending: false
    },
    {
      name: "DevOps with Docker",
      category: "Infrastructure",
      learners: "15.9k",
      difficulty: "Advanced",
      rating: 4.5,
      trending: false
    }
  ];

  const examCertifications = [
    {
      name: "AWS Solutions Architect",
      provider: "Amazon Web Services",
      difficulty: "Professional",
      passingScore: "72%",
      avgSalary: "$130k",
      nextExam: "March 15, 2024"
    },
    {
      name: "Google Cloud Professional",
      provider: "Google Cloud",
      difficulty: "Professional",
      passingScore: "70%",
      avgSalary: "$125k",
      nextExam: "March 22, 2024"
    },
    {
      name: "Certified Kubernetes Administrator",
      provider: "CNCF",
      difficulty: "Expert",
      passingScore: "74%",
      avgSalary: "$140k",
      nextExam: "April 5, 2024"
    },
    {
      name: "Meta Frontend Developer",
      provider: "Meta",
      difficulty: "Intermediate",
      passingScore: "80%",
      avgSalary: "$95k",
      nextExam: "Continuous"
    }
  ];

  const learningPaths = [
    {
      title: "Full Stack Web Developer",
      description: "Complete path from frontend to backend development",
      duration: "6-8 months",
      skills: ["HTML/CSS", "JavaScript", "React", "Node.js", "Database"],
      level: "Beginner to Advanced",
      students: "15.2k"
    },
    {
      title: "Data Scientist",
      description: "Master data analysis, machine learning, and statistics",
      duration: "8-10 months",
      skills: ["Python", "Statistics", "Machine Learning", "SQL", "Visualization"],
      level: "Intermediate to Advanced",
      students: "12.8k"
    },
    {
      title: "Cloud Solutions Architect",
      description: "Design and implement scalable cloud solutions",
      duration: "4-6 months",
      skills: ["AWS/Azure", "DevOps", "Microservices", "Security", "Monitoring"],
      level: "Advanced",
      students: "8.9k"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Explore{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Skills & Knowledge
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover new skills, trending technologies, and certification paths to advance your career
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8 shadow-card">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search skills, technologies, or certifications..."
                className="pl-10 h-12 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Popular Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Card key={index} className="p-4 text-center hover:shadow-elevated transition-all duration-300 cursor-pointer">
                    <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count} resources</p>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="skills">Trending Skills</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingSkills.map((skill, index) => (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{skill.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {skill.category}
                        </Badge>
                      </div>
                      {skill.trending && (
                        <Badge className="bg-red-500 text-white">
                          🔥 Trending
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{skill.learners} learners</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{skill.rating}</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <Badge className={getDifficultyColor(skill.difficulty)}>
                          {skill.difficulty}
                        </Badge>
                        <Button size="sm">Start Learning</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {examCertifications.map((cert, index) => (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{cert.name}</h3>
                        <p className="text-muted-foreground text-sm">{cert.provider}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Difficulty</p>
                          <Badge className={getDifficultyColor(cert.difficulty)}>
                            {cert.difficulty}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Passing Score</p>
                          <p className="font-semibold">{cert.passingScore}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Avg Salary</p>
                          <p className="font-semibold text-success">{cert.avgSalary}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Next Exam</p>
                          <p className="font-semibold">{cert.nextExam}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button className="flex-1">View Details</Button>
                        <Button variant="outline" className="flex-1">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Study Path
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="paths" className="space-y-6">
            <div className="space-y-6">
              {learningPaths.map((path, index) => (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <h3 className="font-semibold text-xl mb-2">{path.title}</h3>
                          <p className="text-muted-foreground">{path.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {path.skills.map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{path.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{path.students} students</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-muted-foreground text-sm mb-1">Level</p>
                          <Badge className={getDifficultyColor(path.level.split(' ')[0])}>
                            {path.level}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <Button className="w-full">Start Path</Button>
                          <Button variant="outline" className="w-full">View Curriculum</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Explore;