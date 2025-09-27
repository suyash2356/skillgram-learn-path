import { useEffect, useState } from "react";
import { useUserProfileDetails } from "@/hooks/useUserProfileDetails";
import { useDataMigration } from "@/hooks/useDataMigration";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, ExternalLink, Star, Trophy, BookOpen } from "lucide-react";

interface ProfileWithDatabaseProps {
  userId?: string;
}

export const ProfileWithDatabase = ({ userId }: ProfileWithDatabaseProps) => {
  const { toast } = useToast();
  const { profileDetails, isLoading, updateProfileDetails, isUpdating } = useUserProfileDetails(userId);
  const { migrateAllData, isMigrating, checkMigrationStatus } = useDataMigration();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    job_title: '',
    company: '',
    experience_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    portfolio_url: '',
    social_links: [] as Array<{ platform: string; url: string }>,
    skills: [] as Array<{ name: string; category: string; level: number }>,
    achievements: [] as Array<{ name: string; description: string; icon: string; date: string }>,
    learning_path: [] as Array<{ skill: string; progress: number; totalLessons: number; currentLesson: number }>,
  });

  // Initialize form data when profile details load
  useEffect(() => {
    if (profileDetails) {
      setFormData({
        bio: profileDetails.bio || '',
        location: profileDetails.location || '',
        job_title: profileDetails.job_title || '',
        company: profileDetails.company || '',
        experience_level: profileDetails.experience_level || 'beginner',
        portfolio_url: profileDetails.portfolio_url || '',
        social_links: profileDetails.social_links || [],
        skills: profileDetails.skills || [],
        achievements: profileDetails.achievements || [],
        learning_path: profileDetails.learning_path || [],
      });
    }
  }, [profileDetails]);

  // Check for migration on component mount
  useEffect(() => {
    const needsMigration = !checkMigrationStatus();
    if (needsMigration) {
      toast({
        title: "Migrating your data",
        description: "We're moving your profile data to the cloud for better sync across devices.",
      });
      migrateAllData();
    }
  }, [migrateAllData, checkMigrationStatus, toast]);

  const handleSave = async () => {
    try {
      await updateProfileDetails(formData);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been saved and will sync across all devices.",
      });
    } catch (error) {
      toast({
        title: "Failed to update profile",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      social_links: [...prev.social_links, { platform: '', url: '' }]
    }));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: prev.social_links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { name: '', category: '', level: 0 }]
    }));
  };

  const updateSkill = (index: number, field: 'name' | 'category' | 'level', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Migration Status */}
      {isMigrating && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-800">Migrating your data to the cloud...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>
                  {profileDetails?.job_title?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {profileDetails?.job_title || 'User'}
                </h1>
                <p className="text-muted-foreground">
                  {profileDetails?.company || 'No company specified'}
                </p>
                <Badge variant="outline" className="mt-1">
                  {profileDetails?.experience_level || 'beginner'}
                </Badge>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Bio</label>
                  {isEditing ? (
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-muted-foreground mt-1">
                      {profileDetails?.bio || 'No bio provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Location</label>
                  {isEditing ? (
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Your location"
                    />
                  ) : (
                    <p className="text-muted-foreground mt-1">
                      {profileDetails?.location || 'No location specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Portfolio</label>
                  {isEditing ? (
                    <Input
                      value={formData.portfolio_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, portfolio_url: e.target.value }))}
                      placeholder="https://your-portfolio.com"
                    />
                  ) : (
                    <div className="mt-1">
                      {profileDetails?.portfolio_url ? (
                        <a
                          href={profileDetails.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center space-x-1"
                        >
                          <span>Visit Portfolio</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="text-muted-foreground">No portfolio link</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Experience Level</label>
                  {isEditing ? (
                    <select
                      value={formData.experience_level}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        experience_level: e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'expert'
                      }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  ) : (
                    <Badge variant="outline" className="mt-1">
                      {profileDetails?.experience_level || 'beginner'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Social Links</label>
                  {isEditing && (
                    <Button size="sm" onClick={addSocialLink}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Link
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {formData.social_links.map((link, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <Input
                            placeholder="Platform (e.g., LinkedIn)"
                            value={link.platform}
                            onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="URL"
                            value={link.url}
                            onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeSocialLink(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{link.platform}:</span>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center space-x-1"
                          >
                            <span>Visit</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                  {formData.social_links.length === 0 && !isEditing && (
                    <p className="text-muted-foreground">No social links added</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Skills & Expertise</h3>
                {isEditing && (
                  <Button size="sm" onClick={addSkill}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Skill
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.skills.map((skill, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            placeholder="Skill name"
                            value={skill.name}
                            onChange={(e) => updateSkill(index, 'name', e.target.value)}
                          />
                          <Input
                            placeholder="Category"
                            value={skill.category}
                            onChange={(e) => updateSkill(index, 'category', e.target.value)}
                          />
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">Level:</span>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={skill.level}
                              onChange={(e) => updateSkill(index, 'level', parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                            <span className="text-sm">%</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeSkill(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-semibold">{skill.name}</h4>
                          <p className="text-sm text-muted-foreground">{skill.category}</p>
                          <div className="mt-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${skill.level}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{skill.level}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {formData.skills.length === 0 && !isEditing && (
                  <p className="text-muted-foreground col-span-2">No skills added yet</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <h3 className="text-lg font-semibold">Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.achievements.map((achievement, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{achievement.date}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {formData.achievements.length === 0 && (
                  <p className="text-muted-foreground col-span-2">No achievements added yet</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="learning" className="space-y-4">
              <h3 className="text-lg font-semibold">Learning Journey</h3>
              <div className="space-y-4">
                {formData.learning_path.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{item.skill}</h4>
                          <p className="text-sm text-muted-foreground">
                            Lesson {item.currentLesson} of {item.totalLessons}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{item.progress}%</div>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {formData.learning_path.length === 0 && (
                  <p className="text-muted-foreground">No learning progress tracked yet</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {isEditing && (
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
