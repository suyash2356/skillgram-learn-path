import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareLinkDialogProps {
  roadmapId: string;
  isPublic: boolean;
  roadmapTitle: string;
  onPublicToggle: (isPublic: boolean) => Promise<void>;
}

export const ShareLinkDialog: React.FC<ShareLinkDialogProps> = ({
  roadmapId,
  isPublic,
  roadmapTitle,
  onPublicToggle,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareableLink = `${window.location.origin}/roadmaps/${roadmapId}?share=true`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    toast({ title: "Link copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">
          <Share2 className="h-4 w-4 mr-2" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Roadmap: {roadmapTitle}</DialogTitle>
          <DialogDescription>
            Control the visibility of your roadmap and get a shareable link.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-public-share"
              checked={isPublic}
              onCheckedChange={(checked: boolean | string) => onPublicToggle(!!checked)}
            />
            <Label htmlFor="is-public-share" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Make this roadmap public (discoverable by others)
            </Label>
          </div>
          {isPublic && (
            <div className="flex flex-col space-y-2">
              <Label htmlFor="share-link" className="text-sm font-medium">
                Shareable Link
              </Label>
              <div className="flex items-center space-x-2">
                <Input id="share-link" readOnly value={shareableLink} />
                <Button onClick={handleCopyLink} className="shrink-0">
                  {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                  <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

