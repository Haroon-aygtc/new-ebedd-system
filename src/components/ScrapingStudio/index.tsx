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
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Check,
  Code,
  Compass,
  Database,
  Download,
  Eye,
  Layers,
  Link,
  List,
  Play,
  Plus,
  RefreshCw,
  Save,
  Settings,
  StopCircle,
  Target,
  X,
} from "lucide-react";
import { scrapeUrl, getScrapingTemplates } from "@/api/services/scrapeService";
import BatchUrlInput from "./BatchUrlInput";
import UrlDiscoveryTool from "./UrlDiscoveryTool";
import SelectorGroupManager from "./SelectorGroupManager";
import ExportDialog from "./ExportDialog";
import { callAiForSelectors } from "@/api/services/aiSelectorService";

interface ScrapingStudioProps {
  onExport?: (data: any) => void;
}

interface SelectorGroup {
  id: string;
  name: string;
  description?: string;
  selectors: Array<{ id: string; selector: string; type: string; name?: string }>;
}

const ScrapingStudio: React.FC<ScrapingStudioProps> = ({
  onExport = () => {},
}) => {
  // Basic state
  const [url, setUrl] = useState<string>("https://example.com");
  const [urls, setUrls] = useState<string[]>([]);
  const [currentUrlIndex, setCurrentUrlIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [scrapedData, setScrapedData] = useState<any[]>([]);
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [hoveredElement, setHoveredElement] = useState<string>("");
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ selector: string; type: string; description: string }>>([]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Selected elements
  const [selectedElements, setSelectedElements] = useState<
    Array<{ id: string; selector: string; type: string; name?: string }>
  >([]);
  
  // Selector groups
  const [selectorGroups, setSelectorGroups] = useState<SelectorGroup[]>([]);
  
  // Dialog states
  const [showBatchUrlDialog, setShowBatchUrlDialog] = useState<boolean>(false);
  const [showUrlDiscoveryDialog, setShowUrlDiscoveryDialog] = useState<boolean>(false);
  const [showSelectorGroupDialog, setShowSelectorGroupDialog] = useState<boolean>(false);
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);
  
  // Scraping options
  const [scrapingOptions, setScrapingOptions] = useState({
    waitForJs: true,
    followPagination: false,
    stealthMode: true,
    requestDelay: 2,
    timeout: 30000,
    proxy: "auto",
    outputFormat: "json",
    aiSelector: true,
    aiClean: true,
    aiStructure: false,
    extractionMode: "cleaned",
  });

  // Load templates
  const [templates, setTemplates] = useState<any[]>([]);
  
  useEffect(() => {
    // Load templates
    setTemplates(getScrapingTemplates());
    
    // Load saved selector groups from localStorage
    const savedGroups = localStorage.getItem('selectorGroups');
    if (savedGroups) {
      try {
        setSelectorGroups(JSON.parse(savedGroups));
      } catch (e) {
        console.error('Error loading saved selector groups:', e);
      }
    }
  }, []);
  
  // Save selector groups to localStorage when they change
  useEffect(() => {
    localStorage.setItem('selectorGroups', JSON.stringify(selectorGroups));
  }, [selectorGroups]);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadUrl(url);
  };
  
  const loadUrl = async (urlToLoad: string) => {
    setIsLoading(true);
    setScrapedData([]);
    setProgress(0);
    
    try {
      // Use a proxy service to load the URL to avoid CORS issues
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(urlToLoad)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (data.contents) {
        // Load the HTML content into the iframe
        const iframe = iframeRef.current;
        if (iframe) {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(data.contents);
            iframeDoc.close();
            
            // Setup the iframe for element selection
            setupIframeForSelection(iframeDoc);
            
            // Request AI suggestions for elements to scrape
            if (scrapingOptions.aiSelector) {
              getAiSuggestions(data.contents);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading URL:', error);
      alert('Failed to load URL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Setup iframe for element selection
  const setupIframeForSelection = (iframeDoc: Document) => {
    // Add styles to highlight elements on hover
    const style = iframeDoc.createElement('style');
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
      // Call the AI service to analyze the HTML and suggest selectors
      const suggestions = await callAiForSelectors(htmlContent);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      // Fallback to basic suggestions if AI service fails
      const basicSuggestions = [
        {
          selector: ".product-title, h1, .title, .name",
          type: "text",
          description: "Product title or main heading"
        },
        {
          selector: ".price, .product-price, [data-price]",
          type: "text",
          description: "Price information"
        },
        {
          selector: ".product-image, img[src*='product'], .main-image",
          type: "image",
          description: "Product image"
        },
        {
          selector: ".description, .product-description, [data-description]",
          type: "text",
          description: "Product description"
        },
        {
          selector: ".rating, .stars, [data-rating]",
          type: "text",
          description: "Product rating"
        }
      ];
      setAiSuggestions(basicSuggestions);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleStartScraping = async () => {
    if (selectedElements.length === 0) {
      alert('Please select at least one element to scrape');
      return;
    }
    
    setIsScraping(true);
    setProgress(0);
    setScrapedData([]);
    
    try {
      // If we have multiple URLs, scrape them all
      if (urls.length > 0) {
        const allData: any[] = [];
        let processedCount = 0;
        
        for (let i = 0; i < urls.length; i++) {
          setCurrentUrlIndex(i);
          setUrl(urls[i]);
          
          // Load the URL
          await loadUrl(urls[i]);
          
          // Scrape the URL
          const data = await scrapeCurrentPage();
          if (data) {
            allData.push({
              url: urls[i],
              data
            });
          }
          
          processedCount++;
          setProgress(Math.floor((processedCount / urls.length) * 100));
          
          // Add a delay between requests
          if (i < urls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, scrapingOptions.requestDelay * 1000));
          }
        }
        
        setScrapedData(allData);
      } else {
        // Scrape the current page
        const data = await scrapeCurrentPage();
        if (data) {
          setScrapedData([{ url, data }]);
        }
      }
      
      setProgress(100);
    } catch (error) {
      console.error('Error during scraping:', error);
      alert('An error occurred during scraping. Please try again.');
    } finally {
      setIsScraping(false);
    }
  };
  
  const scrapeCurrentPage = async () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe) throw new Error('Preview not loaded');
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error('Cannot access iframe content');
      
      // Extract data based on selected elements
      const extractedItems: any[] = [];
      
      // Get all potential item containers (for list pages)
      const containers = iframeDoc.querySelectorAll('.item, .product, .card, li, article');
      const useContainers = containers.length > 1;
      
      if (useContainers) {
        // Process each container as an item
        for (const container of containers) {
          const item: Record<string, any> = {};
          
          for (const element of selectedElements) {
            try {
              const elements = container.querySelectorAll(element.selector);
              if (elements.length > 0) {
                if (element.type === 'text') {
                  item[element.name || element.selector] = elements[0].textContent?.trim();
                } else if (element.type === 'image') {
                  const imgSrc = elements[0].getAttribute('src');
                  item[element.name || element.selector] = imgSrc;
                } else if (element.type === 'link') {
                  const href = elements[0].getAttribute('href');
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
        }
      } else {
        // Process the whole page
        const item: Record<string, any> = {};
        
        for (const element of selectedElements) {
          try {
            const elements = iframeDoc.querySelectorAll(element.selector);
            
            if (elements.length > 0) {
              if (element.type === 'text') {
                item[element.name || element.selector] = elements[0].textContent?.trim();
              } else if (element.type === 'image') {
                const imgSrc = elements[0].getAttribute('src');
                item[element.name || element.selector] = imgSrc;
              } else if (element.type === 'link') {
                const href = elements[0].getAttribute('href');
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
      }
      
      return extractedItems;
    } catch (error) {
      console.error('Error scraping page:', error);
      throw error;
    }
  };

  const handleStopScraping = () => {
    setIsScraping(false);
  };

  const handleExport = () => {
    // Show the export dialog
    setShowExportDialog(true);
  };
  
  const handleExportComplete = (data: any, format: string) => {
    // Call the parent's onExport function
    onExport({
      url: urls.length > 0 ? urls : url,
      timestamp: new Date().toISOString(),
      elements: selectedElements,
      data: data,
      format: format
    });
  };

  const handleRemoveElement = (id: string) => {
    setSelectedElements((prev) => prev.filter((element) => element.id !== id));
    
    // Remove highlight from the element in the iframe
    const iframe = iframeRef.current;
    if (iframe) {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        const selectedElement = selectedElements.find(el => el.id === id);
        if (selectedElement) {
          const elements = iframeDoc.querySelectorAll(selectedElement.selector);
          elements.forEach(el => {
            el.classList.remove('tempo-selected');
          });
        }
      }
    }
  };
  
  // Toggle element selection mode
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setActiveTab('preview'); // Switch to preview tab for selection
  };
  
  // Handle element selection in the iframe
  const handleElementSelection = (selector: string, type: string = 'text', name?: string) => {
    const newElement = {
      id: Date.now().toString(),
      selector,
      type,
      name
    };
    
    setSelectedElements(prev => [...prev, newElement]);
    
    // Highlight the selected element in the iframe
    const iframe = iframeRef.current;
    if (iframe) {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        const elements = iframeDoc.querySelectorAll(selector);
        elements.forEach(el => {
          el.classList.add('tempo-selected');
        });
      }
    }
  };
  
  // Handle batch URL input
  const handleBatchUrlSubmit = (batchUrls: string[]) => {
    setUrls(batchUrls);
    setShowBatchUrlDialog(false);
    
    // Load the first URL
    if (batchUrls.length > 0) {
      setUrl(batchUrls[0]);
      setCurrentUrlIndex(0);
      loadUrl(batchUrls[0]);
    }
  };
  
  // Handle URL discovery
  const handleUrlDiscoverySubmit = (discoveredUrls: string[]) => {
    setUrls(discoveredUrls);
    setShowUrlDiscoveryDialog(false);
    
    // Load the first URL
    if (discoveredUrls.length > 0) {
      setUrl(discoveredUrls[0]);
      setCurrentUrlIndex(0);
      loadUrl(discoveredUrls[0]);
    }
  };
  
  // Handle selector group management
  const handleSaveGroup = (group: SelectorGroup) => {
    // Check if the group already exists
    const existingIndex = selectorGroups.findIndex(g => g.id === group.id);
    
    if (existingIndex >= 0) {
      // Update existing group
      setSelectorGroups(prev => [
        ...prev.slice(0, existingIndex),
        group,
        ...prev.slice(existingIndex + 1)
      ]);
    } else {
      // Add new group
      setSelectorGroups(prev => [...prev, group]);
    }
  };
  
  const handleLoadGroup = (selectors: Array<{ id: string; selector: string; type: string; name?: string }>) => {
    setSelectedElements(selectors);
    
    // Highlight the selected elements in the iframe
    const iframe = iframeRef.current;
    if (iframe) {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        // Clear all previous selections
        const selected = iframeDoc.querySelectorAll('.tempo-selected');
        selected.forEach(el => el.classList.remove('tempo-selected'));
        
        // Add new selections
        selectors.forEach(selector => {
          const elements = iframeDoc.querySelectorAll(selector.selector);
          elements.forEach(el => {
            el.classList.add('tempo-selected');
          });
        });
      }
    }
  };
  
  const handleDeleteGroup = (groupId: string) => {
    setSelectorGroups(prev => prev.filter(group => group.id !== groupId));
  };
  
  // Load a template
  const handleLoadTemplate = (templateIndex: number) => {
    const template = templates[templateIndex];
    if (template) {
      // Convert template selectors to our format
      const selectors = template.selectors.map((selector: any) => ({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        selector: selector.selector,
        type: selector.type,
        name: selector.name
      }));
      
      setSelectedElements(selectors);
      
      // Update scraping options
      if (template.options) {
        setScrapingOptions(prev => ({
          ...prev,
          waitForJs: template.options.javascript || prev.waitForJs,
          followPagination: template.options.pagination || prev.followPagination,
          extractionMode: template.options.extractionMode || prev.extractionMode,
        }));
      }
    }
  };
  
  // Add event listeners to the iframe when it loads
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    const handleIframeLoad = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;
      
      // Add click event listener for element selection
      const handleIframeClick = (e: MouseEvent) => {
        if (!isSelectMode) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.target as HTMLElement;
        if (!target) return;
        
        // Generate a CSS selector for the clicked element
        let selector = '';
        
        // Try to use ID if available
        if (target.id) {
          selector = `#${target.id}`;
        } 
        // Try to use class if available
        else if (target.className && typeof target.className === 'string') {
          const classes = target.className.split(' ').filter(c => c && !c.includes('tempo-'));
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
        let type = 'text';
        if (target.tagName.toLowerCase() === 'img') {
          type = 'image';
        } else if (target.tagName.toLowerCase() === 'a') {
          type = 'link';
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
        const previousHovered = iframeDoc.querySelectorAll('.tempo-hovered');
        previousHovered.forEach(el => el.classList.remove('tempo-hovered'));
        
        // Add hover highlight
        target.classList.add('tempo-hovered');
        
        // Generate selector for display
        let selector = '';
        if (target.id) {
          selector = `#${target.id}`;
        } else if (target.className && typeof target.className === 'string') {
          const classes = target.className.split(' ').filter(c => c && !c.includes('tempo-'));
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
        const hovered = iframeDoc.querySelectorAll('.tempo-hovered');
        hovered.forEach(el => el.classList.remove('tempo-hovered'));
        setHoveredElement('');
      };
      
      iframeDoc.addEventListener('click', handleIframeClick);
      iframeDoc.addEventListener('mouseover', handleIframeMouseover);
      iframeDoc.addEventListener('mouseout', handleIframeMouseout);
      
      return () => {
        iframeDoc.removeEventListener('click', handleIframeClick);
        iframeDoc.removeEventListener('mouseover', handleIframeMouseover);
        iframeDoc.removeEventListener('mouseout', handleIframeMouseout);
      };
    };
    
    iframe.addEventListener('load', handleIframeLoad);
    
    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
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
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
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
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBatchUrlDialog(true)}
                disabled={isScraping}
              >
                <List className="mr-2 h-4 w-4" />
                Batch URLs
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUrlDiscoveryDialog(true)}
                disabled={isScraping}
              >
                <Compass className="mr-2 h-4 w-4" />
                Discover URLs
              </Button>
            </div>
          </div>
          
          {urls.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="flex items-center">
                <List className="mr-1 h-3 w-3" />
                {urls.length} URLs in queue
              </Badge>
              {currentUrlIndex > 0 && (
                <Badge variant="outline">
                  URL {currentUrlIndex + 1} of {urls.length}
                </Badge>
              )}
            </div>
          )}
          
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
          <div className="h-