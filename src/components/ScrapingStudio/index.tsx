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
import { scrapeUrl } from "@/api/services/scrapeService";
import BatchUrlInput from "./BatchUrlInput";
import UrlDiscoveryTool from "./UrlDiscoveryTool";
import SelectorGroupManager from "./SelectorGroupManager";
import ExportDialog from "./ExportDialog";
import { callAiForSelectors } from "@/api/services/aiSelectorService";
import { useApi } from "@/hooks/useApi";

// Helper function to get a random user agent
const getRandomUserAgent = () => {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59"
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

interface ScrapingStudioProps {
  onExport?: (data: any) => void;
}

interface SelectorGroup {
  id: string;
  name: string;
  description?: string;
  selectors: Array<{ id: string; selector: string; type: string; name?: string }>;
}

// Define the BrowserDisplayProps interface
interface BrowserDisplayProps {
  url: string;
  height?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const BrowserDisplay = React.forwardRef<HTMLIFrameElement, BrowserDisplayProps>(
  ({ url, height = "100%", onLoad, onError }, ref) => {
    return (
      <iframe
        ref={ref}
        src={url}
        style={{ width: "100%", height }}
        onLoad={onLoad}
        onError={() => onError?.(new Error("Failed to load iframe"))}
        sandbox="allow-scripts allow-same-origin"
      />
    );
  }
);

const ScrapingStudio: React.FC<ScrapingStudioProps> = ({
  onExport = () => { },
}) => {
  // Basic state
  const [url, setUrl] = useState<string>("https://example.com");
  const [urlError, setUrlError] = useState<string>("");
  const [urls, setUrls] = useState<string[]>([]);
  const [currentUrlIndex, setCurrentUrlIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [scrapedData, setScrapedData] = useState<any[]>([]);
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [hoveredElement, setHoveredElement] = useState<string>("");
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ id: string; selector: string; type: string; description: string; confidence: number; aiGenerated: boolean }>>([]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const { data: promptsData, loading, error, fetchData } = useApi();

  // Selected elements
  const [selectedElements, setSelectedElements] = useState<
    Array<{
      id: string;
      selector: string;
      type: string;
      name?: string;
      aiGenerated?: boolean;
      attribute?: any;
      confidence?: number;
      description?: string;
    }>
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
    aiMode: "general",
    aiPageType: "auto-detect",
    aiAutoAdd: true,
    aiClean: true,
    aiStructure: false,
    extractionMode: "cleaned",
  });

  // Load templates
  const [templates, setTemplates] = useState<any[]>([]);

  // Get scraping templates from the backend or use defaults
  const getScrapingTemplates = async () => {
    try {
      // Try to get templates from the backend
      const response = await fetch(`${process.env.VITE_API_BASE_URL || "http://localhost:3001/api"}/scrape/templates`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
    } catch (error) {
      console.warn('Failed to load templates from backend, using defaults');
    }

    // Default templates if backend fails
    return [
      {
        name: "E-commerce Product",
        selectors: [
          { id: "1", selector: 'h1, .product-title, [itemprop="name"]', type: "text", name: "title" },
          { id: "2", selector: '.price, [itemprop="price"]', type: "text", name: "price" },
          { id: "3", selector: '.description, [itemprop="description"]', type: "text", name: "description" },
          { id: "4", selector: '.product-image, [itemprop="image"]', type: "image", name: "image" },
        ],
        options: { waitForSelector: ".product-container", javascript: true }
      },
      {
        name: "News Article",
        selectors: [
          { id: "5", selector: 'h1, .article-title', type: "text", name: "title" },
          { id: "6", selector: '.article-content, .content, article', type: "text", name: "content" },
          { id: "7", selector: '.author, .byline', type: "text", name: "author" },
          { id: "8", selector: '.published-date, time', type: "text", name: "date" },
        ],
        options: { waitForSelector: "article", javascript: true }
      },
      {
        name: "Social Media Profile",
        selectors: [
          { id: "9", selector: '.profile-name, .username', type: "text", name: "username" },
          { id: "10", selector: '.bio, .description, .about', type: "text", name: "bio" },
          { id: "11", selector: '.followers, .follower-count', type: "text", name: "followers" },
          { id: "12", selector: '.avatar, .profile-image', type: "image", name: "profileImage" },
          { id: "13", selector: '.posts, .timeline', type: "list", name: "recentPosts" },
        ],
        options: { javascript: true, waitForSelector: ".profile" }
      },
      {
        name: "Job Listing",
        selectors: [
          { id: "14", selector: '.job-title, h1', type: "text", name: "title" },
          { id: "15", selector: '.company-name, .employer', type: "text", name: "company" },
          { id: "16", selector: '.location, .job-location', type: "text", name: "location" },
          { id: "17", selector: '.salary, .compensation', type: "text", name: "salary" },
          { id: "18", selector: '.job-description, .description', type: "text", name: "description" },
          { id: "19", selector: '.requirements, .qualifications', type: "list", name: "requirements" },
        ],
        options: { javascript: true }
      },
    ];
  };

  useEffect(() => {
    // Load templates
    const loadTemplates = async () => {
      const templates = await getScrapingTemplates();
      setTemplates(templates);
    };
    loadTemplates();

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

    // Reset error state
    setUrlError("");

    // Validate URL
    if (!url.trim()) {
      setUrlError("Please enter a URL");
      return;
    }

    // Add http:// prefix if missing
    let urlToLoad = url.trim();
    if (!/^https?:\/\//i.test(urlToLoad)) {
      urlToLoad = "https://" + urlToLoad;
      setUrl(urlToLoad);
    }

    try {
      // Validate URL format
      new URL(urlToLoad);
      await loadUrl(urlToLoad);
    } catch (error) {
      console.error("Invalid URL format:", error);
      setUrlError("Please enter a valid URL");
      // Focus the input field for correction
      urlInputRef.current?.focus();
    }
  };

  const loadUrl = async (urlToLoad: string) => {
    setIsLoading(true);
    setScrapedData([]);
    setProgress(0);
    setUrlError(""); // Clear any previous errors

    try {
      // Show loading state in iframe
      const iframe = iframeRef.current;
      if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(`
            <html>
              <head>
                <style>
                  body {
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background-color: #f9fafb;
                    color: #374151;
                  }
                  .loading {
                    text-align: center;
                  }
                  .spinner {
                    border: 4px solid rgba(0, 0, 0, 0.1);
                    border-radius: 50%;
                    border-top: 4px solid #3b82f6;
                    width: 40px;
                    height: 40px;
                    margin: 20px auto;
                    animation: spin 1s linear infinite;
                  }
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                </style>
              </head>
              <body>
                <div class="loading">
                  <h2>Loading URL...</h2>
                  <div class="spinner"></div>
                  <p>Fetching content from: ${urlToLoad}</p>
                </div>
              </body>
            </html>
          `);
          iframeDoc.close();
        }
      }

      // Set the URL - BrowserDisplay will handle loading it
      setUrl(urlToLoad);

      // Use our new proxy service to load the URL
      const response = await fetch(`${process.env.VITE_API_BASE_URL || "http://localhost:3001/api"}/proxy/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: urlToLoad,
          options: {
            javascript: scrapingOptions.waitForJs,
            timeout: scrapingOptions.timeout,
            userAgent: getRandomUserAgent()
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to load URL: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data && result.data.content) {
        // Load the HTML content into the iframe
        const iframe = iframeRef.current;
        if (iframe) {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(result.data.content);
            iframeDoc.close();

            // Setup the iframe for element selection
            setupIframeForSelection(iframeDoc);

            // Request AI suggestions for elements to scrape
            if (scrapingOptions.aiSelector) {
              getAiSuggestions(result.data.content);
            }

            // Set up message listener for iframe communication
            window.addEventListener('message', handleIframeMessage);

            return; // Success, exit the function
          }
        }
      } else {
        throw new Error('Invalid response from proxy service');
      }
    } catch (error) {
      console.error('Error loading URL:', error);
      setUrlError(`Failed to load URL: ${error.message}`);

      // Show error in iframe
      const iframe = iframeRef.current;
      if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(`
            <html>
              <head>
                <style>
                  body {
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background-color: #fef2f2;
                    color: #b91c1c;
                  }
                  .error {
                    text-align: center;
                    max-width: 80%;
                    padding: 2rem;
                    background-color: white;
                    border-radius: 0.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                  }
                  .error-icon {
                    color: #ef4444;
                    font-size: 3rem;
                    margin-bottom: 1rem;
                  }
                  .url {
                    word-break: break-all;
                    font-family: monospace;
                    background-color: #f3f4f6;
                    padding: 0.5rem;
                    border-radius: 0.25rem;
                    margin: 1rem 0;
                  }
                  .retry-btn {
                    background-color: #3b82f6;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    margin-top: 1rem;
                  }
                  .retry-btn:hover {
                    background-color: #2563eb;
                  }
                </style>
              </head>
              <body>
                <div class="error">
                  <div class="error-icon">⚠️</div>
                  <h2>Failed to load URL</h2>
                  <p>${error.message}</p>
                  <div class="url">${urlToLoad}</div>
                  <p>Please check the URL and try again.</p>
                  <button class="retry-btn" onclick="window.parent.location.reload()">Retry</button>
                </div>
              </body>
            </html>
          `);
          iframeDoc.close();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle messages from the iframe
  const handleIframeMessage = (event: MessageEvent) => {
    // Check if the message is from our iframe
    if (!event.data || typeof event.data !== 'object') return;

    // Handle link clicks
    if (event.data.type === 'link-click' && event.data.href) {
      console.log('Link clicked in iframe:', event.data.href);
      loadUrl(event.data.href);
    }

    // Handle form submissions
    if (event.data.type === 'form-submit') {
      console.log('Form submitted in iframe:', event.data);
      // You could handle form submissions here if needed
    }
  };

  // Clean up event listener when component unmounts
  useEffect(() => {
    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, []);

  // Setup iframe for element selection
  const setupIframeForSelection = (iframeDoc: Document) => {
    // Add styles to highlight elements on hover
    const style = iframeDoc.createElement('style');
    style.textContent = `
      .tempo-hovered {
        outline: 2px solid #3b82f6!important;
        background-color: rgba(59, 130, 246, 0.1)!important;
      }
      .tempo-selected {
        outline: 2px solid #10b981!important;
        background-color: rgba(16, 185, 129, 0.1)!important;
      }
    `;
    iframeDoc.head.appendChild(style);

    // Add base target to open links in new tab
    const base = iframeDoc.createElement('base');
    base.target = '_blank';
    iframeDoc.head.appendChild(base);

    // Prevent form submissions
    const forms = iframeDoc.querySelectorAll('form');
    forms.forEach(form => {
      form.setAttribute('onsubmit', 'return false;');
    });
  };

  // Get AI suggestions for elements to scrape
  const getAiSuggestions = async (htmlContent: string) => {
    setIsAiLoading(true);
    setAiSuggestions([]);

    try {
      // Call the backend AI service to analyze the HTML and suggest selectors
      const response = await fetch(`${process.env.VITE_API_BASE_URL || "http://localhost:3001/api"}/scrape/suggest-selectors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          html: htmlContent,
          url,
          options: {
            mode: scrapingOptions.aiMode || 'general',
            includeImages: true,
            includeLinks: true,
            maxSuggestions: 10,
            pageType: scrapingOptions.aiPageType || 'auto-detect'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get AI suggestions: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Process and enhance the AI suggestions
        const enhancedSuggestions = result.data.map((selector: any, index: number) => ({
          ...selector,
          id: `ai-${index}`,
          confidence: selector.confidence || (1 - (index * 0.1)),
          aiGenerated: true
        }));

        setAiSuggestions(enhancedSuggestions);

        // If auto-add is enabled, add the top suggestions to selected elements
        if (scrapingOptions.aiAutoAdd && enhancedSuggestions.length > 0) {
          const topSuggestions = enhancedSuggestions
            .filter((s: any) => s.confidence > 0.7)
            .slice(0, 5);

          if (topSuggestions.length > 0) {
            setSelectedElements(prev => {
              // Filter out any duplicates by selector
              const existingSelectors = new Set(prev.map(el => el.selector));
              const newElements = topSuggestions.filter(
                (s: any) => !existingSelectors.has(s.selector)
              ).map((suggestion: any) => ({
                id: suggestion.id || `ai-${Math.random().toString(36).substring(2, 9)}`,
                selector: suggestion.selector,
                type: suggestion.type || 'text',
                name: suggestion.name || suggestion.description || suggestion.selector,
                aiGenerated: true,
                confidence: suggestion.confidence || 0.8,
                description: suggestion.description || ''
              }));

              return [...prev, ...newElements];
            });
          }
        }
      } else {
        setAiSuggestions([]);
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      // If the API call fails, use the callAiForSelectors as a fallback
      try {
        const suggestions = await callAiForSelectors(htmlContent);
        const enhancedSuggestions = suggestions.map((selector: any, index: number) => ({
          ...selector,
          id: `ai-fallback-${index}`,
          confidence: 0.8 - (index * 0.1),
          aiGenerated: true
        }));
        setAiSuggestions(enhancedSuggestions);
      } catch (fallbackError) {
        console.error('Fallback AI suggestion also failed:', fallbackError);
        setAiSuggestions([]);
      }
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
          if (!isScraping) break; // Check if scraping was stopped

          setCurrentUrlIndex(i);
          setUrl(urls[i]);

          try {
            // Update progress to show which URL we're working on
            setProgress(Math.round((processedCount / urls.length) * 100));

            // Load the URL first
            await loadUrl(urls[i]);

            // Then scrape it
            const data = await scrapeCurrentPage();
            if (data) {
              allData.push({
                url: urls[i],
                data: data,
                timestamp: new Date().toISOString()
              });
            }

            processedCount++;
            setProgress(Math.round((processedCount / urls.length) * 100));
          } catch (error) {
            console.error(`Error scraping ${urls[i]}: `, error);
            allData.push({
              url: urls[i],
              error: error.message,
              timestamp: new Date().toISOString()
            });

            processedCount++;
            setProgress(Math.round((processedCount / urls.length) * 100));
          }

          // Add a delay between requests

          if (i < urls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, scrapingOptions.requestDelay * 1000));
          }
        }

        setScrapedData(allData);
      } else {
        // Just scrape the current page
        setProgress(25); // Show progress
        try {
          const data = await scrapeCurrentPage();
          if (data) {
            setScrapedData([{
              url: url,
              data: data,
              timestamp: new Date().toISOString()
            }]);
          }
        } catch (error) {
          console.error('Error scraping current page:', error);
          setScrapedData([{
            url: url,
            error: error.message,
            timestamp: new Date().toISOString()
          }]);
        }
      }

      setProgress(100);
      // Switch to the results tab
      setActiveTab('results');
    } catch (error) {
      console.error('Error during scraping:', error);
      alert(`Scraping failed: ${error.message}`);
    } finally {
      setIsScraping(false);
    }
  };

  const scrapeCurrentPage = async () => {
    try {
      // Show scraping in progress in the UI
      const progressIndicator = document.getElementById('scraping-progress');
      if (progressIndicator) {
        progressIndicator.style.display = 'flex';
      }

      // Use the backend scraping service for extraction
      const response = await fetch(`${process.env.VITE_API_BASE_URL || "http://localhost:3001/api"}/scrape/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          url: url,
          selectors: selectedElements.map(el => ({
            selector: el.selector,
            type: el.type,
            name: el.name || el.selector,
            attribute: el.type === 'attribute' ? el.attribute : undefined
          })),
          options: {
            waitForSelector: selectedElements[0]?.selector,
            javascript: scrapingOptions.waitForJs,
            pagination: scrapingOptions.followPagination,
            extractionMode: scrapingOptions.extractionMode,
            proxy: scrapingOptions.proxy,
            delay: scrapingOptions.requestDelay,
            timeout: scrapingOptions.timeout,
            userAgent: getRandomUserAgent(),
            formatOptions: {
              skipHeaders: scrapingOptions.aiClean,
              skipFooters: scrapingOptions.aiClean,
              excludeAds: scrapingOptions.aiClean,
              summarize: scrapingOptions.aiStructure
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Scraping failed with status ${response.status}`);
      }

      const result = await response.json();

      // Process the data if needed
      if (result.success && result.data) {
        // Add metadata to the results
        const processedData = result.data.map((item: any) => ({
          ...item,
          scrapedAt: new Date().toISOString(),
          selector: selectedElements.find(el => el.name === item.name || el.selector === item.selector)?.selector
        }));

        return processedData;
      }

      return result.data || [];
    } catch (error) {
      console.error('Error scraping page:', error);
      throw error;
    } finally {
      // Hide scraping progress indicator
      const progressIndicator = document.getElementById('scraping-progress');
      if (progressIndicator) {
        progressIndicator.style.display = 'none';
      }
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
        {/* Add your content here */}
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 flex flex-col overflow-hidden">

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </Card>
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
                className="flex w-full flex-col space-y-2"
              >
                <div className="flex w-full items-center space-x-2">
                  <Input
                    type="url"
                    placeholder="Enter URL to scrape (e.g., example.com)"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (urlError) setUrlError("");
                    }}
                    className={`flex-1 ${urlError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    disabled={isScraping}
                    ref={urlInputRef}
                  />
                  <Button
                    type="submit"
                    disabled={!url || isLoading || isScraping}
                    className={isLoading ? 'animate-pulse' : ''}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>Load URL</>
                    )}
                  </Button>
                </div>
                {urlError && (
                  <div className="text-red-500 text-sm px-1">
                    {urlError}
                  </div>
                )}
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
          <div className="h-full overflow-auto">
            <BrowserDisplay
              ref={iframeRef}
              url={url}
              height="100%"
              onLoad={() => setIsLoading(false)}
              onError={(error) => {
                setIsLoading(false);
                console.error('Error loading URL:', error);
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingStudio;







