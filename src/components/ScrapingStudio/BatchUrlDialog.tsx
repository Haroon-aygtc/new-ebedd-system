import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BatchUrlInput from "./BatchUrlInput";

interface BatchUrlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (urls: string[]) => void;
  initialUrls?: string[];
}

const BatchUrlDialog: React.FC<BatchUrlDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialUrls = [],
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Batch URL Input</DialogTitle>
        </DialogHeader>
        <BatchUrlInput
          initialUrls={initialUrls}
          onUrlsSubmit={(urls) => {
            onSubmit(urls);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BatchUrlDialog;
