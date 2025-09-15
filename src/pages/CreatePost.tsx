import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ImageIcon, 
  Video, 
  Link, 
  FileText, 
  BookOpen,
  Plus,
  X,
  Upload
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const navigate = useNavigate();
  const [postType, setPostType] = useState("article");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [category, setCategory] = useState("");

  const categories = [
    "Programming", "Design", "Data Science", "AI/ML", "DevOps", 
    "Cybersecurity", "Mobile Development", "Web Development", 
    "Cloud Computing", "Blockchain", "UI/UX", "Product Management"
  ];

  const postTypes = [
    { id: "article", name: "Article", icon: FileText, description: "Share knowledge and insights" },
    { id: "resource", name: "Resource", icon: BookOpen, description: "Curate learning materials" },
    { id: "video", name: "Video", icon: Video, description: "Educational video content" },
    { id: "link", name: "Link", icon: Link, description: "Share external resources" }
  ];

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally submit to your backend
    console.log({
      type: postType,
      title,
      description,
      content,
      tags,
      category
    });
    
    // Navigate back to home
    navigate('/home');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Post</h1>
          <p className="text-muted-foreground">
            Share your knowledge and help others learn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type Selection */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Post Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {postTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        postType === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setPostType(type.id)}
                    >
                      <Icon className="h-6 w-6 mb-2 mx-auto" />
                      <h3 className="font-medium text-center mb-1">{type.name}</h3>
                      <p className="text-xs text-muted-foreground text-center">
                        {type.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter a compelling title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your post..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-border rounded-md"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="write" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="write" className="space-y-4">
                  <Textarea
                    placeholder="Write your content here... You can use markdown formatting."
                    rows={12}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />

                  {/* Media Upload */}
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">
                      Drag and drop images or videos, or click to browse
                    </p>
                    <Button variant="outline" type="button">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Upload Media
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  <div className="border rounded-lg p-6 min-h-[300px] bg-muted/20">
                    <h3 className="text-xl font-bold mb-4">{title || "Your title will appear here"}</h3>
                    <p className="text-muted-foreground mb-4">{description || "Your description will appear here"}</p>
                    <div className="prose max-w-none">
                      {content ? (
                        <pre className="whitespace-pre-wrap font-sans">{content}</pre>
                      ) : (
                        <p className="text-muted-foreground">Your content will appear here</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/home')}
            >
              Cancel
            </Button>
            <Button type="button" variant="secondary">
              Save Draft
            </Button>
            <Button type="submit">
              Publish Post
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreatePost;