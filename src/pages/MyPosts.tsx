import { useEffect, useState } from "react";
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
import { Edit3, Trash2, Bookmark, Tag, Calendar, FileText } from "lucide-react";

const MyPosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const collectionsKey = `myCollections:${user?.id || 'guest'}`;
  const [collections, setCollections] = useState<string[]>(["All"]);
  const [selectedCollection, setSelectedCollection] = useState<string>("All");
  const [postCollection, setPostCollection] = useState<Record<string, string>>({});
  const [newCollection, setNewCollection] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setLoading(false);
    if (error) { toast({ title: 'Failed to load posts', variant: 'destructive' }); return; }
    setPosts(data || []);
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(collectionsKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setCollections(parsed.collections?.length ? ["All", ...parsed.collections] : ["All"]);
        setPostCollection(parsed.map || {});
      } else {
        setCollections(["All"]);
        setPostCollection({});
      }
    } catch {
      setCollections(["All"]);
      setPostCollection({});
    }
  }, [collectionsKey]);

  const save = async (post: any) => {
    const { error } = await supabase.from('posts').update({ title: post.title, content: post.content, category: post.category, tags: post.tags }).eq('id', post.id);
    if (error) { toast({ title: 'Failed to save', variant: 'destructive' }); return; }
    toast({ title: 'Post updated' });
    setEditingId(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) { toast({ title: 'Delete failed', variant: 'destructive' }); return; }
    setPosts(prev => prev.filter(p => p.id !== id));
    toast({ title: 'Post deleted' });
  };

  const persistCollections = (cols: string[], map: Record<string, string>) => {
    try { 
      localStorage.setItem(collectionsKey, JSON.stringify({ collections: cols.filter(c => c !== 'All'), map })); 
    } catch (error) {
      console.warn('Failed to save collections:', error);
    }
  };

  const addCollection = () => {
    const name = newCollection.trim();
    if (!name || name === 'All' || collections.includes(name)) return;
    const next = [...collections, name];
    setCollections(next);
    setNewCollection("");
    persistCollections(next, postCollection);
  };

  const deleteCurrentCollection = () => {
    if (selectedCollection === 'All') return;
    if (!confirm(`Delete collection "${selectedCollection}"?`)) return;
    const nextCols = collections.filter(c => c !== selectedCollection);
    const nextMap: Record<string, string> = {};
    Object.entries(postCollection).forEach(([pid, col]) => {
      if (col !== selectedCollection) nextMap[pid] = col;
    });
    setCollections(nextCols);
    setPostCollection(nextMap);
    setSelectedCollection('All');
    persistCollections(nextCols, nextMap);
  };

  const assignCollection = (postId: string, col: string) => {
    setPostCollection(prev => {
      const next = { ...prev };
      if (col === 'None') { delete next[postId]; } else { next[postId] = col; }
      persistCollections(collections, next);
      return next;
    });
  };

  const renderContent = (raw: string) => {
    if (!raw) return null;
    const blocks = raw.split(/\n\n+/).slice(0, 6); // cap blocks for card
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

  const visiblePosts = selectedCollection === 'All' ? posts : posts.filter(p => postCollection[p.id] === selectedCollection);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold">My Posts</h1>
          <div className="flex items-center gap-2">
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCollection !== 'All' && (
              <Button variant="destructive" size="sm" onClick={deleteCurrentCollection}>Delete</Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="New collection" value={newCollection} onChange={(e) => setNewCollection(e.target.value)} className="h-9 w-44" />
            <Button size="sm" onClick={addCollection}>Add</Button>
          </div>
          <Link to="/create-post"><Button>Create Post</Button></Link>
        </div>
        {loading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-muted-foreground">You haven't created any posts yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {visiblePosts.map((post) => (
              <Card key={post.id} className="shadow-card hover:shadow-elevated transition-all">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    {editingId === post.id ? (
                      <Input value={post.title} onChange={(e) => setPosts(prev => prev.map(p => p.id === post.id ? { ...p, title: e.target.value } : p))} />
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
                    <Select value={postCollection[post.id] || 'None'} onValueChange={(v) => assignCollection(post.id, v)}>
                      <SelectTrigger className="h-8 w-40 text-xs">
                        <SelectValue placeholder="Assign collection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">No collection</SelectItem>
                        {collections.filter(c => c !== 'All').map(c => (
                          <SelectItem key={`${post.id}-${c}`} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {editingId === post.id ? (
                    <Textarea rows={5} value={post.content || ''} onChange={(e) => setPosts(prev => prev.map(p => p.id === post.id ? { ...p, content: e.target.value } : p))} />
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
                        <Button size="sm" onClick={() => save(post)}>Save</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setEditingId(post.id)}><Edit3 className="h-4 w-4 mr-1" /> Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => remove(post.id)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyPosts;
