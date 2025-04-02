import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Database,
  FileJson,
  FileSpreadsheet,
  HardDrive,
  Save,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string, filename?: string) => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  onExport,
}) => {
  const [activeTab, setActiveTab] = useState("json");
  const [fileName, setFileName] = useState("scraped-data");
  const [tableName, setTableName] = useState("scraped_data");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleExport = () => {
    onExport(activeTab, fileName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Export Scraped Data</DialogTitle>
          <DialogDescription>
            Choose a format and destination for your scraped data.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="mt-4"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="json" className="flex items-center">
              <FileJson className="mr-2 h-4 w-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              CSV
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="file-name">File Name</Label>
                <Input
                  id="file-name"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="scraped-data"
                />
              </div>
            </div>
          </div>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onClose()}>
            Cancel
          </Button>
          <div className="space-x-2">
            <Button onClick={handleExport}>
              <Save className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
