import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BatchUrlInput from "./BatchUrlInput";

interface BatchUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUrlsSubmit: (urls: string[]) => void;
}

const BatchUrlDialog: React.FC<BatchUrlDialogProps> = ({
  open,
  onOpenChange,
  onUrlsSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Batch URL Input</DialogTitle>
        </DialogHeader>
        <BatchUrlInput
          onUrlsSubmit={(urls) => {
            onUrlsSubmit(urls);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BatchUrlDialog;
