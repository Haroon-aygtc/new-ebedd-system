import { useState, useCallback } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export interface SelectedElement {
  id: string;
  selector: string;
  type: string;
  name?: string;
  attribute?: string;
  aiGenerated?: boolean;
}

export interface ScrapingConfig {
  waitForSelector?: string;
  maxPages?: number;
  delay?: number;
  followLinks?: boolean;
  linkSelector?: string;
  maxDepth?: number;
  javascript?: boolean;
  proxy?: string;
  userAgent?: string;
  extractionMode?: "raw" | "cleaned" | "semantic";
}

export interface ScrapedItem {
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

export const useScraper = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<SelectedElement[]>(
    [],
  );
  const [scrapingConfig, setScrapingConfig] = useState<ScrapingConfig>({
    maxPages: 1,
    delay: 1000,
    followLinks: false,
    maxDepth: 1,
    javascript: true,
    extractionMode: "cleaned",
  });
  const [scrapedData, setScrapedData] = useState<ScrapedItem[]>([]);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [isScrapingActive, setIsScrapingActive] = useState(false);

  // Load URL and get its content
  const loadUrl = useCallback(
    async (urlToLoad: string) => {
      if (!urlToLoad) return;

      try {
        setIsLoading(true);
        setError(null);
        setPageContent("");

        // Add http:// prefix if missing
        let processedUrl = urlToLoad;
        if (!/^https?:\/\//i.test(processedUrl)) {
          processedUrl = `https://${processedUrl}`;
        }

        // Call the proxy service to load the URL
        const response = await axios.post(`${API_BASE_URL}/scrape/preview`, {
          url: processedUrl,
          options: {
            javascript: scrapingConfig.javascript,
            timeout: 30000,
          },
        });

        if (response.data && response.data.success) {
          setUrl(processedUrl);
          setPageContent(response.data.contents);
          return response.data.contents;
        } else {
          throw new Error(response.data?.message || "Failed to load URL");
        }
      } catch (error) {
        console.error("Error loading URL:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred",
        );
        toast({
          title: "Error loading URL",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [scrapingConfig.javascript, toast],
  );

  // Add a selected element
  const addSelectedElement = useCallback((element: SelectedElement) => {
    setSelectedElements((prev) => [...prev, element]);
  }, []);

  // Remove a selected element
  const removeSelectedElement = useCallback((id: string) => {
    setSelectedElements((prev) => prev.filter((el) => el.id !== id));
  }, []);

  // Clear all selected elements
  const clearSelectedElements = useCallback(() => {
    setSelectedElements([]);
  }, []);

  // Update a selected element
  const updateSelectedElement = useCallback(
    (id: string, updates: Partial<SelectedElement>) => {
      setSelectedElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      );
    },
    [],
  );

  // Start scraping process
  const startScraping = useCallback(
    async (urlsToScrape: string[] = []) => {
      if (selectedElements.length === 0) {
        toast({
          title: "No elements selected",
          description: "Please select at least one element to scrape",
          variant: "destructive",
        });
        return;
      }

      setIsScrapingActive(true);
      setScrapingProgress(0);
      setScrapedData([]);
      setError(null);

      try {
        const urls = urlsToScrape.length > 0 ? urlsToScrape : [url];
        const results: ScrapedItem[] = [];
        let processedCount = 0;

        for (let i = 0; i < urls.length; i++) {
          if (!isScrapingActive) break; // Check if scraping was stopped

          const currentUrl = urls[i];
          setScrapingProgress((processedCount / urls.length) * 100);

          try {
            // Call the API to scrape the page
            const response = await axios.post(
              `${API_BASE_URL}/scrape/extract`,
              {
                url: currentUrl,
                selectors: selectedElements.map((el) => ({
                  selector: el.selector,
                  type: el.type,
                  name: el.name || el.selector,
                  attribute: el.type === "attribute" ? el.attribute : undefined,
                })),
                options: {
                  waitForSelector:
                    scrapingConfig.waitForSelector ||
                    selectedElements[0]?.selector,
                  javascript: scrapingConfig.javascript,
                  pagination: scrapingConfig.maxPages > 1,
                  maxPages: scrapingConfig.maxPages,
                  delay: scrapingConfig.delay / 1000, // Convert to seconds
                  extractionMode: scrapingConfig.extractionMode,
                  proxy: scrapingConfig.proxy,
                  userAgent: scrapingConfig.userAgent,
                },
              },
            );

            if (response.data && response.data.success) {
              results.push({
                url: currentUrl,
                data: response.data.data || [],
                timestamp: new Date().toISOString(),
              });
            } else {
              throw new Error(
                response.data?.message || `Failed to scrape ${currentUrl}`,
              );
            }
          } catch (error) {
            console.error(`Error scraping ${currentUrl}:`, error);
            results.push({
              url: currentUrl,
              data: [],
              timestamp: new Date().toISOString(),
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }

          processedCount++;
          setScrapingProgress((processedCount / urls.length) * 100);

          // Add a delay between requests
          if (i < urls.length - 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, scrapingConfig.delay),
            );
          }
        }

        setScrapedData(results);
        setScrapingProgress(100);

        toast({
          title: "Scraping completed",
          description: `Successfully scraped ${results.length} URLs`,
          variant: "default",
        });

        return results;
      } catch (error) {
        console.error("Error during scraping:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        toast({
          title: "Scraping failed",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsScrapingActive(false);
      }
    },
    [url, selectedElements, scrapingConfig, toast],
  );

  // Stop scraping process
  const stopScraping = useCallback(() => {
    setIsScrapingActive(false);
    toast({
      title: "Scraping stopped",
      description: "The scraping process has been stopped",
      variant: "default",
    });
  }, [toast]);

  // Export scraped data
  const exportData = useCallback(
    (format: "json" | "csv" = "json") => {
      if (scrapedData.length === 0) {
        toast({
          title: "No data to export",
          description: "Please scrape some data first",
          variant: "destructive",
        });
        return;
      }

      try {
        if (format === "json") {
          const json = JSON.stringify(scrapedData, null, 2);
          const blob = new Blob([json], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `scraping-results-${new Date().toISOString()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else if (format === "csv") {
          // Convert to CSV
          let csv = "URL,Field Name,Field Type,Value\n";

          scrapedData.forEach((item) => {
            if (item.error) {
              csv += `${item.url},"Error: ${item.error.replace(/"/g, '""')}","error",""\n`;
            } else {
              item.data.forEach((field) => {
                const value = Array.isArray(field.value)
                  ? field.value.join(" | ").replace(/"/g, '""')
                  : String(field.value).replace(/"/g, '""');

                csv += `${item.url},"${field.name}","${field.type}","${value}"\n`;
              });
            }
          });

          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `scraping-results-${new Date().toISOString()}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }

        toast({
          title: "Export successful",
          description: `Data has been exported as ${format.toUpperCase()}`,
          variant: "default",
        });
      } catch (error) {
        console.error("Error exporting data:", error);
        toast({
          title: "Export failed",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
      }
    },
    [scrapedData, toast],
  );

  // Discover URLs from a starting point
  const discoverUrls = useCallback(
    async (startUrl: string, options: any = {}) => {
      try {
        setIsLoading(true);
        setError(null);

        // Add http:// prefix if missing
        let processedUrl = startUrl;
        if (!/^https?:\/\//i.test(processedUrl)) {
          processedUrl = `https://${processedUrl}`;
        }

        const response = await axios.post(`${API_BASE_URL}/scrape/discover`, {
          url: processedUrl,
          options: {
            maxDepth: options.maxDepth || 1,
            maxUrls: options.maxUrls || 20,
            sameDomain: options.sameDomain !== false,
            urlPattern: options.urlPattern || undefined,
            javascript: options.javascript || false,
          },
        });

        if (response.data && response.data.success) {
          return response.data.data || [];
        } else {
          throw new Error(response.data?.message || "Failed to discover URLs");
        }
      } catch (error) {
        console.error("Error discovering URLs:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        toast({
          title: "URL discovery failed",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  // Save configuration
  const saveConfig = useCallback(
    (name: string) => {
      try {
        const config = {
          name,
          url,
          elements: selectedElements,
          config: scrapingConfig,
          timestamp: new Date().toISOString(),
        };

        // Save to localStorage
        const savedConfigs = JSON.parse(
          localStorage.getItem("scraping-configs") || "[]",
        );
        const updatedConfigs = [
          ...savedConfigs.filter((c: any) => c.name !== name),
          config,
        ];
        localStorage.setItem(
          "scraping-configs",
          JSON.stringify(updatedConfigs),
        );

        toast({
          title: "Configuration saved",
          description: `Scraping configuration "${name}" has been saved`,
          variant: "default",
        });

        return true;
      } catch (error) {
        console.error("Error saving configuration:", error);
        toast({
          title: "Save failed",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
        return false;
      }
    },
    [url, selectedElements, scrapingConfig, toast],
  );

  // Load configuration
  const loadConfig = useCallback(
    (name?: string) => {
      try {
        const savedConfigs = JSON.parse(
          localStorage.getItem("scraping-configs") || "[]",
        );

        let config;
        if (name) {
          config = savedConfigs.find((c: any) => c.name === name);
        } else if (savedConfigs.length > 0) {
          // Load the most recent config if no name provided
          config = savedConfigs[savedConfigs.length - 1];
        }

        if (config) {
          setUrl(config.url || "");
          setSelectedElements(config.elements || []);
          setScrapingConfig(config.config || {});

          toast({
            title: "Configuration loaded",
            description: `Loaded scraping configuration "${config.name}"`,
            variant: "default",
          });

          return true;
        } else {
          throw new Error("No configuration found");
        }
      } catch (error) {
        console.error("Error loading configuration:", error);
        toast({
          title: "Load failed",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
        return false;
      }
    },
    [toast],
  );

  // Get saved configurations
  const getSavedConfigs = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem("scraping-configs") || "[]");
    } catch (error) {
      console.error("Error getting saved configurations:", error);
      return [];
    }
  }, []);

  return {
    // State
    url,
    setUrl,
    pageContent,
    isLoading,
    error,
    selectedElements,
    scrapingConfig,
    setScrapingConfig,
    scrapedData,
    scrapingProgress,
    isScrapingActive,

    // Functions
    loadUrl,
    addSelectedElement,
    removeSelectedElement,
    clearSelectedElements,
    updateSelectedElement,
    startScraping,
    stopScraping,
    exportData,
    discoverUrls,
    saveConfig,
    loadConfig,
    getSavedConfigs,
  };
};
