import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Calendar,
  ExternalLink,
  Award,
  BookOpen,
  TrendingUp,
  Users,
  Star,
  Target,
  X,
  Plus,
  Upload,
  Edit,
  Save
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "react-router-dom";
import { useUserFollows } from "@/hooks/useUserFollows";
import { useUserProfileDetails, SocialLink, Skill, Achievement, LearningPathItem } from "@/hooks/useUserProfileDetails";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user: currentUser } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const targetUserId = userId || currentUser?.id;
  const { toast } = useToast();

  const { isFollowing, toggleFollow, followerCount, followingCount, isLoadingFollowStatus } = useUserFollows(targetUserId);
  const { profileDetails, isLoading: isLoadingProfile, updateProfileDetails, isUpdating } = useUserProfileDetails(targetUserId);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // This query fetches the public user data (name, avatar) which is separate from profile details
  const { data: publicUserData, isLoading: isLoadingPublicUser } = useQuery({
    queryKey: ['publicProfile', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', targetUserId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!targetUserId,
  });

  useEffect(() => {
    if (profileDetails && publicUserData) {
      setFormData({
        name: publicUserData.full_name || '',
        title: profileDetails.job_title || '',
        location: profileDetails.location || '',
        joinDate: profileDetails.join_date || '',
        avatar: publicUserData.avatar_url || '',
        bio: profileDetails.bio || '',
        portfolioUrl: profileDetails.portfolio_url || '',
        socialLinks: profileDetails.social_links || [],
        skills: profileDetails.skills || [],
        achievements: profileDetails.achievements || [],
        learningPath: profileDetails.learning_path || [],
      });
    }
  }, [profileDetails, publicUserData]);

  // Fetch user's roadmaps
  const { data: userRoadmaps, isLoading: isLoadingRoadmaps } = useQuery({
    queryKey: ['userRoadmaps', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const { data, error } = await supabase
        .from('roadmaps')
        .select('id, title, description, progress, status, created_at')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId,
  });

  const handleSave = async () => {
    if (!targetUserId) return;
    try {
      // Update profile details (data in user_profile_details table)
      await updateProfileDetails({
        user_id: targetUserId,
        job_title: formData.title,
        location: formData.location,
        join_date: formData.joinDate,
        bio: formData.bio,
        portfolio_url: formData.portfolioUrl,
        social_links: formData.socialLinks,
        skills: formData.skills,
        achievements: formData.achievements,
        learning_path: formData.learningPath,
      });

      // Update public user data (data in profiles table)
      const { error: userUpdateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.name,
          avatar_url: formData.avatar,
        })
        .eq('user_id', targetUserId);

      if (userUpdateError) throw userUpdateError;

      toast({ title: "Profile updated successfully!" });
      setEditMode(false);
    } catch (error: any) {
      toast({ title: "Failed to update profile", description: error.message, variant: "destructive" });
    }
  };

  const initials = (publicUserData?.full_name || 'U').split(' ').map(n => n[0]).join('');

  if (isLoadingProfile || isLoadingPublicUser) {
    return <Layout><div>Loading profile...</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-6 shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.avatar} />
                  <AvatarFallback className="text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {editMode && (
                  <Button size="sm" variant="outline" className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <Upload className="h-4 w-4 mr-1" /> Upload
                  </Button>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  {editMode ? (
                    <div className="space-y-2">
                      <Input placeholder="Your Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                      <Input placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <Input placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <Input placeholder="Joined (e.g., January 2025)" value={formData.joinDate} onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold">{publicUserData?.full_name || 'Your Name'}</h1>
                      <p className="text-lg text-muted-foreground">{profileDetails?.job_title || 'Your Title'}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{profileDetails?.location || 'Your Location'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Joined {profileDetails?.join_date || '—'}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {editMode ? (
                  <Textarea placeholder="Short bio..." value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3} />
                ) : (
                  <p className="text-foreground max-w-2xl">{profileDetails?.bio || 'Tell the world about yourself...'}</p>
                )}

                <div className="flex flex-wrap items-center gap-4">
                  <div className="grid grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{profileDetails?.total_posts || 0}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{profileDetails?.total_roadmaps || 0}</div>
                      <div className="text-xs text-muted-foreground">Roadmaps</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{followerCount}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{followingCount}</div>
                      <div className="text-xs text-muted-foreground">Following</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-4">
                  {editMode ? (
                    <div className="space-y-2 w-full">
                      <Label>Social Links</Label>
                      {(formData.socialLinks || []).map((link: SocialLink, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input placeholder="Platform (e.g., LinkedIn)" value={link.platform} onChange={(e) => {
                            const newLinks = [...formData.socialLinks];
                            newLinks[index].platform = e.target.value;
                            setFormData({ ...formData, socialLinks: newLinks });
                          }} />
                          <Input placeholder="URL" value={link.url} onChange={(e) => {
                            const newLinks = [...formData.socialLinks];
                            newLinks[index].url = e.target.value;
                            setFormData({ ...formData, socialLinks: newLinks });
                          }} />
                          <Button variant="ghost" size="sm" onClick={() => setFormData({ ...formData, socialLinks: formData.socialLinks.filter((_: any, i: number) => i !== index) })}><X className="h-4 w-4" /></Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setFormData({ ...formData, socialLinks: [...(formData.socialLinks || []), { platform: '', url: '' }] })}><Plus className="h-4 w-4 mr-1" /> Add Social Link</Button>
                    </div>
                  ) : (
                    (profileDetails?.social_links || []).length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {(profileDetails?.social_links || []).map((link: SocialLink, index: number) => (
                          <a key={index} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline">
                            <ExternalLink className="h-4 w-4" />
                            <span>{link.platform}</span>
                          </a>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                {currentUser?.id !== targetUserId && (
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    onClick={toggleFollow}
                    disabled={isLoadingFollowStatus || !currentUser}
                    className="w-full"
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
                {editMode ? (
                  <>
                    <Button className="w-full" onClick={handleSave} disabled={isUpdating}>
                      {isUpdating ? 'Saving...' : <><Save className="h-4 w-4 mr-2" />Save</>}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setEditMode(false)}>Cancel</Button>
                  </>
                ) : (
                  <>
                    {currentUser?.id === targetUserId && (
                      <Button className="w-full" onClick={() => setEditMode(true)}><Edit className="h-4 w-4 mr-2" />Edit Profile</Button>
                    )}
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {profileDetails?.portfolio_url ? (
                        <a href={profileDetails.portfolio_url} target="_blank" rel="noreferrer">Portfolio</a>
                      ) : 'Portfolio'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roadmaps">Roadmaps</TabsTrigger>
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
                  {(profileDetails?.learning_path || []).length === 0 && (
                    <div className="text-sm text-muted-foreground">No current learning yet.</div>
                  )}
                  {(profileDetails?.learning_path || []).map((item: LearningPathItem, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center gap-2">
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
                        {item.currentLesson} of {item.totalLessons} lessons
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
                  <div className="text-sm text-muted-foreground">Activity tracking coming soon.</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="roadmaps" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>My Roadmaps</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingRoadmaps ? (
                  <div className="text-sm text-muted-foreground">Loading roadmaps...</div>
                ) : (userRoadmaps || []).length === 0 ? (
                  <div className="text-sm text-muted-foreground">No roadmaps created yet.</div>
                ) : (
                  <div className="grid gap-4">
                    {(userRoadmaps || []).map((roadmap: any) => (
                      <Link to={`/roadmaps/${roadmap.id}`} key={roadmap.id} className="block">
                        <Card className="hover:border-primary transition-colors duration-200">
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-lg mb-1">{roadmap.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{roadmap.description}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Progress: {roadmap.progress}%</span>
                              <Badge variant="secondary">{roadmap.status}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Skill Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {(profileDetails?.skills || []).length === 0 && (
                    <div className="text-sm text-muted-foreground">No skills yet.</div>
                  )}
                  {(profileDetails?.skills || []).map((skill: Skill, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium">{skill.name}</h3>
                          <Badge variant="outline" className="text-xs">{skill.category}</Badge>
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
              {(profileDetails?.achievements || []).length === 0 && (
                <Card className="shadow-card">
                  <CardContent className="p-6 text-sm text-muted-foreground">No achievements yet.</CardContent>
                </Card>
              )}
              {(profileDetails?.achievements || []).map((achievement: Achievement, index: number) => (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{achievement.icon || '🏆'}</div>
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
                <div className="text-sm text-muted-foreground">Activity tracking coming soon.</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;