import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { exportScrapedData } from "@/api/services/scrapeService";
import {
  Database,
  FileJson,
  FileSpreadsheet,
  HardDrive,
  Save,
  Vector,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  onExport: (data: any, format: string) => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  data,
  onExport,
}) => {
  const [activeTab, setActiveTab] = useState("json");
  const [fileName, setFileName] = useState("scraped-data");
  const [tableName, setTableName] = useState("scraped_data");
  const [exportFormat, setExportFormat] = useState<
    "json" | "csv" | "sql" | "vector"
  >("json");
  const [exportedContent, setExportedContent] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setExportFormat(value as "json" | "csv" | "sql" | "vector");
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Generate the export content
      const content = await exportScrapedData(data, exportFormat, {
        tableName: tableName,
      });

      setExportedContent(content);

      // Call the parent's onExport function
      onExport(data, exportFormat);
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!exportedContent) return;

    const extensions = {
      json: "json",
      csv: "csv",
      sql: "sql",
      vector: "json",
    };

    const blob = new Blob([exportedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.${extensions[exportFormat]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveToProject = () => {
    // In a real implementation, this would save to a project folder
    alert("Data saved to project folder");
    onOpenChange(false);
  };

  const handleSaveToDatabase = () => {
    // In a real implementation, this would save to a database
    alert("Data saved to database");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="json" className="flex items-center">
              <FileJson className="mr-2 h-4 w-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              CSV
            </TabsTrigger>
            <TabsTrigger value="sql" className="flex items-center">
              <Database className="mr-2 h-4 w-4" />
              SQL
            </TabsTrigger>
            <TabsTrigger value="vector" className="flex items-center">
              <Vector className="mr-2 h-4 w-4" />
              Vector
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

              {activeTab === "sql" && (
                <div>
                  <Label htmlFor="table-name">Table Name</Label>
                  <Input
                    id="table-name"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="scraped_data"
                  />
                </div>
              )}
            </div>

            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Export Preview</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? "Generating..." : "Generate Preview"}
                </Button>
              </div>

              <ScrollArea className="h-60 border rounded-md bg-muted/50 p-2">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {exportedContent ||
                    'Click "Generate Preview" to see the exported data'}
                </pre>
              </ScrollArea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                className="border rounded-md p-4 flex flex-col items-center justify-center hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={handleSaveToProject}
              >
                <HardDrive className="h-8 w-8 mb-2" />
                <h3 className="font-medium">Save to Project</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Save as a file in your project folder
                </p>
              </div>

              <div
                className="border rounded-md p-4 flex flex-col items-center justify-center hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={handleSaveToDatabase}
              >
                <Database className="h-8 w-8 mb-2" />
                <h3 className="font-medium">Save to Database</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Store in your connected database
                </p>
              </div>
            </div>
          </div>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="space-x-2">
            <Button
              variant="secondary"
              onClick={handleDownload}
              disabled={!exportedContent}
            >
              <Save className="mr-2 h-4 w-4" />
              Download File
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              Export Data
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
