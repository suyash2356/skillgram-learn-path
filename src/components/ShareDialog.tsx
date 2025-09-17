import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Copy, Facebook, Twitter, Linkedin, Mail, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url?: string;
}

export const ShareDialog = ({ open, onOpenChange, title, url = window.location.href }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
  };

  const openShare = (platform: keyof typeof shareUrls) => {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share this content</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Copy link</label>
            <div className="flex space-x-2">
              <Input value={url} readOnly className="flex-1" />
              <Button onClick={handleCopyLink} variant="outline" size="sm">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Social Share */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Share on social media</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => openShare('facebook')}
                className="flex items-center space-x-2"
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => openShare('twitter')}
                className="flex items-center space-x-2"
              >
                <Twitter className="h-4 w-4" />
                <span>Twitter</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => openShare('linkedin')}
                className="flex items-center space-x-2"
              >
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => openShare('email')}
                className="flex items-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};