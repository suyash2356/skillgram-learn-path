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
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId: string;
  comments: Comment[];
}

export const CommentDialog = ({ isOpen, onClose, roadmapId, comments: initialComments }: CommentDialogProps) => {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          content,
          roadmap_id: roadmapId,
          post_id: null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmapComments', roadmapId] });
      setNewComment("");
      toast({ title: "Comment added!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to add comment", description: error.message, variant: "destructive" });
    },
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-left">Comments</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={addCommentMutation.isPending}
              />
              <div className="flex justify-end">
                <Button onClick={handleAddComment} size="sm" disabled={addCommentMutation.isPending}>
                  {addCommentMutation.isPending ? "Posting..." : <><Send className="h-4 w-4 mr-2" />Comment</>}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {initialComments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.avatar} />
                  <AvatarFallback>{comment.author[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">{new Date(comment.timestamp).toLocaleString()}</span>
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