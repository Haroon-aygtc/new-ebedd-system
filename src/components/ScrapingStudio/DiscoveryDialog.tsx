import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UrlDiscoveryTool from "./UrlDiscoveryTool";

interface DiscoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUrlsDiscover: (urls: string[]) => void;
}

const DiscoveryDialog: React.FC<DiscoveryDialogProps> = ({
  open,
  onOpenChange,
  onUrlsDiscover,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>URL Discovery Tool</DialogTitle>
        </DialogHeader>
        <UrlDiscoveryTool
          onUrlsDiscover={(urls) => {
            onUrlsDiscover(urls);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DiscoveryDialog;
