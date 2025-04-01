import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Check,
  Code,
  Download,
  Eye,
  Layers,
  Link,
  Play,
  Settings,
  StopCircle,
  Target,
  X,
  Plus,
  RefreshCw,
} from "lucide-react";

interface ScrapingStudioProps {
  onExport?: (data: any) => void;
}

const ScrapingStudio: React.FC<ScrapingStudioProps> = ({
  onExport = () => {},
}) => {
  const [url, setUrl] = useState<string>("https://example.com");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [scrapedData, setScrapedData] = useState<any[]>([]);
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [hoveredElement, setHoveredElement] = useState<string>("");
  const [aiSuggestions, setAiSuggestions] = useState<
    Array<{ selector: string; type: string; description: string }>
  >([]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Real selected elements
  const [selectedElements, setSelectedElements] = useState<
    Array<{ id: string; selector: string; type: string; name?: string }>
  >([]);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setScrapedData([]);
    setProgress(0);

    try {
      // Use a proxy service to load the URL to avoid CORS issues
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();

      if (data.contents) {
        // Load the HTML content into the iframe
        const iframe = iframeRef.current;
        if (iframe) {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(data.contents);
            iframeDoc.close();

            // Setup the iframe for element selection
            setupIframeForSelection(iframeDoc);

            // Request AI suggestions for elements to scrape
            if (
              document
                .getElementById("ai-selector")
                ?.getAttribute("aria-checked") === "true"
            ) {
              getAiSuggestions(data.contents);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading URL:", error);
      alert("Failed to load URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Setup iframe for element selection
  const setupIframeForSelection = (iframeDoc: Document) => {
    // Add styles to highlight elements on hover
    const style = iframeDoc.createElement("style");
    style.textContent = `
      .tempo-hovered {
        outline: 2px solid #3b82f6 !important;
        background-color: rgba(59, 130, 246, 0.1) !important;
      }
      .tempo-selected {
        outline: 2px solid #10b981 !important;
        background-color: rgba(16, 185, 129, 0.1) !important;
      }
    `;
    iframeDoc.head.appendChild(style);
  };

  // Get AI suggestions for elements to scrape
  const getAiSuggestions = async (htmlContent: string) => {
    setIsAiLoading(true);
    try {
      // In a real implementation, this would call an AI service
      // For now, we'll simulate AI suggestions based on common selectors
      setTimeout(() => {
        const suggestions = [
          {
            selector: ".product-title, h1, .title, .name",
            type: "text",
            description: "Product title or main heading",
          },
          {
            selector: ".price, .product-price, [data-price]",
            type: "text",
            description: "Price information",
          },
          {
            selector: ".product-image, img[src*='product'], .main-image",
            type: "image",
            description: "Product image",
          },
          {
            selector: ".description, .product-description, [data-description]",
            type: "text",
            description: "Product description",
          },
          {
            selector: ".rating, .stars, [data-rating]",
            type: "text",
            description: "Product rating",
          },
        ];
        setAiSuggestions(suggestions);
        setIsAiLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      setIsAiLoading(false);
    }
  };

  const handleStartScraping = async () => {
    if (selectedElements.length === 0) {
      alert("Please select at least one element to scrape");
      return;
    }

    setIsScraping(true);
    setProgress(0);
    setScrapedData([]);

    try {
      const iframe = iframeRef.current;
      if (!iframe) throw new Error("Preview not loaded");

      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Cannot access iframe content");

      // Extract data based on selected elements
      const extractedItems: any[] = [];

      // Get all potential item containers (for list pages)
      const containers = iframeDoc.querySelectorAll(
        ".item, .product, .card, li, article",
      );
      const useContainers = containers.length > 1;

      if (useContainers) {
        // Process each container as an item
        let processedCount = 0;
        const totalContainers = containers.length;

        for (const container of containers) {
          const item: Record<string, any> = {};

          for (const element of selectedElements) {
            try {
              const elements = container.querySelectorAll(element.selector);
              if (elements.length > 0) {
                if (element.type === "text") {
                  item[element.name || element.selector] =
                    elements[0].textContent?.trim();
                } else if (element.type === "image") {
                  const imgSrc = elements[0].getAttribute("src");
                  item[element.name || element.selector] = imgSrc;
                } else if (element.type === "link") {
                  const href = elements[0].getAttribute("href");
                  item[element.name || element.selector] = href;
                }
              }
            } catch (error) {
              console.error(`Error extracting ${element.selector}:`, error);
            }
          }

          if (Object.keys(item).length > 0) {
            extractedItems.push(item);
          }

          processedCount++;
          setProgress(Math.floor((processedCount / totalContainers) * 100));

          // Add a small delay to show progress
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } else {
        // Process the whole page
        const item: Record<string, any> = {};

        let processedCount = 0;
        const totalElements = selectedElements.length;

        for (const element of selectedElements) {
          try {
            const elements = iframeDoc.querySelectorAll(element.selector);

            if (elements.length > 0) {
              if (element.type === "text") {
                item[element.name || element.selector] =
                  elements[0].textContent?.trim();
              } else if (element.type === "image") {
                const imgSrc = elements[0].getAttribute("src");
                item[element.name || element.selector] = imgSrc;
              } else if (element.type === "link") {
                const href = elements[0].getAttribute("href");
                item[element.name || element.selector] = href;
              }
            }
          } catch (error) {
            console.error(`Error extracting ${element.selector}:`, error);
          }

          processedCount++;
          setProgress(Math.floor((processedCount / totalElements) * 100));

          // Add a small delay to show progress
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        if (Object.keys(item).length > 0) {
          extractedItems.push(item);
        }
      }

      setScrapedData(extractedItems);
      setProgress(100);
    } catch (error) {
      console.error("Error during scraping:", error);
      alert("An error occurred during scraping. Please try again.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleStopScraping = () => {
    setIsScraping(false);
  };

  const handleExport = () => {
    // Real data for export
    const exportData = {
      url,
      timestamp: new Date().toISOString(),
      elements: selectedElements,
      data: scrapedData.length > 0 ? scrapedData : [],
    };

    onExport(exportData);
  };

  const handleRemoveElement = (id: string) => {
    setSelectedElements((prev) => prev.filter((element) => element.id !== id));

    // Remove highlight from the element in the iframe
    const iframe = iframeRef.current;
    if (iframe) {
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        const selectedElement = selectedElements.find((el) => el.id === id);
        if (selectedElement) {
          const elements = iframeDoc.querySelectorAll(selectedElement.selector);
          elements.forEach((el) => {
            el.classList.remove("tempo-selected");
          });
        }
      }
    }
  };

  // Toggle element selection mode
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setActiveTab("preview"); // Switch to preview tab for selection
  };

  // Handle element selection in the iframe
  const handleElementSelection = (
    selector: string,
    type: string = "text",
    name?: string,
  ) => {
    const newElement = {
      id: Date.now().toString(),
      selector,
      type,
      name,
    };

    setSelectedElements((prev) => [...prev, newElement]);

    // Highlight the selected element in the iframe
    const iframe = iframeRef.current;
    if (iframe) {
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        const elements = iframeDoc.querySelectorAll(selector);
        elements.forEach((el) => {
          el.classList.add("tempo-selected");
        });
      }
    }
  };

  // Add event listeners to the iframe when it loads
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // Add click event listener for element selection
      const handleIframeClick = (e: MouseEvent) => {
        if (!isSelectMode) return;

        e.preventDefault();
        e.stopPropagation();

        const target = e.target as HTMLElement;
        if (!target) return;

        // Generate a CSS selector for the clicked element
        let selector = "";

        // Try to use ID if available
        if (target.id) {
          selector = `#${target.id}`;
        }
        // Try to use class if available
        else if (target.className && typeof target.className === "string") {
          const classes = target.className
            .split(" ")
            .filter((c) => c && !c.includes("tempo-"));
          if (classes.length > 0) {
            selector = `.${classes[0]}`;
          }
        }
        // Fallback to tag name with nth-child
        else {
          const tagName = target.tagName.toLowerCase();
          let index = 1;
          let sibling = target.previousElementSibling;

          while (sibling) {
            if (sibling.tagName.toLowerCase() === tagName) {
              index++;
            }
            sibling = sibling.previousElementSibling;
          }

          selector = `${tagName}:nth-child(${index})`;
        }

        // Determine the type based on the element
        let type = "text";
        if (target.tagName.toLowerCase() === "img") {
          type = "image";
        } else if (target.tagName.toLowerCase() === "a") {
          type = "link";
        }

        // Add the element to selected elements
        handleElementSelection(selector, type);
      };

      // Add mouseover event listener for element highlighting
      const handleIframeMouseover = (e: MouseEvent) => {
        if (!isSelectMode) return;

        const target = e.target as HTMLElement;
        if (!target) return;

        // Remove previous hover highlight
        const previousHovered = iframeDoc.querySelectorAll(".tempo-hovered");
        previousHovered.forEach((el) => el.classList.remove("tempo-hovered"));

        // Add hover highlight
        target.classList.add("tempo-hovered");

        // Generate selector for display
        let selector = "";
        if (target.id) {
          selector = `#${target.id}`;
        } else if (target.className && typeof target.className === "string") {
          const classes = target.className
            .split(" ")
            .filter((c) => c && !c.includes("tempo-"));
          if (classes.length > 0) {
            selector = `.${classes[0]}`;
          }
        } else {
          selector = target.tagName.toLowerCase();
        }

        setHoveredElement(selector);
      };

      // Add mouseout event listener to clear highlighting
      const handleIframeMouseout = () => {
        const hovered = iframeDoc.querySelectorAll(".tempo-hovered");
        hovered.forEach((el) => el.classList.remove("tempo-hovered"));
        setHoveredElement("");
      };

      iframeDoc.addEventListener("click", handleIframeClick);
      iframeDoc.addEventListener("mouseover", handleIframeMouseover);
      iframeDoc.addEventListener("mouseout", handleIframeMouseout);

      return () => {
        iframeDoc.removeEventListener("click", handleIframeClick);
        iframeDoc.removeEventListener("mouseover", handleIframeMouseover);
        iframeDoc.removeEventListener("mouseout", handleIframeMouseout);
      };
    };

    iframe.addEventListener("load", handleIframeLoad);

    return () => {
      iframe.removeEventListener("load", handleIframeLoad);
    };
  }, [isSelectMode]);

  return (
    <div className="bg-background w-full h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Scraping Studio</CardTitle>
              <CardDescription>
                Configure and visualize your web scraping process
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isScraping ? (
                <Button variant="destructive" onClick={handleStopScraping}>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop Scraping
                </Button>
              ) : (
                <Button
                  onClick={handleStartScraping}
                  disabled={isLoading || selectedElements.length === 0}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Scraping
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Export Scraped Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      Choose a format to export your scraped data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <Button
                      variant="outline"
                      className="flex flex-col items-center justify-center h-24 p-4"
                    >
                      <span className="text-lg font-bold">JSON</span>
                      <span className="text-xs text-muted-foreground">
                        Structured data format
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col items-center justify-center h-24 p-4"
                    >
                      <span className="text-lg font-bold">CSV</span>
                      <span className="text-xs text-muted-foreground">
                        Spreadsheet compatible
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col items-center justify-center h-24 p-4"
                    >
                      <span className="text-lg font-bold">Database</span>
                      <span className="text-xs text-muted-foreground">
                        Save to project database
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col items-center justify-center h-24 p-4"
                    >
                      <span className="text-lg font-bold">Vector DB</span>
                      <span className="text-xs text-muted-foreground">
                        For AI training
                      </span>
                    </Button>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleExport}>
                      Export
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <form
            onSubmit={handleUrlSubmit}
            className="flex w-full items-center space-x-2"
          >
            <Input
              type="url"
              placeholder="Enter URL to scrape"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              disabled={isScraping}
            />
            <Button type="submit" disabled={!url || isLoading || isScraping}>
              {isLoading ? "Loading..." : "Load URL"}
            </Button>
          </form>
          {isScraping && (
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Scraping Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="h-full flex flex-col md:flex-row">
            {/* Left panel - Browser preview and selector tools */}
            <div className="flex-1 border-r overflow-hidden">
              <Tabs
                defaultValue="preview"
                value={activeTab}
                onValueChange={setActiveTab}
                className="h-full flex flex-col"
              >
                <div className="px-4 pt-2">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="preview">Browser Preview</TabsTrigger>
                    <TabsTrigger value="selector">Element Selector</TabsTrigger>
                    <TabsTrigger value="code">Code View</TabsTrigger>
                  </TabsList>
                </div>
                <div className="flex-1 overflow-hidden">
                  <TabsContent
                    value="preview"
                    className="h-full m-0 p-0 data-[state=active]:flex flex-col"
                  >
                    {isLoading ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">
                            Loading preview...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <iframe
                          ref={iframeRef}
                          src="about:blank"
                          title="Browser Preview"
                          className="w-full h-full border-0"
                          sandbox="allow-same-origin allow-scripts"
                        />
                        {isSelectMode && (
                          <div className="absolute top-2 left-2 right-2 bg-background/90 p-2 rounded-md border shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium">
                                Selection Mode: Active
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={toggleSelectMode}
                              >
                                <X className="h-4 w-4 mr-1" /> Exit
                              </Button>
                            </div>
                            {hoveredElement && (
                              <div className="mt-1 text-xs font-mono bg-muted p-1 rounded">
                                Hovering: {hoveredElement}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent
                    value="selector"
                    className="h-full m-0 p-4 data-[state=active]:flex flex-col"
                  >
                    <div className="bg-muted p-4 rounded-md mb-4">
                      <h3 className="font-medium mb-2">
                        Element Selection Tool
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Click on elements in the preview to select them for
                        scraping.
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={isSelectMode ? "default" : "outline"}
                          size="sm"
                          onClick={toggleSelectMode}
                        >
                          <Target className="mr-2 h-4 w-4" />
                          {isSelectMode ? "Selection Active" : "Select Element"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveTab("preview");
                            // Find similar elements based on tag name of selected elements
                            const iframe = iframeRef.current;
                            if (iframe && selectedElements.length > 0) {
                              const iframeDoc =
                                iframe.contentDocument ||
                                iframe.contentWindow?.document;
                              if (iframeDoc) {
                                const lastSelector =
                                  selectedElements[selectedElements.length - 1]
                                    .selector;
                                const element =
                                  iframeDoc.querySelector(lastSelector);
                                if (element) {
                                  const tagName = element.tagName.toLowerCase();
                                  const similarSelector = tagName;
                                  handleElementSelection(
                                    similarSelector,
                                    "text",
                                    `${tagName}_content`,
                                  );
                                }
                              }
                            }
                          }}
                          disabled={selectedElements.length === 0}
                        >
                          <Layers className="mr-2 h-4 w-4" />
                          Select Similar
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto border rounded-md p-2">
                      {isAiLoading ? (
                        <div className="p-4 bg-muted/50 rounded-md flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-muted-foreground">
                              AI is analyzing the page structure...
                            </p>
                          </div>
                        </div>
                      ) : aiSuggestions.length > 0 ? (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium mb-2">
                            AI Suggested Elements
                          </h4>
                          {aiSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="border rounded-md p-2 hover:bg-accent/50 cursor-pointer"
                              onClick={() => {
                                handleElementSelection(
                                  suggestion.selector,
                                  suggestion.type,
                                  suggestion.description
                                    .toLowerCase()
                                    .replace(/\s+/g, "_"),
                                );
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <Badge className="mb-1">
                                    {suggestion.type}
                                  </Badge>
                                  <p className="text-sm">
                                    {suggestion.description}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-xs font-mono mt-1 text-muted-foreground truncate">
                                {suggestion.selector}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-muted/50 rounded-md flex items-center justify-center h-full">
                          <p className="text-muted-foreground text-center">
                            Switch to the Browser Preview tab and click on
                            elements to select them
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent
                    value="code"
                    className="h-full m-0 p-4 data-[state=active]:flex flex-col"
                  >
                    <div className="flex-1 overflow-auto bg-muted rounded-md p-4 font-mono text-sm">
                      <pre className="whitespace-pre-wrap">
                        {`// Scraping configuration
const config = {
  url: "${url}",
  selectors: [
${selectedElements.map((el) => `    { selector: "${el.selector}", type: "${el.type}" }`).join(",\n")}
  ],
  options: {
    waitForSelector: ".main-content",
    timeout: 30000,
    proxy: "auto"
  }
};

// Execute scraping
async function scrape(config) {
  // Implementation details...
}`}
                      </pre>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Right panel - Configuration and results */}
            <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 overflow-hidden flex flex-col">
              <Tabs defaultValue="elements" className="h-full flex flex-col">
                <div className="px-4 pt-2">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="elements">Elements</TabsTrigger>
                    <TabsTrigger value="config">Config</TabsTrigger>
                    <TabsTrigger value="results">Results</TabsTrigger>
                  </TabsList>
                </div>
                <div className="flex-1 overflow-hidden">
                  <TabsContent
                    value="elements"
                    className="h-full m-0 p-4 data-[state=active]:flex flex-col"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Selected Elements</h3>
                      <Badge variant="outline">{selectedElements.length}</Badge>
                    </div>
                    <ScrollArea className="flex-1">
                      {selectedElements.length > 0 ? (
                        <div className="space-y-2">
                          {selectedElements.map((element) => (
                            <div
                              key={element.id}
                              className="flex items-center justify-between p-2 border rounded-md"
                            >
                              <div className="flex-1 overflow-hidden">
                                <div className="flex items-center">
                                  <Badge className="mr-2">{element.type}</Badge>
                                  <span className="text-sm font-mono truncate">
                                    {element.selector}
                                  </span>
                                </div>
                              </div>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveElement(element.id)
                                      }
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Remove element</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center p-4">
                            <p className="text-muted-foreground mb-2">
                              No elements selected
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Use the Element Selector to pick items to scrape
                            </p>
                          </div>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent
                    value="config"
                    className="h-full m-0 p-4 data-[state=active]:flex flex-col overflow-auto"
                  >
                    <ScrollArea className="h-full pr-4">
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium mb-2">Output Format</h3>
                          <Select defaultValue="json">
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="xml">XML</SelectItem>
                              <SelectItem value="vector">
                                Vector Embeddings
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Scraping Options</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="wait-for-js">
                                Wait for JavaScript
                              </Label>
                              <Switch id="wait-for-js" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="follow-pagination">
                                Auto-Pagination
                              </Label>
                              <Switch id="follow-pagination" />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="stealth-mode">Stealth Mode</Label>
                              <Switch id="stealth-mode" defaultChecked />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Label htmlFor="request-delay">
                                  Request Delay
                                </Label>
                                <span className="text-sm text-muted-foreground">
                                  2s
                                </span>
                              </div>
                              <Slider
                                defaultValue={[2]}
                                max={10}
                                step={0.5}
                                id="request-delay"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">AI Assistance</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="ai-selector">
                                AI Element Selection
                              </Label>
                              <Switch id="ai-selector" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="ai-clean">AI Data Cleaning</Label>
                              <Switch id="ai-clean" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="ai-structure">
                                AI Structure Detection
                              </Label>
                              <Switch id="ai-structure" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">
                            Advanced Settings
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="timeout" className="mb-2 block">
                                Request Timeout (ms)
                              </Label>
                              <Input
                                id="timeout"
                                type="number"
                                defaultValue="30000"
                              />
                            </div>
                            <div>
                              <Label htmlFor="proxy" className="mb-2 block">
                                Proxy Configuration
                              </Label>
                              <Select defaultValue="auto">
                                <SelectTrigger id="proxy">
                                  <SelectValue placeholder="Select proxy mode" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No Proxy</SelectItem>
                                  <SelectItem value="auto">
                                    Auto-Rotate
                                  </SelectItem>
                                  <SelectItem value="custom">
                                    Custom Proxy
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent
                    value="results"
                    className="h-full m-0 p-4 data-[state=active]:flex flex-col"
                  >
                    {progress === 100 && scrapedData.length > 0 ? (
                      <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium">Scraped Data</h3>
                          <Badge
                            variant="outline"
                            className="flex items-center"
                          >
                            <Check className="mr-1 h-3 w-3" />{" "}
                            {scrapedData.length} items
                          </Badge>
                        </div>
                        <ScrollArea className="flex-1">
                          <div className="space-y-4">
                            {scrapedData.map((item, index) => (
                              <div
                                key={index}
                                className="border rounded-md p-3"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium">
                                    Item {index + 1}
                                  </h4>
                                  <Badge>
                                    Item {index + 1}/{scrapedData.length}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {Object.entries(item).map(([key, value]) => {
                                    // Handle different types of data
                                    if (
                                      (typeof value === "string" &&
                                        value.match(/\.(jpeg|jpg|gif|png)$/)) ||
                                      key.includes("image")
                                    ) {
                                      return (
                                        <div
                                          key={key}
                                          className="col-span-2 mt-2"
                                        >
                                          <p className="text-sm text-muted-foreground">
                                            {key}
                                          </p>
                                          <img
                                            src={value as string}
                                            alt={key}
                                            className="h-20 w-20 object-cover rounded-md mt-1"
                                          />
                                        </div>
                                      );
                                    } else {
                                      return (
                                        <div key={key}>
                                          <p className="text-sm text-muted-foreground">
                                            {key}
                                          </p>
                                          <p className="text-sm">
                                            {value as string}
                                          </p>
                                        </div>
                                      );
                                    }
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center p-4">
                          <p className="text-muted-foreground mb-2">
                            No results yet
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Start scraping to see results here
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t py-3">
          <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2">
                <Link className="mr-1 h-3 w-3" />
                {url}
              </Badge>
              {selectedElements.length > 0 && (
                <Badge variant="outline">
                  <Code className="mr-1 h-3 w-3" />
                  {selectedElements.length} elements
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ScrapingStudio;
