import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Edit3, Trash2, Tag, Calendar, FileText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePostCollections } from "@/hooks/usePostCollections";
import { Tables } from "@/integrations/supabase/types";

type Post = Tables<'posts'>;

const MyPosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPosts, setEditedPosts] = useState<Record<string, Partial<Post>>>({});
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("All");
  const [newCollection, setNewCollection] = useState("");

  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['myPosts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data as Post[];
    },
    enabled: !!user,
  });

  const { collections, addCollection, deleteCollection, assignPostToCollection } = usePostCollections();

  const updatePostMutation = useMutation({
    mutationFn: async (post: Post) => {
      const { error } = await supabase.from('posts').update(editedPosts[post.id]!).eq('id', post.id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myPosts', user?.id] });
      toast({ title: 'Post updated' });
      setEditingId(null);
      setEditedPosts(prev => {
        const next = { ...prev };
        delete next[variables.id];
        return next;
      });
    },
    onError: () => {
      toast({ title: 'Failed to update post', variant: 'destructive' });
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPosts', user?.id] });
      toast({ title: 'Post deleted' });
    },
    onError: () => {
      toast({ title: 'Failed to delete post', variant: 'destructive' });
    }
  });

  const handleEditChange = (postId: string, field: keyof Post, value: any) => {
    setEditedPosts(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [field]: value,
      }
    }));
  };

  const handleAddCollection = () => {
    const name = newCollection.trim();
    if (!name || name === 'All' || collections?.some(c => c.name === name)) return;
    addCollection(name);
    setNewCollection("");
  };

  const handleDeleteCollection = () => {
    if (selectedCollectionId === 'All') return;
    if (!confirm(`Delete collection? This will not delete the posts.`)) return;
    deleteCollection(selectedCollectionId);
    setSelectedCollectionId('All');
  };

  const handleAssignCollection = (postId: string, collectionId: string) => {
    assignPostToCollection({ postId, collectionId: collectionId === 'None' ? null : collectionId });
  };

  const renderContent = (raw: string | null) => {
    if (!raw) return null;
    const blocks = raw.split(/\n\n+/).slice(0, 6);
    return (
      <div className="space-y-3">
        {blocks.map((block, idx) => {
          const imgMatch = block.match(/!\[[^\]]*\]\(([^)]+)\)/);
          if (imgMatch) {
            const url = imgMatch[1];
            if (url.startsWith('data:image') || url.startsWith('http')) {
              return (
                <div key={idx} className="rounded-lg overflow-hidden border">
                  <img src={url} alt="post" className="w-full h-auto object-contain" />
                </div>
              );
            }
          }
          if (block.startsWith('data:image')) {
            return (
              <div key={idx} className="rounded-lg overflow-hidden border">
                <img src={block} alt="post" className="w-full h-auto object-contain" />
              </div>
            );
          }
          const urlMatch = block.match(/https?:\/\/\S+/);
          if (urlMatch) {
            const url = urlMatch[0];
            return (
              <a key={idx} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm break-all">
                <FileText className="h-4 w-4" />
                <span className="break-all">{url}</span>
              </a>
            );
          }
          return <p key={idx} className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap break-words">{block.length > 600 ? block.slice(0, 600) + '…' : block}</p>;
        })}
      </div>
    );
  };

  const visiblePosts = selectedCollectionId === 'All' 
    ? posts 
    : posts?.filter(p => p.post_collection_id === selectedCollectionId);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold">My Posts</h1>
          <div className="flex items-center gap-2">
            <Select value={selectedCollectionId} onValueChange={setSelectedCollectionId}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {collections?.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCollectionId !== 'All' && (
              <Button variant="destructive" size="sm" onClick={handleDeleteCollection}>Delete</Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="New collection" value={newCollection} onChange={(e) => setNewCollection(e.target.value)} className="h-9 w-44" />
            <Button size="sm" onClick={handleAddCollection}>Add</Button>
          </div>
          <Link to="/create-post"><Button>Create Post</Button></Link>
        </div>
        {isLoadingPosts ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : posts?.length === 0 ? (
          <div className="text-muted-foreground">You haven't created any posts yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {visiblePosts?.map((post) => {
              const currentPost = { ...post, ...editedPosts[post.id] };
              return (
              <Card key={post.id} className="shadow-card hover:shadow-elevated transition-all">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    {editingId === post.id ? (
                      <Input value={currentPost.title} onChange={(e) => handleEditChange(post.id, 'title', e.target.value)} />
                    ) : (
                      <span className="break-words">{post.title}</span>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{post.category || 'General'}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.created_at).toLocaleString()}</div>
                  <div className="flex items-center justify-between">
                    <Select value={post.post_collection_id || 'None'} onValueChange={(v) => handleAssignCollection(post.id, v)}>
                      <SelectTrigger className="h-8 w-40 text-xs">
                        <SelectValue placeholder="Assign collection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">No collection</SelectItem>
                        {collections?.map(c => (
                          <SelectItem key={`${post.id}-${c.id}`} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {editingId === post.id ? (
                    <Textarea rows={5} value={currentPost.content || ''} onChange={(e) => handleEditChange(post.id, 'content', e.target.value)} />
                  ) : (
                    <div className="overflow-hidden">{renderContent(post.content || '')}</div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {(post.tags || []).map((t: string, i: number) => (
                      <Badge key={`${post.id}-tag-${i}`} variant="outline" className="text-xs"><Tag className="h-3 w-3 mr-1" />{t}</Badge>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    {editingId === post.id ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                        <Button size="sm" onClick={() => updatePostMutation.mutate(post)} disabled={updatePostMutation.isPending}>
                          {updatePostMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setEditingId(post.id)}><Edit3 className="h-4 w-4 mr-1" /> Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => deletePostMutation.mutate(post.id)} disabled={deletePostMutation.isPending}>
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )})}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyPosts;
