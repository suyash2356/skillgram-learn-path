import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Video, 
  ExternalLink, 
  Star, 
  Users, 
  Clock,
  Map,
  Youtube,
  Globe,
  FileText,
  MessageSquare,
  GraduationCap
} from "lucide-react";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [loading, setLoading] = useState(false);

  // Mock data based on search query
  const getSearchData = (searchTerm: string) => {
    const lowerQuery = searchTerm.toLowerCase();
    
    // Topic description
    const topicDescription = {
      title: `${searchTerm} - Complete Learning Guide`,
      description: `Master ${searchTerm} with comprehensive resources, expert-curated content, and AI-powered roadmaps. From beginner fundamentals to advanced concepts, discover the best learning path for your goals.`,
      category: lowerQuery.includes('programming') ? 'Programming' : 
                lowerQuery.includes('design') ? 'Design' : 
                lowerQuery.includes('data') ? 'Data Science' : 
                lowerQuery.includes('ai') || lowerQuery.includes('ml') ? 'AI/ML' : 'Technology',
      difficulty: 'Beginner to Advanced',
      estimatedTime: '3-6 months',
      popularity: Math.floor(Math.random() * 50000) + 10000
    };

    // Recommendations
    const recommendations = [
      {
        type: 'youtube',
        title: `${searchTerm} Complete Tutorial 2024`,
        description: 'Comprehensive video series covering all aspects',
        author: 'Tech Academy',
        duration: '8 hours',
        rating: 4.8,
        views: '250K',
        url: '#'
      },
      {
        type: 'course',
        title: `Professional ${searchTerm} Certification`,
        description: 'Industry-recognized certification program',
        provider: 'Coursera',
        price: '$49',
        duration: '6 weeks',
        rating: 4.9,
        students: '15K',
        url: '#'
      },
      {
        type: 'book',
        title: `${searchTerm}: The Complete Reference`,
        description: 'Authoritative guide from industry experts',
        author: 'John Smith',
        pages: '450',
        rating: 4.7,
        reviews: '1.2K',
        url: '#'
      },
      {
        type: 'website',
        title: `${searchTerm} Official Documentation`,
        description: 'Official documentation and guides',
        domain: 'official-docs.com',
        lastUpdated: '2024',
        rating: 4.6,
        url: '#'
      },
      {
        type: 'reddit',
        title: `r/${searchTerm.replace(' ', '')}`,
        description: 'Active community discussions and Q&A',
        members: '85K',
        posts: 'Daily',
        activity: 'High',
        url: '#'
      },
      {
        type: 'discord',
        title: `${searchTerm} Community Discord`,
        description: 'Real-time chat and collaboration',
        members: '12K',
        activity: 'Very Active',
        channels: '25+',
        url: '#'
      }
    ];

    return { topicDescription, recommendations };
  };

  const { topicDescription, recommendations } = getSearchData(query);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube': return Youtube;
      case 'course': return GraduationCap;
      case 'book': return BookOpen;
      case 'website': return Globe;
      case 'reddit': return MessageSquare;
      case 'discord': return MessageSquare;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'youtube': return 'bg-red-500';
      case 'course': return 'bg-blue-500';
      case 'book': return 'bg-green-500';
      case 'website': return 'bg-purple-500';
      case 'reddit': return 'bg-orange-500';
      case 'discord': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [query]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Search Results Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Search results for "{query}"
          </h1>
          <p className="text-muted-foreground">
            Found {recommendations.length} resources and learning materials
          </p>
        </div>

        {/* Topic Overview */}
        <Card className="mb-8 shadow-card">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <h2 className="text-2xl font-bold">{topicDescription.title}</h2>
                    <Badge variant="secondary">{topicDescription.category}</Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {topicDescription.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{topicDescription.estimatedTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{topicDescription.popularity.toLocaleString()} learners</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>{topicDescription.difficulty}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link to={`/create-roadmap?topic=${encodeURIComponent(query)}`}>
                        <Map className="h-4 w-4 mr-2" />
                        Create AI Roadmap
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="youtube">Videos</TabsTrigger>
            <TabsTrigger value="course">Courses</TabsTrigger>
            <TabsTrigger value="book">Books</TabsTrigger>
            <TabsTrigger value="website">Docs</TabsTrigger>
            <TabsTrigger value="reddit">Reddit</TabsTrigger>
            <TabsTrigger value="discord">Discord</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((item, index) => {
                const Icon = getTypeIcon(item.type);
                return (
                  <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className={`w-10 h-10 ${getTypeColor(item.type)} rounded-lg flex items-center justify-center`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.type}
                          </Badge>
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg mb-2 leading-tight">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-3">
                            {item.description}
                          </p>
                        </div>

                        <div className="space-y-2 text-sm">
                          {item.author && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Author:</span>
                              <span className="font-medium">{item.author}</span>
                            </div>
                          )}
                          {item.provider && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Provider:</span>
                              <span className="font-medium">{item.provider}</span>
                            </div>
                          )}
                          {item.duration && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Duration:</span>
                              <span className="font-medium">{item.duration}</span>
                            </div>
                          )}
                          {item.price && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Price:</span>
                              <span className="font-medium text-success">{item.price}</span>
                            </div>
                          )}
                          {item.rating && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Rating:</span>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="font-medium">{item.rating}</span>
                              </div>
                            </div>
                          )}
                          {item.members && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Members:</span>
                              <span className="font-medium">{item.members}</span>
                            </div>
                          )}
                        </div>

                        <Button variant="outline" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Resource
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Individual type tabs */}
          {['youtube', 'course', 'book', 'website', 'reddit', 'discord'].map((type) => (
            <TabsContent key={type} value={type} className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations
                  .filter((item) => item.type === type)
                  .map((item, index) => {
                    const Icon = getTypeIcon(item.type);
                    return (
                      <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className={`w-10 h-10 ${getTypeColor(item.type)} rounded-lg flex items-center justify-center`}>
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <Badge variant="outline" className="text-xs capitalize">
                                {item.type}
                              </Badge>
                            </div>

                            <div>
                              <h3 className="font-semibold text-lg mb-2 leading-tight">
                                {item.title}
                              </h3>
                              <p className="text-muted-foreground text-sm mb-3">
                                {item.description}
                              </p>
                            </div>

                            <Button variant="outline" className="w-full">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Resource
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default SearchResults;