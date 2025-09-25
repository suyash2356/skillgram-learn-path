import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tag, BookmarkX, Calendar, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const SavedPosts = () => {
  const { user } = useAuth();
  const storageKey = `savedPosts:${user?.id || 'guest'}`;
  const collectionsKey = `savedCollections:${user?.id || 'guest'}`;
  const [posts, setPosts] = useState<any[]>([]);
  const [collections, setCollections] = useState<string[]>(["All"]);
  const [selectedCollection, setSelectedCollection] = useState<string>("All");
  const [postCollection, setPostCollection] = useState<Record<string, string>>({});
  const [newCollection, setNewCollection] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setPosts(saved ? JSON.parse(saved) : []);
    } catch {
      setPosts([]);
    }
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
  }, [storageKey]);

  const unsave = (id: string) => {
    setPosts(prev => {
      const next = prev.filter(p => p.id !== id);
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      // also remove mapping
      setPostCollection(pc => {
        const copy = { ...pc };
        delete copy[id];
        persistCollections(collections, copy);
        return copy;
      });
      return next;
    });
  };

  const persistCollections = (cols: string[], map: Record<string, string>) => {
    try {
      localStorage.setItem(collectionsKey, JSON.stringify({ collections: cols.filter(c => c !== 'All'), map }));
    } catch {}
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
      if (col === 'None') {
        delete next[postId];
      } else {
        next[postId] = col;
      }
      persistCollections(collections, next);
      return next;
    });
  };

  const getFirstImage = (raw: string): string | null => {
    if (!raw) return null;
    const imgMd = raw.match(/!\[[^\]]*\]\(([^)]+)\)/);
    if (imgMd && (imgMd[1].startsWith('data:image') || imgMd[1].startsWith('http'))) return imgMd[1];
    if (raw.startsWith('data:image')) return raw;
    const urlMatch = raw.match(/https?:\/\/\S+\.(png|jpe?g|gif|webp)/i);
    return urlMatch ? urlMatch[0] : null;
  };

  const renderCompact = (raw: string) => {
    if (!raw) return null;
    // show only first non-image text block truncated
    const blocks = raw.split(/\n\n+/).filter(Boolean);
    const textBlock = blocks.find(b => !b.startsWith('data:image') && !/!\[[^\]]*\]\(([^)]+)\)/.test(b));
    if (!textBlock) return null;
    return (
      <p className="text-xs text-muted-foreground line-clamp-2 break-words">{textBlock}</p>
    );
  };

  const visiblePosts = selectedCollection === 'All' ? posts : posts.filter(p => postCollection[p.id] === selectedCollection);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold">Saved Posts</h1>
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
        </div>
        {posts.length === 0 ? (
          <div className="text-muted-foreground">You haven't saved any posts yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visiblePosts.map((post) => {
              const thumb = getFirstImage(post.content || '');
              return (
                <Card key={post.id} className="shadow-card hover:shadow-elevated transition-all">
                  {thumb && (
                    <div className="w-full h-32 overflow-hidden rounded-t-lg">
                      <img src={thumb} alt="thumb" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm font-semibold leading-snug break-words line-clamp-2">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.created_at).toLocaleDateString()}</span>
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5">{post.category || 'General'}</Badge>
                    </div>
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
                    {renderCompact(post.content || '')}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(post.tags || []).slice(0, 3).map((t: string, i: number) => (
                        <Badge key={`${post.id}-tag-${i}`} variant="outline" className="text-[10px]"><Tag className="h-3 w-3 mr-1" />{t}</Badge>
                      ))}
                      {(post.tags || []).length > 3 && (
                        <Badge variant="outline" className="text-[10px]">+{(post.tags || []).length - 3}</Badge>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button variant="destructive" size="sm" className="h-7 px-2 text-xs" onClick={() => unsave(post.id)}><BookmarkX className="h-3 w-3 mr-1" /> Unsave</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SavedPosts;
