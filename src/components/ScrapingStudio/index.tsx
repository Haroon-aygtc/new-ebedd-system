import React, { useState } from "react";
import MainScrapingStudio from "./MainScrapingStudio";
import ExportDialog from "./ExportDialog";
import BatchUrlDialog from "./BatchUrlDialog";
import DiscoveryDialog from "./DiscoveryDialog";

interface ScrapingStudioProps {
  onExport?: (data: any) => void;
  className?: string;
}

const ScrapingStudio: React.FC<ScrapingStudioProps> = ({
  onExport,
  className,
}) => {
  // Dialog states
  const [showBatchUrlDialog, setShowBatchUrlDialog] = useState<boolean>(false);
  const [showUrlDiscoveryDialog, setShowUrlDiscoveryDialog] =
    useState<boolean>(false);
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);

  // Data for export
  const [exportData, setExportData] = useState<any[]>([]);

  // Batch URLs
  const [batchUrls, setBatchUrls] = useState<string[]>([]);

  const handleBatchUrlSubmit = (urls: string[]) => {
    setBatchUrls(urls);
  };

  const handleUrlDiscoverySubmit = (urls: string[]) => {
    setBatchUrls(urls);
  };

  const handleExport = (data: any) => {
    setExportData(data);
    setShowExportDialog(true);
  };

  const handleExportComplete = (data: any, format: string) => {
    // Call the parent's onExport function if provided
    if (onExport) {
      onExport({
        data,
        format,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div className={`w-full h-full flex flex-col ${className || ""}`}>
      <MainScrapingStudio
        onExport={handleExport}
        onOpenBatchDialog={() => setShowBatchUrlDialog(true)}
        onOpenDiscoveryDialog={() => setShowUrlDiscoveryDialog(true)}
        batchUrls={batchUrls}
      />

      {/* Use proper dialog components instead of custom modals */}
      <BatchUrlDialog
        open={showBatchUrlDialog}
        onOpenChange={setShowBatchUrlDialog}
        onUrlsSubmit={handleBatchUrlSubmit}
      />

      <DiscoveryDialog
        open={showUrlDiscoveryDialog}
        onOpenChange={setShowUrlDiscoveryDialog}
        onUrlsDiscover={handleUrlDiscoverySubmit}
      />

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        data={exportData}
        onExport={handleExportComplete}
      />
    </div>
  );
};

export default ScrapingStudio;
