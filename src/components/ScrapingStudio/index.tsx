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
    setShowBatchUrlDialog(false);
  };

  const handleUrlDiscoverySubmit = (urls: string[]) => {
    setBatchUrls(urls);
    setShowUrlDiscoveryDialog(false);
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

      {/* Dialogs */}
      <BatchUrlDialog
        isOpen={showBatchUrlDialog}
        onClose={() => setShowBatchUrlDialog(false)}
        onSubmit={handleBatchUrlSubmit}
        initialUrls={batchUrls}
      />

      <DiscoveryDialog
        isOpen={showUrlDiscoveryDialog}
        onClose={() => setShowUrlDiscoveryDialog(false)}
        onSubmit={handleUrlDiscoverySubmit}
        currentUrl=""
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={(format, filename) => {
          handleExportComplete(exportData, format);
        }}
      />
    </div>
  );
};

export default ScrapingStudio;
