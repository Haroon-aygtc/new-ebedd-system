import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import BrowserDisplay from "@/components/BrowserDisplay";

const NewScrapingStudio: React.FC = () => {
  // State
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Handle URL submission
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL
    let urlToLoad = url.trim();
    if (!urlToLoad) return;
    
    // Add http:// prefix if missing
    if (!/^https?:\/\//i.test(urlToLoad)) {
      urlToLoad = 'https://' + urlToLoad;
      setUrl(urlToLoad);
    }
    
    setIsLoading(true);
    setError(null);
  };

  // Handle load completion
  const handleLoad = () => {
    setIsLoading(false);
  };

  // Handle errors
  const handleError = (error: Error) => {
    setIsLoading(false);
    setError(error.message);
    console.error('Error loading URL:', error);
  };

  return (
    <div className="bg-background w-full h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Web Scraping Studio</CardTitle>
        </CardHeader>
        
        <div className="px-4 pb-4">
          <form onSubmit={handleUrlSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter URL to scrape (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              ref={urlInputRef}
            />
            <Button type="submit" disabled={!url.trim() || isLoading}>
              {isLoading ? 'Loading...' : 'Load URL'}
            </Button>
          </form>
          
          {error && (
            <Alert className="mt-2 bg-red-50 border-red-200">
              <AlertTitle>Error Loading URL</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="flex-1 px-4 pb-4 min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="selectors">Selectors</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 mt-2 min-h-0">
              <TabsContent value="preview" className="h-full m-0">
                {url ? (
                  <BrowserDisplay
                    url={url}
                    height="100%"
                    onLoad={handleLoad}
                    onError={handleError}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>Enter a URL above to start scraping</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="selectors" className="h-full m-0">
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Element selection will be implemented here</p>
                </div>
              </TabsContent>
              
              <TabsContent value="results" className="h-full m-0">
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Scraping results will be displayed here</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default NewScrapingStudio;
