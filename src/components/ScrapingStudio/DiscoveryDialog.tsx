import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UrlDiscoveryTool from "./UrlDiscoveryTool";

interface DiscoveryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (urls: string[]) => void;
  currentUrl?: string;
}

const DiscoveryDialog: React.FC<DiscoveryDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUrl = "",
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>URL Discovery Tool</DialogTitle>
        </DialogHeader>
        <UrlDiscoveryTool
          startUrl={currentUrl}
          onUrlsDiscover={(urls) => {
            onSubmit(urls);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DiscoveryDialog;
