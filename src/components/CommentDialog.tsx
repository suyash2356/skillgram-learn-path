import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface CommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postTitle: string;
  comments: Comment[];
  postId?: string;
  roadmapId?: string; // New prop for roadmap comments
  onCommentAdded?: () => void;
}

export const CommentDialog = ({ open, onOpenChange, postTitle, comments: initialComments, postId = "", roadmapId = "", onCommentAdded }: CommentDialogProps) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(initialComments);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments, open]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!user || (!postId && !roadmapId)) {
      toast({ title: "Invalid request", description: "Must be logged in and provide a post or roadmap ID.", variant: "destructive" });
      return;
    }

    const commentData: { user_id: string; content: string; post_id?: string; roadmap_id?: string } = {
      user_id: user.id,
      content: newComment.trim(),
    };

    let insertError;
    if (postId) {
      const { error } = await supabase.from("comments").insert({ user_id: user.id, content: newComment.trim(), post_id: postId });
      insertError = error;
    } else if (roadmapId) {
      const { error } = await supabase.from("comments").insert({ user_id: user.id, content: newComment.trim(), roadmap_id: roadmapId });
      insertError = error;
    }

    if (insertError) {
      toast({ title: "Failed to add comment", description: insertError.message, variant: "destructive" });
      return;
    }

    const newLocal: Comment = {
      id: Date.now(),
      author: user.email || "You",
      avatar: "/placeholder.svg",
      content: newComment.trim(),
      timestamp: new Date().toLocaleString(),
      likes: 0,
    };

    setComments([newLocal, ...comments]);
    setNewComment("");
    if (onCommentAdded) {
      onCommentAdded();
    }
    toast({ title: "Comment added" });

    // Send notification
    if (user.id) {
      const { data: commenterProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      const commenterName = commenterProfile?.full_name || 'Someone';

      if (postId) {
        const { data: postOwner } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', postId)
          .single();
        if (postOwner?.user_id && postOwner.user_id !== user.id) {
          await supabase.from('notifications').insert({
            user_id: postOwner.user_id,
            type: 'post_comment',
            title: `${commenterName} commented on your post!`,
            body: `"${newComment.trim()}" on your post "${postTitle}".`,
            data: { postId, commenterId: user.id, commenterName, commentContent: newComment.trim() },
          });
        }
      } else if (roadmapId) {
        const { data: roadmapOwner } = await supabase
          .from('roadmaps')
          .select('user_id')
          .eq('id', roadmapId)
          .single();
        if (roadmapOwner?.user_id && roadmapOwner.user_id !== user.id) {
          await supabase.from('notifications').insert({
            user_id: roadmapOwner.user_id,
            type: 'roadmap_comment',
            title: `${commenterName} commented on your roadmap!`,
            body: `"${newComment.trim()}" on your roadmap "${postTitle}".`,
            data: { roadmapId, commenterId: user.id, commenterName, commentContent: newComment.trim() },
          });
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-left">Comments</DialogTitle>
          <p className="text-sm text-muted-foreground text-left">{postTitle}</p>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Add Comment */}
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end">
                <Button onClick={handleAddComment} size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Comment
                </Button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.avatar} />
                  <AvatarFallback>{comment.author[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground">
                      <Heart className="h-4 w-4 mr-1" />
                      {comment.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};