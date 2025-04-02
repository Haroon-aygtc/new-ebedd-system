import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import sub-components
import ScrapingHeader from './ScrapingHeader';
import UrlInput from './UrlInput';
import BatchUrlsBar from './BatchUrlsBar';
import ProgressBar from './ProgressBar';
import BrowserPreview from './BrowserPreview';
import SelectorPanel from './SelectorPanel';
import ResultsPanel from './ResultsPanel';

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
}

const ScrapingStudioRefactored: React.FC<ScrapingStudioProps> = ({ onExport }) => {
  // State
  const [url, setUrl] = useState<string>('');
  const [urls, setUrls] = useState<string[]>([]);
  const [currentUrlIndex, setCurrentUrlIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [selectedElements, setSelectedElements] = useState<Selector[]>([]);
  const [scrapedData, setScrapedData] = useState<ScrapedItem[]>([]);
  
  // Dialog states
  const [showBatchUrlDialog, setShowBatchUrlDialog] = useState<boolean>(false);
  const [showUrlDiscoveryDialog, setShowUrlDiscoveryDialog] = useState<boolean>(false);

  // Load URL function
  const loadUrl = async (urlToLoad: string) => {
    setIsLoading(true);
    setUrl(urlToLoad);
    
    try {
      // Call the proxy service to load the URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/proxy/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          url: urlToLoad,
          options: {
            javascript: true,
            timeout: 30000
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load URL: ${response.statusText}`);
      }
      
      // Success - the BrowserPreview component will handle displaying the content
      console.log('URL loaded successfully:', urlToLoad);
      
    } catch (error) {
      console.error('Error loading URL:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle element selection
  const handleElementSelect = (selector: string, element: HTMLElement) => {
    // Generate a unique ID
    const id = `selector-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Determine the best type based on the element
    let type = 'text';
    if (element.tagName === 'IMG') {
      type = 'image';
    } else if (element.tagName === 'A') {
      type = 'link';
    } else if (element.children.length > 3) {
      type = 'html';
    }
    
    // Create a name from the element content or attributes
    let name = '';
    if (element.textContent) {
      name = element.textContent.trim().substring(0, 20);
    } else if (element.getAttribute('alt')) {
      name = element.getAttribute('alt')!;
    } else if (element.getAttribute('title')) {
      name = element.getAttribute('title')!;
    } else if (element.getAttribute('id')) {
      name = element.getAttribute('id')!;
    } else {
      name = selector.replace(/[.#]/g, '');
    }
    
    // Add the new element to selected elements
    setSelectedElements(prev => [
      ...prev,
      {
        id,
        selector,
        type,
        name
      }
    ]);
    
    // Switch to the selectors tab
    setActiveTab('selectors');
  };

  // Start scraping
  const handleStartScraping = async () => {
    if (selectedElements.length === 0) {
      alert('Please select at least one element to scrape');
      return;
    }

    setIsScraping(true);
    setProgress(0);
    
    try {
      // If we have multiple URLs, scrape them all
      if (urls.length > 0) {
        const allData: ScrapedItem[] = [];
        
        for (let i = 0; i < urls.length; i++) {
          if (!isScraping) break; // Check if scraping was stopped
          
          setCurrentUrlIndex(i);
          setUrl(urls[i]);
          setProgress(Math.round((i / urls.length) * 100));
          
          try {
            // Load the URL
            await loadUrl(urls[i]);
            
            // Scrape the URL
            const data = await scrapeCurrentPage(urls[i]);
            allData.push({
              url: urls[i],
              data,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.error(`Error scraping ${urls[i]}:`, error);
            allData.push({
              url: urls[i],
              data: [],
              timestamp: new Date().toISOString(),
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
          
          // Add a small delay between requests
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        setScrapedData(allData);
      } else {
        // Just scrape the current page
        try {
          const data = await scrapeCurrentPage(url);
          setScrapedData([{
            url,
            data,
            timestamp: new Date().toISOString()
          }]);
        } catch (error) {
          console.error('Error scraping current page:', error);
          setScrapedData([{
            url,
            data: [],
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
          }]);
        }
      }
      
      setProgress(100);
      // Switch to the results tab
      setActiveTab('results');
    } catch (error) {
      console.error('Error during scraping:', error);
      alert(`Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsScraping(false);
    }
  };

  // Stop scraping
  const handleStopScraping = () => {
    setIsScraping(false);
  };

  // Scrape the current page
  const scrapeCurrentPage = async (currentUrl: string) => {
    try {
      // Call the API to scrape the page
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/scrape/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: currentUrl,
          selectors: selectedElements.map(el => ({
            selector: el.selector,
            type: el.type,
            name: el.name || el.selector,
            attribute: el.type === 'attribute' ? el.attribute : undefined
          })),
          options: {
            javascript: true,
            timeout: 30000
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Scraping failed with status ${response.status}`);
      }
      
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error scraping page:', error);
      throw error;
    }
  };

  // Handle export
  const handleExport = () => {
    if (onExport && scrapedData.length > 0) {
      onExport(scrapedData);
    } else {
      // Default export behavior if no callback provided
      const json = JSON.stringify(scrapedData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scraping-results-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Handle export format
  const handleExportFormat = (format: string) => {
    if (scrapedData.length === 0) return;
    
    if (format === 'json') {
      const json = JSON.stringify(scrapedData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scraping-results-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // Convert to CSV
      let csv = 'URL,Field Name,Field Type,Value\n';
      
      scrapedData.forEach(item => {
        if (item.error) {
          csv += `${item.url},"Error: ${item.error.replace(/"/g, '""')}","error",""\n`;
        } else {
          item.data.forEach(field => {
            const value = Array.isArray(field.value) 
              ? field.value.join(' | ').replace(/"/g, '""')
              : field.value.replace(/"/g, '""');
            
            csv += `${item.url},"${field.name}","${field.type}","${value}"\n`;
          });
        }
      });
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scraping-results-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Selector panel handlers
  const handleRemoveSelector = (id: string) => {
    setSelectedElements(prev => prev.filter(el => el.id !== id));
  };

  const handleClearSelectors = () => {
    setSelectedElements([]);
  };

  const handleSelectorTypeChange = (id: string, type: string) => {
    setSelectedElements(prev => prev.map(el => 
      el.id === id ? { ...el, type } : el
    ));
  };

  const handleSelectorNameChange = (id: string, name: string) => {
    setSelectedElements(prev => prev.map(el => 
      el.id === id ? { ...el, name } : el
    ));
  };

  const handleSelectorAttributeChange = (id: string, attribute: string) => {
    setSelectedElements(prev => prev.map(el => 
      el.id === id ? { ...el, attribute } : el
    ));
  };

  // Batch URL handlers
  const handleOpenBatchDialog = () => {
    setShowBatchUrlDialog(true);
  };

  const handleOpenDiscoveryDialog = () => {
    setShowUrlDiscoveryDialog(true);
  };

  const handleBatchUrlSubmit = (batchUrls: string[]) => {
    setUrls(batchUrls);
    setShowBatchUrlDialog(false);
  };

  const handleUrlDiscoverySubmit = (discoveredUrls: string[]) => {
    setUrls(discoveredUrls);
    setShowUrlDiscoveryDialog(false);
  };

  // Toggle select mode when the tab changes
  useEffect(() => {
    setIsSelectMode(activeTab === 'preview');
  }, [activeTab]);

  return (
    <div className="bg-background w-full h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
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
              <UrlInput 
                onLoadUrl={loadUrl} 
                disabled={isScraping} 
              />
            </div>
            
            <BatchUrlsBar
              urls={urls}
              currentUrlIndex={currentUrlIndex}
              onOpenBatchDialog={handleOpenBatchDialog}
              onOpenDiscoveryDialog={handleOpenDiscoveryDialog}
              disabled={isScraping}
            />
          </div>
          
          <ProgressBar 
            progress={progress} 
            isVisible={isScraping} 
          />
        </div>
        
        <div className="flex-1 px-4 pb-4 min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="selectors">Selectors ({selectedElements.length})</TabsTrigger>
              <TabsTrigger value="results">Results ({scrapedData.length})</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 mt-2 min-h-0">
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

export default ScrapingStudioRefactored;
