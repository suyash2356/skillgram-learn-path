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
  Upload
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "react-router-dom";
import { useUserFollows } from "@/hooks/useUserFollows";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user: currentUser } = useAuth(); // Renamed to currentUser to avoid conflict
  const { userId } = useParams<{ userId: string }>(); // Get user ID from URL params
  const targetUserId = userId || currentUser?.id; // If userId in URL, view that profile, else current user's

  const storageKey = `profile:${targetUserId || 'guest'}`;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { isFollowing, toggleFollow, followerCount, followingCount, isLoadingFollowStatus } = useUserFollows(targetUserId);

  const emptyProfile = {
    name: "",
    title: "",
    location: "",
    joinDate: "",
    avatar: "",
    bio: "",
    // stats.followers and stats.following will be fetched from useUserFollows hook
    stats: {
      skillsLearning: 0,
      roadmapsCompleted: 0,
      followers: 0,
      following: 0
    },
    skills: [] as { name: string; level: number; category: string }[],
    achievements: [] as { name: string; description: string; icon: string; date: string }[],
    learningPath: [] as { skill: string; progress: number; totalLessons: number }[],
    recentActivity: [] as { type: string; content: string; time: string }[],
    portfolioUrl: "",
    socialLinks: [] as { platform: string; url: string; icon: string }[], // New: Social links
  };

  const [profile, setProfile] = useState(emptyProfile);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user's roadmaps
  const { data: userRoadmaps, isLoading: isLoadingRoadmaps, error: roadmapsError } = useQuery({
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        // Merge saved data with fetched follower/following counts
        setProfile(prev => ({ ...emptyProfile, ...JSON.parse(saved), stats: { ...prev.stats, followers: followerCount, following: followingCount } }));
      } else {
        setProfile(prev => ({ ...emptyProfile, stats: { ...prev.stats, followers: followerCount, following: followingCount } }));
      }
    } catch {
      setProfile(prev => ({ ...emptyProfile, stats: { ...prev.stats, followers: followerCount, following: followingCount } }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId, followerCount, followingCount]); // Added followerCount and followingCount to dependencies

  useEffect(() => {
    try {
      // Only save non-dynamic stats to local storage
      const { followers, following, ...restStats } = profile.stats;
      localStorage.setItem(storageKey, JSON.stringify({ ...profile, stats: restStats }));
    } catch (error) {
      console.warn('Failed to load profile data:', error);
    }
  }, [profile, storageKey]);

  const initials = (profile.name || 'User').split(' ').map(n => n[0]).join('');

  const handleProfileField = (key: string, value: any) => setProfile(prev => ({ ...prev, [key]: value }));
  const handleStat = (key: keyof typeof emptyProfile.stats, value: number) => setProfile(prev => ({ ...prev, stats: { ...prev.stats, [key]: value } }));

  const addSkill = () => setProfile(prev => ({ ...prev, skills: [ ...(prev.skills || []), { name: '', level: 0, category: '' } ] }));
  const removeSkill = (idx: number) => setProfile(prev => ({ ...prev, skills: (prev.skills || []).filter((_, i) => i !== idx) }));

  const addAchievement = () => setProfile(prev => ({ ...prev, achievements: [ ...(prev.achievements || []), { name: '', description: '', icon: '🏆', date: '' } ] }));
  const removeAchievement = (idx: number) => setProfile(prev => ({ ...prev, achievements: (prev.achievements || []).filter((_, i) => i !== idx) }));

  const addLearningPath = () => setProfile(prev => ({ ...prev, learningPath: [ ...(prev.learningPath || []), { skill: '', progress: 0, totalLessons: 0 } ] }));
  const removeLearningPath = (idx: number) => setProfile(prev => ({ ...prev, learningPath: (prev.learningPath || []).filter((_, i) => i !== idx) }));

  const addActivity = () => setProfile(prev => ({ ...prev, recentActivity: [ ...(prev.recentActivity || []), { type: 'completed', content: '', time: '' } ] }));
  const removeActivity = (idx: number) => setProfile(prev => ({ ...prev, recentActivity: (prev.recentActivity || []).filter((_, i) => i !== idx) }));

  const addSocialLink = () => setProfile(prev => ({ ...prev, socialLinks: [ ...(prev.socialLinks || []), { platform: '', url: '', icon: '' } ] }));
  const removeSocialLink = (idx: number) => setProfile(prev => ({ ...prev, socialLinks: (prev.socialLinks || []).filter((_, i) => i !== idx) }));

  const startEdit = () => setEditMode(true);
  const cancelEdit = () => setEditMode(false);
  const saveEdit = () => setEditMode(false);

  const onPickAvatar = () => fileInputRef.current?.click();
  const onAvatarSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      handleProfileField('avatar', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-6 shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {editMode && (
                  <Button size="sm" variant="outline" className="absolute -bottom-2 left-1/2 -translate-x-1/2" onClick={onPickAvatar}>
                    <Upload className="h-4 w-4 mr-1" /> Upload
                  </Button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarSelected} />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  {editMode ? (
                    <div className="space-y-2">
                      <Input placeholder="Your Name" value={profile.name} onChange={(e) => handleProfileField('name', e.target.value)} />
                      <Input placeholder="Title" value={profile.title} onChange={(e) => handleProfileField('title', e.target.value)} />
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <Input placeholder="Location" value={profile.location} onChange={(e) => handleProfileField('location', e.target.value)} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <Input placeholder="Joined (e.g., January 2025)" value={profile.joinDate} onChange={(e) => handleProfileField('joinDate', e.target.value)} />
                      </div>
                      <Input placeholder="Avatar URL" value={profile.avatar} onChange={(e) => handleProfileField('avatar', e.target.value)} />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold">{profile.name || 'Your Name'}</h1>
                      <p className="text-lg text-muted-foreground">{profile.title || 'Your Title'}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.location || 'Your Location'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Joined {profile.joinDate || '—'}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {editMode ? (
                  <Textarea placeholder="Short bio..." value={profile.bio} onChange={(e) => handleProfileField('bio', e.target.value)} rows={3} />
                ) : (
                  <p className="text-foreground max-w-2xl">{profile.bio || 'Tell the world about yourself...'}</p>
                )}

                <div className="flex flex-wrap items-center gap-4">
                  <div className="grid grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{profile.stats.skillsLearning}</div>
                      <div className="text-xs text-muted-foreground">Skills Learning</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{profile.stats.roadmapsCompleted}</div>
                      <div className="text-xs text-muted-foreground">Roadmaps Done</div>
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
                      {(profile.socialLinks || []).map((link, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input placeholder="Platform (e.g., LinkedIn)" value={link.platform} onChange={(e) => setProfile(prev => ({ ...prev, socialLinks: prev.socialLinks.map((l, i) => i === index ? { ...l, platform: e.target.value } : l) }))} />
                          <Input placeholder="URL" value={link.url} onChange={(e) => setProfile(prev => ({ ...prev, socialLinks: prev.socialLinks.map((l, i) => i === index ? { ...l, url: e.target.value } : l) }))} />
                          <Button variant="ghost" size="sm" onClick={() => removeSocialLink(index)}><X className="h-4 w-4" /></Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addSocialLink}><Plus className="h-4 w-4 mr-1" /> Add Social Link</Button>
                    </div>
                  ) : (
                    (profile.socialLinks || []).length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {(profile.socialLinks || []).map((link, index) => (
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
                {currentUser?.id !== targetUserId && ( // Only show follow/unfollow if not viewing own profile
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
                    <Button className="w-full" onClick={saveEdit}>Save</Button>
                    <Button variant="outline" className="w-full" onClick={cancelEdit}>Cancel</Button>
                  </>
                ) : (
                  <>
                    {currentUser?.id === targetUserId && (
                      <Button className="w-full" onClick={startEdit}>Edit Profile</Button>
                    )}
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {profile.portfolioUrl ? (
                        <a href={profile.portfolioUrl} target="_blank" rel="noreferrer">Portfolio</a>
                      ) : 'Portfolio'}
                    </Button>
                    {editMode && currentUser?.id === targetUserId && (
                      <Input placeholder="Portfolio URL" value={profile.portfolioUrl} onChange={(e) => handleProfileField('portfolioUrl', e.target.value)} />
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                  {(profile.learningPath || []).length === 0 && (
                    <div className="text-sm text-muted-foreground">No current learning yet.</div>
                  )}
                  {profile.learningPath.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        {editMode ? (
                          <Input placeholder="Skill/Subject" value={item.skill} onChange={(e) => setProfile(prev => ({ ...prev, learningPath: prev.learningPath.map((lp, i) => i === index ? { ...lp, skill: e.target.value } : lp) }))} />
                        ) : (
                          <h4 className="font-medium text-sm">{item.skill}</h4>
                        )}
                        <span className="text-sm text-muted-foreground">{item.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {editMode ? (
                          <>
                            <Input type="number" placeholder="Progress %" value={item.progress} onChange={(e) => setProfile(prev => ({ ...prev, learningPath: prev.learningPath.map((lp, i) => i === index ? { ...lp, progress: Number(e.target.value) } : lp) }))} />
                            <Input type="number" placeholder="Total lessons" value={item.totalLessons} onChange={(e) => setProfile(prev => ({ ...prev, learningPath: prev.learningPath.map((lp, i) => i === index ? { ...lp, totalLessons: Number(e.target.value) } : lp) }))} />
                            <Button variant="ghost" size="sm" onClick={() => removeLearningPath(index)}><X className="h-4 w-4" /></Button>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {Math.round((item.progress / 100) * item.totalLessons)} of {item.totalLessons} lessons
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {editMode && (
                    <Button variant="outline" size="sm" onClick={addLearningPath} className="mt-2"><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
                  )}
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
                  {(profile.recentActivity || []).length === 0 && (
                    <div className="text-sm text-muted-foreground">No activity yet.</div>
                  )}
                  {profile.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'completed' ? 'bg-success' :
                        activity.type === 'shared' ? 'bg-primary' :
                        activity.type === 'joined' ? 'bg-accent' :
                        'bg-yellow-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        {editMode ? (
                          <Input value={activity.content} onChange={(e) => setProfile(prev => ({ ...prev, recentActivity: prev.recentActivity.map((a, i) => i === index ? { ...a, content: e.target.value } : a) }))} />
                        ) : (
                          <p className="text-sm">{activity.content}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      {editMode && (
                        <Button variant="ghost" size="sm" onClick={() => removeActivity(index)}><X className="h-4 w-4" /></Button>
                      )}
                    </div>
                  ))}
                  {editMode && (
                    <Button variant="outline" size="sm" onClick={addActivity} className="mt-2"><Plus className="h-4 w-4 mr-1" /> Add Activity</Button>
                  )}
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
                ) : roadmapsError ? (
                  <div className="text-sm text-destructive">Error loading roadmaps: {roadmapsError.message}</div>
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
                  {(profile.skills || []).length === 0 && (
                    <div className="text-sm text-muted-foreground">No skills yet.</div>
                  )}
                  {profile.skills.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          {editMode ? (
                            <>
                              <Input placeholder="Skill name" value={skill.name} onChange={(e) => setProfile(prev => ({ ...prev, skills: prev.skills.map((s, i) => i === index ? { ...s, name: e.target.value } : s) }))} />
                              <Input placeholder="Category" value={skill.category} onChange={(e) => setProfile(prev => ({ ...prev, skills: prev.skills.map((s, i) => i === index ? { ...s, category: e.target.value } : s) }))} />
                            </>
                          ) : (
                            <>
                              <h3 className="font-medium">{skill.name}</h3>
                              <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                            </>
                          )}
                        </div>
                        {editMode ? (
                          <div className="flex items-center gap-2">
                            <Input type="number" placeholder="%" value={skill.level} onChange={(e) => setProfile(prev => ({ ...prev, skills: prev.skills.map((s, i) => i === index ? { ...s, level: Number(e.target.value) } : s) }))} className="w-20" />
                            <Button variant="ghost" size="sm" onClick={() => removeSkill(index)}><X className="h-4 w-4" /></Button>
                          </div>
                        ) : (
                          <span className="text-sm font-medium">{skill.level}%</span>
                        )}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {editMode && (
                    <Button variant="outline" size="sm" onClick={addSkill}><Plus className="h-4 w-4 mr-1" /> Add Skill</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {(profile.achievements || []).length === 0 && (
                <Card className="shadow-card">
                  <CardContent className="p-6 text-sm text-muted-foreground">No achievements yet.</CardContent>
                </Card>
              )}
              {profile.achievements.map((achievement, index) => (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{achievement.icon || '🏆'}</div>
                      <div className="flex-1">
                        {editMode ? (
                          <div className="space-y-2">
                            <Input placeholder="Name" value={achievement.name} onChange={(e) => setProfile(prev => ({ ...prev, achievements: prev.achievements.map((a, i) => i === index ? { ...a, name: e.target.value } : a) }))} />
                            <Input placeholder="Description" value={achievement.description} onChange={(e) => setProfile(prev => ({ ...prev, achievements: prev.achievements.map((a, i) => i === index ? { ...a, description: e.target.value } : a) }))} />
                            <div className="flex items-center gap-2">
                              <Input placeholder="Icon (emoji)" value={achievement.icon} onChange={(e) => setProfile(prev => ({ ...prev, achievements: prev.achievements.map((a, i) => i === index ? { ...a, icon: e.target.value } : a) }))} className="w-32" />
                              <Input placeholder="Date" value={achievement.date} onChange={(e) => setProfile(prev => ({ ...prev, achievements: prev.achievements.map((a, i) => i === index ? { ...a, date: e.target.value } : a) }))} />
                              <Button variant="ghost" size="sm" onClick={() => removeAchievement(index)}><X className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-semibold text-lg">{achievement.name}</h3>
                            <p className="text-muted-foreground text-sm mb-2">{achievement.description}</p>
                            <p className="text-xs text-muted-foreground">{achievement.date}</p>
                          </>
                        )}
                      </div>
                      <Award className="h-5 w-5 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {editMode && (
                <Button variant="outline" size="sm" onClick={addAchievement}><Plus className="h-4 w-4 mr-1" /> Add Achievement</Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Learning Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(profile.recentActivity || []).length === 0 && (
                    <div className="text-sm text-muted-foreground">No activity yet.</div>
                  )}
                  {profile.recentActivity.map((activity, index) => (
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
                        {editMode ? (
                          <Input value={activity.content} onChange={(e) => setProfile(prev => ({ ...prev, recentActivity: prev.recentActivity.map((a, i) => i === index ? { ...a, content: e.target.value } : a) }))} />
                        ) : (
                          <p className="font-medium">{activity.content}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                      {editMode && (
                        <Button variant="ghost" size="sm" onClick={() => removeActivity(index)}><X className="h-4 w-4" /></Button>
                      )}
                    </div>
                  ))}
                  {editMode && (
                    <Button variant="outline" size="sm" onClick={addActivity}><Plus className="h-4 w-4 mr-1" /> Add Activity</Button>
                  )}
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