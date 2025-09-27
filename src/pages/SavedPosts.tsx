import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tag, BookmarkX, Calendar, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import { Link } from "react-router-dom";
import { useState } from "react";

const SavedPosts = () => {
  const {
    savedPosts,
    collections,
    isLoading,
    createCollection,
    savePost,
    removeSavedPost,
    updateCollection,
    deleteCollection,
    migrateFromLocalStorage,
  } = useSavedPosts();

  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState("");

  const handleAddCollection = () => {
    if (newCollectionName.trim()) {
      createCollection({ name: newCollectionName.trim() });
      setNewCollectionName("");
    }
  };

  const handleDeleteCollection = () => {
    if (selectedCollectionId && window.confirm("Are you sure you want to delete this collection?")) {
      deleteCollection(selectedCollectionId);
      setSelectedCollectionId(null);
    }
  };

  const visiblePosts = selectedCollectionId
    ? savedPosts?.filter(p => p.collection_id === selectedCollectionId)
    : savedPosts || [];

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
    const blocks = raw.split(/\n\n+/).filter(Boolean);
    const textBlock = blocks.find(b => !b.startsWith('data:image') && !/!\[[^\]]*\]\(([^)]+)\)/.test(b));
    if (!textBlock) return null;
    return (
      <p className="text-xs text-muted-foreground line-clamp-2 break-words">{textBlock}</p>
    );
  };

  if (isLoading) {
    return <Layout><div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold">Saved Posts</h1>
          <div className="flex items-center gap-2">
            <Select value={selectedCollectionId || 'all'} onValueChange={(val) => setSelectedCollectionId(val === 'all' ? null : val)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Saved Posts</SelectItem>
                {collections.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCollectionId && (
              <Button variant="destructive" size="sm" onClick={handleDeleteCollection}><Trash2 className="h-4 w-4 mr-1" /> Delete Collection</Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="New collection name" value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} className="h-9 w-44" />
            <Button size="sm" onClick={handleAddCollection}><PlusCircle className="h-4 w-4 mr-1" /> Add</Button>
          </div>
        </div>
        {visiblePosts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <h3 className="text-lg font-semibold">No saved posts yet</h3>
            <p>Start exploring and save posts to read later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visiblePosts.map((post) => {
              const thumb = getFirstImage(post.post?.content || '');
              return (
                <Card key={post.id} className="shadow-card hover:shadow-elevated transition-all flex flex-col">
                  <Link to={`/posts/${post.post?.id || post.id}`} className="flex-grow">
                    {thumb && (
                      <div className="w-full h-32 overflow-hidden rounded-t-lg">
                        <img src={thumb} alt="Post thumbnail" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm font-semibold leading-snug break-words line-clamp-2">
                        {post.post?.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2 flex-grow">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.created_at).toLocaleDateString()}</span>
                        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">{post.post?.category || 'General'}</Badge>
                      </div>
                      {renderCompact(post.post?.content || '')}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(post.post?.tags || []).slice(0, 3).map((t: string, i: number) => (
                          <Badge key={`${post.id}-tag-${i}`} variant="outline" className="text-[10px]"><Tag className="h-3 w-3 mr-1" />{t}</Badge>
                        ))}
                        {(post.post?.tags || []).length > 3 && (
                          <Badge variant="outline" className="text-[10px]">+{(post.post?.tags || []).length - 3}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Link>
                  <div className="p-3 border-t flex items-center justify-between gap-2">
                    <Select
                      value={post.collection_id || 'none'}
                      // assignPostToCollection logic removed; implement if needed
                    >
                      <SelectTrigger className="h-8 w-full text-xs">
                        <SelectValue placeholder="Assign collection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No collection</SelectItem>
                        {collections.map(c => (
                          <SelectItem key={`${post.id}-${c.id}`} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="destructive" size="sm" className="h-8 px-2 text-xs" onClick={() => removeSavedPost(post.id)}><BookmarkX className="h-3 w-3" />
                    </Button>
                  </div>
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
