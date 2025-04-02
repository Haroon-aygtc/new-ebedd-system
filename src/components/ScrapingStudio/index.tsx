import React, { useState } from "react";
import MainScrapingStudio from "./MainScrapingStudio";
import BatchUrlInput from "./BatchUrlInput";
import UrlDiscoveryTool from "./UrlDiscoveryTool";
import ExportDialog from "./ExportDialog";

interface ScrapingStudioProps {
  onExport?: (data: any) => void;
}

const ScrapingStudio: React.FC<ScrapingStudioProps> = ({ onExport }) => {
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
    <>
      <MainScrapingStudio
        onExport={handleExport}
        onOpenBatchDialog={() => setShowBatchUrlDialog(true)}
        onOpenDiscoveryDialog={() => setShowUrlDiscoveryDialog(true)}
        batchUrls={batchUrls}
      />

      {/* Dialogs */}
      <BatchUrlInput
        isOpen={showBatchUrlDialog}
        onClose={() => setShowBatchUrlDialog(false)}
        onSubmit={handleBatchUrlSubmit}
        initialUrls={batchUrls}
      />

      <UrlDiscoveryTool
        isOpen={showUrlDiscoveryDialog}
        onClose={() => setShowUrlDiscoveryDialog(false)}
        onSubmit={handleUrlDiscoverySubmit}
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        data={exportData}
        onExport={handleExportComplete}
      />
    </>
  );
};

export default ScrapingStudio;
