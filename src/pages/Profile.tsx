import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Award, 
  BookOpen, 
  TrendingUp,
  Users,
  Star,
  Target
} from "lucide-react";

const Profile = () => {
  const userProfile = {
    name: "Alex Johnson",
    title: "Full Stack Developer & AI Enthusiast",
    location: "San Francisco, CA",
    joinDate: "January 2023",
    avatar: "/placeholder.svg",
    bio: "Passionate about building scalable applications and exploring the intersection of AI and web development. Always learning, always growing.",
    stats: {
      skillsLearning: 12,
      roadmapsCompleted: 8,
      followers: 1234,
      following: 567
    },
    skills: [
      { name: "JavaScript", level: 90, category: "Programming" },
      { name: "React", level: 85, category: "Frontend" },
      { name: "Node.js", level: 80, category: "Backend" },
      { name: "Python", level: 75, category: "Programming" },
      { name: "Machine Learning", level: 60, category: "AI/ML" },
      { name: "DevOps", level: 65, category: "Infrastructure" }
    ],
    achievements: [
      { name: "JavaScript Master", description: "Completed advanced JS roadmap", icon: "🏆", date: "March 2024" },
      { name: "React Ninja", description: "Built 5 React applications", icon: "⚛️", date: "February 2024" },
      { name: "AI Pioneer", description: "Completed ML fundamentals", icon: "🤖", date: "January 2024" },
      { name: "Community Helper", description: "Helped 50+ learners", icon: "🤝", date: "December 2023" }
    ],
    learningPath: [
      { skill: "Advanced React Patterns", progress: 75, totalLessons: 24 },
      { skill: "Machine Learning with Python", progress: 45, totalLessons: 32 },
      { skill: "System Design", progress: 30, totalLessons: 18 }
    ],
    recentActivity: [
      { type: "completed", content: "Finished 'Advanced Hooks in React'", time: "2 hours ago" },
      { type: "shared", content: "Shared 'Top 10 DevOps Tools' article", time: "5 hours ago" },
      { type: "joined", content: "Joined 'AI/ML Study Group'", time: "1 day ago" },
      { type: "achievement", content: "Earned 'React Ninja' badge", time: "2 days ago" }
    ]
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-6 shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback className="text-2xl">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                  <p className="text-lg text-muted-foreground">{userProfile.title}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{userProfile.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {userProfile.joinDate}</span>
                    </div>
                  </div>
                </div>

                <p className="text-foreground max-w-2xl">{userProfile.bio}</p>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="grid grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{userProfile.stats.skillsLearning}</div>
                      <div className="text-xs text-muted-foreground">Skills Learning</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{userProfile.stats.roadmapsCompleted}</div>
                      <div className="text-xs text-muted-foreground">Roadmaps Done</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{userProfile.stats.followers}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{userProfile.stats.following}</div>
                      <div className="text-xs text-muted-foreground">Following</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Button className="w-full">Edit Profile</Button>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Portfolio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Current Learning */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Current Learning</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userProfile.learningPath.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm">{item.skill}</h4>
                        <span className="text-sm text-muted-foreground">{item.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((item.progress / 100) * item.totalLessons)} of {item.totalLessons} lessons
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userProfile.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'completed' ? 'bg-success' :
                        activity.type === 'shared' ? 'bg-primary' :
                        activity.type === 'joined' ? 'bg-accent' :
                        'bg-yellow-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.content}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Skill Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {userProfile.skills.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium">{skill.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {skill.category}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {userProfile.achievements.map((achievement, index) => (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{achievement.name}</h3>
                        <p className="text-muted-foreground text-sm mb-2">{achievement.description}</p>
                        <p className="text-xs text-muted-foreground">{achievement.date}</p>
                      </div>
                      <Award className="h-5 w-5 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Learning Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {userProfile.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'completed' ? 'bg-success/10 text-success' :
                        activity.type === 'shared' ? 'bg-primary/10 text-primary' :
                        activity.type === 'joined' ? 'bg-accent/10 text-accent' :
                        'bg-yellow-500/10 text-yellow-600'
                      }`}>
                        {activity.type === 'completed' && <Target className="h-5 w-5" />}
                        {activity.type === 'shared' && <ExternalLink className="h-5 w-5" />}
                        {activity.type === 'joined' && <Users className="h-5 w-5" />}
                        {activity.type === 'achievement' && <Award className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.content}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;