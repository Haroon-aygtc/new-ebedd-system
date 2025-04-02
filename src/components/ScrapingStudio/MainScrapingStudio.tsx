import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useScraper } from "@/hooks/useScraper";

// Import sub-components
import ScrapingHeader from "./ScrapingHeader";
import UrlInput from "./UrlInput";
import BatchUrlsBar from "./BatchUrlsBar";
import ProgressBar from "./ProgressBar";
import BrowserPreview from "./BrowserPreview";
import SelectorPanel from "./SelectorPanel";
import ResultsPanel from "./ResultsPanel";

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

  // Dialog states - these are now handled by the parent component
  // We'll just use these functions to communicate with the parent
  const handleOpenBatchDialog = () => {
    if (typeof props.onOpenBatchDialog === "function") {
      props.onOpenBatchDialog();
    }
  };

  const handleOpenDiscoveryDialog = () => {
    if (typeof props.onOpenDiscoveryDialog === "function") {
      props.onOpenDiscoveryDialog();
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
    console.log("Element selected:", selector, element);
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
      const results = await startScraping(urlsToScrape);

      if (results) {
        setScrapedData(results);
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
      // Default export behavior if no callback provided
      handleExportFormat("json");
    }
  };

  // Handle export format
  const handleExportFormat = (format: string) => {
    if (scrapedData.length === 0) {
      toast({
        title: "No data to export",
        description: "Please scrape some data first",
        variant: "destructive",
      });
      return;
    }

    // Use the hook's exportData function
    exportData(format as "json" | "csv");
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
  };

  const handleUrlDiscoverySubmit = (discoveredUrls: string[]) => {
    setUrls(discoveredUrls);
    setShowUrlDiscoveryDialog(false);

    toast({
      title: "URLs discovered",
      description: `${discoveredUrls.length} URLs have been discovered and added to the queue`,
      variant: "default",
    });
  };

  // Toggle select mode when the tab changes
  useEffect(() => {
    setIsSelectMode(activeTab === "preview");
  }, [activeTab]);

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
                <SelectorPanel
                  selectors={selectedElements}
                  onRemoveSelector={handleRemoveSelector}
                  onClearSelectors={handleClearSelectors}
                  onTypeChange={handleSelectorTypeChange}
                  onNameChange={handleSelectorNameChange}
                  onAttributeChange={handleSelectorAttributeChange}
                />
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

      {/* Batch URL Dialog would go here */}
      {/* URL Discovery Dialog would go here */}
    </div>
  );
};

export default MainScrapingStudio;
