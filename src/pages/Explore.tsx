import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
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
  BookOpen,
  ExternalLink,
  Bookmark,
  Play
} from "lucide-react";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

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
      name: "CS50's Introduction to Computer Science",
      category: "Computer Science",
      learners: "4.2M",
      difficulty: "Beginner",
      rating: 4.9,
      trending: true,
      description: "Harvard's introduction to computer science and programming",
      link: "https://www.edx.org/course/introduction-computer-science-harvardx-cs50x"
    },
    {
      name: "Responsive Web Design",
      category: "Web Development",
      learners: "2.8M",
      difficulty: "Beginner",
      rating: 4.8,
      trending: true,
      description: "Learn HTML, CSS, and responsive design principles with freeCodeCamp",
      link: "https://www.freecodecamp.org/learn/responsive-web-design/"
    },
    {
      name: "JavaScript Algorithms and Data Structures",
      category: "Programming",
      learners: "1.9M",
      difficulty: "Intermediate",
      rating: 4.9,
      trending: true,
      description: "ES6, regular expressions, basic algorithm scripting",
      link: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"
    },
    {
      name: "Google Data Analytics Professional Certificate",
      category: "Data Science",
      learners: "1.2M",
      difficulty: "Beginner",
      rating: 4.7,
      trending: true,
      description: "Job-ready skills in data analytics, Tableau, R, and SQL",
      link: "https://www.coursera.org/professional-certificates/google-data-analytics"
    },
    {
      name: "Python for Everybody",
      category: "Programming",
      learners: "2.1M",
      difficulty: "Beginner",
      rating: 4.8,
      trending: false,
      description: "Learn Python programming fundamentals from University of Michigan",
      link: "https://www.coursera.org/specializations/python"
    },
    {
      name: "Google UX Design Professional Certificate",
      category: "Design",
      learners: "850k",
      difficulty: "Beginner",
      rating: 4.8,
      trending: true,
      description: "User experience design and research fundamentals",
      link: "https://www.coursera.org/professional-certificates/google-ux-design"
    },
    {
      name: "AWS Cloud Practitioner Essentials",
      category: "Cloud Computing",
      learners: "650k",
      difficulty: "Beginner",
      rating: 4.7,
      trending: false,
      description: "Introduction to AWS cloud computing concepts",
      link: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/"
    },
    {
      name: "Machine Learning",
      category: "AI/ML",
      learners: "4.7M",
      difficulty: "Intermediate",
      rating: 4.9,
      trending: true,
      description: "Stanford's famous machine learning course by Andrew Ng",
      link: "https://www.coursera.org/learn/machine-learning"
    },
    {
      name: "Khan Academy Programming",
      category: "Programming",
      learners: "3.2M",
      difficulty: "Beginner",
      rating: 4.5,
      trending: false,
      description: "Intro to programming with JavaScript and web development",
      link: "https://www.khanacademy.org/computing/computer-programming"
    }
  ];

  const examCertifications = [
    {
      name: "AWS Solutions Architect Associate",
      provider: "Amazon Web Services",
      difficulty: "Associate",
      passingScore: "72%",
      avgSalary: "$130k",
      nextExam: "Available Year-round",
      duration: "130 minutes",
      cost: "$150",
      description: "Design distributed systems on AWS platform",
      link: "https://aws.amazon.com/certification/certified-solutions-architect-associate/"
    },
    {
      name: "Google Professional Cloud Architect",
      provider: "Google Cloud",
      difficulty: "Professional",
      passingScore: "70%",
      avgSalary: "$139k",
      nextExam: "Available Year-round",
      duration: "2 hours",
      cost: "$200",
      description: "Design and manage scalable, reliable Google Cloud solutions",
      link: "https://cloud.google.com/certification/cloud-architect"
    },
    {
      name: "Google IT Support Professional Certificate",
      provider: "Google (Coursera)",
      difficulty: "Beginner",
      passingScore: "N/A",
      avgSalary: "$50k",
      nextExam: "Self-paced",
      duration: "3-6 months",
      cost: "Free to audit",
      description: "Technical support fundamentals and troubleshooting",
      link: "https://www.coursera.org/professional-certificates/google-it-support"
    },
    {
      name: "Microsoft Azure Fundamentals",
      provider: "Microsoft",
      difficulty: "Beginner",
      passingScore: "70%",
      avgSalary: "$85k",
      nextExam: "Available Year-round",
      duration: "45 minutes",
      cost: "$99",
      description: "Azure cloud services and solutions fundamentals",
      link: "https://docs.microsoft.com/en-us/learn/certifications/azure-fundamentals/"
    },
    {
      name: "IBM Data Science Professional Certificate",
      provider: "IBM (Coursera)",
      difficulty: "Beginner",
      passingScore: "N/A",
      avgSalary: "$95k",
      nextExam: "Self-paced",
      duration: "3-11 months",
      cost: "Free to audit",
      description: "Python, SQL, machine learning, and data visualization",
      link: "https://www.coursera.org/professional-certificates/ibm-data-science"
    },
    {
      name: "Google Digital Marketing & E-commerce",
      provider: "Google (Coursera)",
      difficulty: "Beginner",
      passingScore: "N/A",
      avgSalary: "$55k",
      nextExam: "Self-paced",
      duration: "3-6 months",
      cost: "Free to audit",
      description: "Digital marketing strategy and e-commerce fundamentals",
      link: "https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce"
    }
  ];

  const learningPaths = [
    {
      title: "Full Stack Web Development",
      description: "Complete curriculum from HTML/CSS to full-stack JavaScript",
      duration: "1,800 hours",
      skills: ["HTML/CSS", "JavaScript", "React", "Node.js", "Databases"],
      level: "Beginner to Advanced",
      students: "2.8M",
      rating: 4.8,
      price: "Free",
      projects: 20,
      link: "https://www.freecodecamp.org/learn/"
    },
    {
      title: "Data Scientist Nanodegree",
      description: "Data pipelines, experiments, recommendation systems",
      duration: "4 months",
      skills: ["Python", "Machine Learning", "Statistics", "SQL", "Data Visualization"],
      level: "Intermediate",
      students: "15.2k",
      rating: 4.9,
      price: "$399/month",
      projects: 8,
      link: "https://www.udacity.com/course/data-scientist-nanodegree--nd025"
    },
    {
      title: "Cloud Development Path",
      description: "AWS, Azure, Docker, and Kubernetes fundamentals",
      duration: "40 hours",
      skills: ["AWS", "Azure", "Docker", "Kubernetes", "DevOps"],
      level: "Beginner to Advanced",
      students: "8.9k",
      rating: 4.7,
      price: "$29/month",
      projects: 15,
      link: "https://www.pluralsight.com/paths/cloud-development"
    },
    {
      title: "Machine Learning Engineering for Production",
      description: "MLOps, TensorFlow, and production ML systems",
      duration: "6-12 months",
      skills: ["MLOps", "TensorFlow", "Kubernetes", "Production ML", "Data Engineering"],
      level: "Intermediate",
      students: "12.8k",
      rating: 4.6,
      price: "$49/month",
      projects: 11,
      link: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops"
    },
    {
      title: "Frontend Master Path",
      description: "React, TypeScript, and modern frontend development",
      duration: "6 months",
      skills: ["React", "TypeScript", "CSS", "JavaScript", "Testing"],
      level: "Beginner to Intermediate",
      students: "11.3k",
      rating: 4.8,
      price: "$39.99/month",
      projects: 10,
      link: "https://www.codecademy.com/learn/paths/front-end-engineer-career-path"
    },
    {
      title: "Khan Academy Programming",
      description: "Intro to programming with JavaScript and web development",
      duration: "Self-paced",
      skills: ["JavaScript", "HTML/CSS", "Web Development", "Computer Science"],
      level: "Beginner",
      students: "3.2M",
      rating: 4.5,
      price: "Free",
      projects: 6,
      link: "https://www.khanacademy.org/computing/computer-programming"
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

  // Filter data based on search query
  const filteredSkills = useMemo(() => {
    if (!searchQuery) return trendingSkills;
    return trendingSkills.filter(skill => 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredCertifications = useMemo(() => {
    if (!searchQuery) return examCertifications;
    return examCertifications.filter(cert => 
      cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredPaths = useMemo(() => {
    if (!searchQuery) return learningPaths;
    return learningPaths.filter(path => 
      path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const handleCategoryClick = (categoryName: string) => {
    setSearchQuery(categoryName);
    toast({
      title: "Filter Applied",
      description: `Showing results for ${categoryName}`,
    });
  };

  const handleStartLearning = (skillName: string, link?: string) => {
    if (link) {
      window.open(link, '_blank');
      toast({
        title: "Opening Course",
        description: `Opening ${skillName} in new tab...`,
      });
    } else {
      toast({
        title: "Course Started",
        description: `Welcome to ${skillName}! Happy learning!`,
      });
    }
  };

  const handleViewDetails = (itemName: string, link?: string) => {
    if (link) {
      window.open(link, '_blank');
      toast({
        title: "Opening Details",
        description: `Opening ${itemName} details in new tab...`,
      });
    } else {
      toast({
        title: "Details",
        description: `Opening details for ${itemName}`,
      });
    }
  };

  const handleBookmark = (itemName: string) => {
    toast({
      title: "Bookmarked",
      description: `${itemName} added to your saved items`,
    });
  };

  const handleStartPath = (pathTitle: string, link?: string) => {
    if (link) {
      window.open(link, '_blank');
      toast({
        title: "Opening Learning Path",
        description: `Opening ${pathTitle} in new tab...`,
      });
    } else {
      toast({
        title: "Learning Path Started",
        description: `Welcome to ${pathTitle}! Your journey begins now.`,
      });
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
              Trending Content
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover trending skills, popular technologies, and what's hot in the learning community
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
                  <Card 
                    key={index} 
                    className="p-4 text-center hover:shadow-elevated transition-all duration-300 cursor-pointer"
                    onClick={() => handleCategoryClick(category.name)}
                  >
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
            <TabsTrigger value="skills">🔥 Trending Skills</TabsTrigger>
            <TabsTrigger value="certifications">🏆 Popular Certifications</TabsTrigger>
            <TabsTrigger value="paths">🚀 Hot Learning Paths</TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="space-y-6">
            {searchQuery && (
              <div className="text-center text-muted-foreground mb-4">
                Showing {filteredSkills.length} results for "{searchQuery}"
                {searchQuery && (
                  <Button 
                    variant="link" 
                    className="ml-2 p-0 h-auto"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkills.map((skill, index) => (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{skill.name}</h3>
                        <Badge variant="outline" className="text-xs mb-2">
                          {skill.category}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                      </div>
                      <div className="flex flex-col space-y-1 ml-2">
                        {skill.trending && (
                          <Badge className="bg-red-500 text-white text-xs">
                            🔥 Trending
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleBookmark(skill.name)}
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
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
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(skill.name, skill.link)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleStartLearning(skill.name, skill.link)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredSkills.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                No skills found matching "{searchQuery}". Try a different search term.
              </div>
            )}
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6">
            {searchQuery && (
              <div className="text-center text-muted-foreground mb-4">
                Showing {filteredCertifications.length} results for "{searchQuery}"
                {searchQuery && (
                  <Button 
                    variant="link" 
                    className="ml-2 p-0 h-auto"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredCertifications.map((cert, index) => (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{cert.name}</h3>
                          <p className="text-muted-foreground text-sm mb-2">{cert.provider}</p>
                          <p className="text-sm text-muted-foreground">{cert.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleBookmark(cert.name)}
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
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
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-semibold">{cert.duration}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cost</p>
                          <p className="font-semibold">{cert.cost}</p>
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
                        <Button 
                          className="flex-1"
                          onClick={() => handleViewDetails(cert.name, cert.link)}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleStartLearning(`${cert.name} preparation`, cert.link)}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Study Path
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredCertifications.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                No certifications found matching "{searchQuery}". Try a different search term.
              </div>
            )}
          </TabsContent>

          <TabsContent value="paths" className="space-y-6">
            {searchQuery && (
              <div className="text-center text-muted-foreground mb-4">
                Showing {filteredPaths.length} results for "{searchQuery}"
                {searchQuery && (
                  <Button 
                    variant="link" 
                    className="ml-2 p-0 h-auto"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
            )}
            <div className="space-y-6">
              {filteredPaths.map((path, index) => (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-xl mb-2">{path.title}</h3>
                            <p className="text-muted-foreground mb-3">{path.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleBookmark(path.title)}
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {path.skills.map((skill, skillIndex) => (
                            <Badge 
                              key={skillIndex} 
                              variant="secondary"
                              className="cursor-pointer hover:bg-secondary/80"
                              onClick={() => setSearchQuery(skill)}
                            >
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
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{path.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{path.projects} projects</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div>
                            <p className="text-muted-foreground text-sm mb-1">Level</p>
                            <Badge className={getDifficultyColor(path.level.split(' ')[0])}>
                              {path.level}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-sm mb-1">Price</p>
                            <p className="font-semibold text-lg">{path.price}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button 
                            className="w-full"
                            onClick={() => handleStartPath(path.title, path.link)}
                          >
                            Start Path
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleViewDetails(path.title, path.link)}
                          >
                            View Curriculum
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredPaths.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                No learning paths found matching "{searchQuery}". Try a different search term.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Explore;