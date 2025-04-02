import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useScraper } from "@/hooks/useScraper";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Import sub-components
import ScrapingHeader from "./ScrapingHeader";
import UrlInput from "./UrlInput";
import BatchUrlsBar from "./BatchUrlsBar";
import ProgressBar from "./ProgressBar";
import BrowserPreview from "./BrowserPreview";
import SelectorPanel from "./SelectorPanel";
import ResultsPanel from "./ResultsPanel";
import BatchUrlDialog from "./BatchUrlDialog";
import DiscoveryDialog from "./DiscoveryDialog";
import ExportDialog from "./ExportDialog";

// Types
interface Selector {
  id: string;
  selector: string;
  type: string;
  name?: string;
  attribute?: string;
  aiGenerated?: boolean;
}

interface ScrapedItem {
  url: string;
  data: Array<{
    name: string;
    selector: string;
    type: string;
    value: string | string[];
  }>;
  timestamp: string;
  error?: string;
}

interface ScrapingStudioProps {
  onExport?: (data: any) => void;
  onOpenBatchDialog?: () => void;
  onOpenDiscoveryDialog?: () => void;
  batchUrls?: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const MainScrapingStudio: React.FC<ScrapingStudioProps> = (props) => {
  const { onExport, batchUrls = [] } = props;
  const { toast } = useToast();

  // State
  const [url, setUrl] = useState<string>("");
  const [urls, setUrls] = useState<string[]>(batchUrls || []);
  const [currentUrlIndex, setCurrentUrlIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [selectedElements, setSelectedElements] = useState<Selector[]>([]);
  const [scrapedData, setScrapedData] = useState<ScrapedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Add state for dialogs
  const [showBatchUrlDialog, setShowBatchUrlDialog] = useState<boolean>(false);
  const [showUrlDiscoveryDialog, setShowUrlDiscoveryDialog] =
    useState<boolean>(false);
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);

  // Dialog states - these are now handled by the parent component
  // We'll just use these functions to communicate with the parent
  const handleOpenBatchDialog = () => {
    if (typeof props.onOpenBatchDialog === "function") {
      props.onOpenBatchDialog();
    } else {
      setShowBatchUrlDialog(true);
    }
  };

  const handleOpenDiscoveryDialog = () => {
    if (typeof props.onOpenDiscoveryDialog === "function") {
      props.onOpenDiscoveryDialog();
    } else {
      setShowUrlDiscoveryDialog(true);
    }
  };

  // Use the useScraper hook for API interactions
  const {
    loadUrl: hookLoadUrl,
    startScraping,
    stopScraping,
    exportData,
    isLoading: hookIsLoading,
    error: hookError,
    scrapingProgress: hookProgress,
    isScrapingActive: hookIsScrapingActive,
  } = useScraper();

  // Load URL function
  const loadUrl = async (urlToLoad: string) => {
    if (!urlToLoad) return;

    setIsLoading(true);
    setUrl(urlToLoad);

    try {
      await hookLoadUrl(urlToLoad);
      toast({
        title: "URL loaded successfully",
        description: `Content from ${urlToLoad} is ready for scraping`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error loading URL:", error);
      toast({
        title: "Error loading URL",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle element selection
  const handleElementSelect = (selector: string, element: HTMLElement) => {
    // Generate a unique ID
    const id = `selector-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Determine the best type based on the element
    let type = "text";
    if (element.tagName === "IMG") {
      type = "image";
    } else if (element.tagName === "A") {
      type = "link";
    } else if (element.children.length > 3) {
      type = "html";
    }

    // Create a name from the element content or attributes
    let name = "";
    if (element.textContent) {
      name = element.textContent.trim().substring(0, 20);
      if (name.length < 3 && element.getAttribute("alt")) {
        name = element.getAttribute("alt")!;
      }
    } else if (element.getAttribute("alt")) {
      name = element.getAttribute("alt")!;
    } else if (element.getAttribute("title")) {
      name = element.getAttribute("title")!;
    } else if (element.getAttribute("id")) {
      name = element.getAttribute("id")!;
    } else {
      name = selector.replace(/[.#]/g, "");
    }

    // Add the new element to selected elements
    setSelectedElements((prev) => [
      ...prev,
      {
        id,
        selector,
        type,
        name,
      },
    ]);

    // Switch to the selectors tab
    setActiveTab("selectors");

    toast({
      title: "Element selected",
      description: `Added ${name} with selector: ${selector}`,
      variant: "default",
    });
  };

  // Start scraping
  const handleStartScraping = async () => {
    if (selectedElements.length === 0) {
      toast({
        title: "No elements selected",
        description: "Please select at least one element to scrape",
        variant: "destructive",
      });
      return;
    }

    setIsScraping(true);
    setProgress(0);

    try {
      // Use the hook's startScraping function
      const urlsToScrape = urls.length > 0 ? urls : [url];
      const scrapingConfig = {
        paginationSelector: "",
        maxPages: 1,
        delay: 1000,
        followLinks: false,
        headless: true,
      };

      const results = await startScraping(
        urlsToScrape,
        selectedElements,
        scrapingConfig,
      );

      if (results) {
        setScrapedData(results);
        // Save to localStorage for export functionality
        localStorage.setItem("scraped-data", JSON.stringify(results));
      }

      setProgress(100);
      // Switch to the results tab
      setActiveTab("results");
    } catch (error) {
      console.error("Error during scraping:", error);
    } finally {
      setIsScraping(false);
    }
  };

  // Stop scraping
  const handleStopScraping = () => {
    stopScraping();
    setIsScraping(false);
  };

  // Handle export
  const handleExport = () => {
    if (onExport && scrapedData.length > 0) {
      onExport(scrapedData);
    } else {
      // Open export dialog
      setShowExportDialog(true);
    }
  };

  // Handle export format
  const handleExportFormat = (format: string, filename?: string) => {
    if (scrapedData.length === 0) {
      toast({
        title: "No data to export",
        description: "Please scrape some data first",
        variant: "destructive",
      });
      return;
    }

    // Use the hook's exportData function
    exportData(format as "json" | "csv", filename);

    toast({
      title: "Data exported",
      description: `Data has been exported in ${format.toUpperCase()} format`,
      variant: "default",
    });
  };

  // Selector panel handlers
  const handleRemoveSelector = (id: string) => {
    setSelectedElements((prev) => prev.filter((el) => el.id !== id));
  };

  const handleClearSelectors = () => {
    setSelectedElements([]);
    toast({
      title: "Selectors cleared",
      description: "All selectors have been removed",
      variant: "default",
    });
  };

  const handleSelectorTypeChange = (id: string, type: string) => {
    setSelectedElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, type } : el)),
    );
  };

  const handleSelectorNameChange = (id: string, name: string) => {
    setSelectedElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, name } : el)),
    );
  };

  const handleSelectorAttributeChange = (id: string, attribute: string) => {
    setSelectedElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, attribute } : el)),
    );
  };

  // Update URLs when batchUrls prop changes
  useEffect(() => {
    if (batchUrls && batchUrls.length > 0) {
      setUrls(batchUrls);
    }
  }, [batchUrls]);

  const handleBatchUrlSubmit = (batchUrls: string[]) => {
    setUrls(batchUrls);
    setShowBatchUrlDialog(false);

    toast({
      title: "Batch URLs added",
      description: `${batchUrls.length} URLs have been added to the queue`,
      variant: "default",
    });

    // If we have a URL, load the first one
    if (batchUrls.length > 0 && !url) {
      loadUrl(batchUrls[0]);
      setCurrentUrlIndex(0);
    }
  };

  const handleUrlDiscoverySubmit = (discoveredUrls: string[]) => {
    setUrls(discoveredUrls);
    setShowUrlDiscoveryDialog(false);

    toast({
      title: "URLs discovered",
      description: `${discoveredUrls.length} URLs have been discovered and added to the queue`,
      variant: "default",
    });

    // If we have a URL, load the first one
    if (discoveredUrls.length > 0 && !url) {
      loadUrl(discoveredUrls[0]);
      setCurrentUrlIndex(0);
    }
  };

  // Toggle select mode when the tab changes
  useEffect(() => {
    setIsSelectMode(activeTab === "preview");
  }, [activeTab]);

  // Filter selectors based on search term
  const filteredSelectors = React.useMemo(() => {
    if (!searchTerm) return selectedElements;

    return selectedElements.filter(
      (selector) =>
        selector.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        selector.selector.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [selectedElements, searchTerm]);

  return (
    <div className="bg-background w-full h-full flex flex-col overflow-hidden">
      <Card className="flex-1 flex flex-col overflow-hidden w-full">
        <ScrapingHeader
          isScraping={isScraping}
          onStartScraping={handleStartScraping}
          onStopScraping={handleStopScraping}
          onExport={handleExport}
          isStartDisabled={isLoading || selectedElements.length === 0}
        />

        <div className="px-4 pb-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <UrlInput onLoadUrl={loadUrl} disabled={isScraping} />
            </div>

            <BatchUrlsBar
              urls={urls}
              currentUrlIndex={currentUrlIndex}
              onOpenBatchDialog={handleOpenBatchDialog}
              onOpenDiscoveryDialog={handleOpenDiscoveryDialog}
              disabled={isScraping}
            />
          </div>

          <ProgressBar progress={progress} isVisible={isScraping} />
        </div>

        <div className="flex-1 px-4 pb-4 min-h-0 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="selectors">
                Selectors ({selectedElements.length})
              </TabsTrigger>
              <TabsTrigger value="results">
                Results ({scrapedData.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-2 min-h-0 overflow-hidden">
              <TabsContent value="preview" className="h-full m-0">
                <BrowserPreview
                  isLoading={isLoading}
                  url={url}
                  onElementSelect={handleElementSelect}
                  isSelectMode={isSelectMode}
                />
              </TabsContent>

              <TabsContent value="selectors" className="h-full m-0">
                <div className="flex flex-col h-full">
                  <div className="mb-4 relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search selectors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <SelectorPanel
                    selectors={filteredSelectors}
                    onRemoveSelector={handleRemoveSelector}
                    onClearSelectors={handleClearSelectors}
                    onTypeChange={handleSelectorTypeChange}
                    onNameChange={handleSelectorNameChange}
                    onAttributeChange={handleSelectorAttributeChange}
                  />
                </div>
              </TabsContent>

              <TabsContent value="results" className="h-full m-0">
                <ResultsPanel
                  results={scrapedData}
                  onExport={handleExportFormat}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Card>

      {/* Dialogs */}
      <BatchUrlDialog
        isOpen={showBatchUrlDialog}
        onClose={() => setShowBatchUrlDialog(false)}
        onSubmit={handleBatchUrlSubmit}
        initialUrls={urls}
      />

      <DiscoveryDialog
        isOpen={showUrlDiscoveryDialog}
        onClose={() => setShowUrlDiscoveryDialog(false)}
        onSubmit={handleUrlDiscoverySubmit}
        currentUrl={url}
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExportFormat}
      />
    </div>
  );
};

export default MainScrapingStudio;
