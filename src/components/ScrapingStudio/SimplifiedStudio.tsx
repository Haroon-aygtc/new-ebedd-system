import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BrowserDisplay from "@/components/BrowserDisplay";

const SimplifiedStudio: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [displayUrl, setDisplayUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    setDisplayUrl(urlToLoad);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = (error: Error) => {
    setIsLoading(false);
    setError(error.message);
    console.error('Error loading URL:', error);
  };

  return (
    <div className="bg-background w-full h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader>
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
            />
            <Button type="submit" disabled={!url.trim() || isLoading}>
              {isLoading ? 'Loading...' : 'Load URL'}
            </Button>
          </form>
          
          {error && (
            <div className="mt-2 p-2 bg-red-50 text-red-600 rounded border border-red-200">
              {error}
            </div>
          )}
        </div>
        
        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="h-full overflow-auto">
            {displayUrl ? (
              <BrowserDisplay
                url={displayUrl}
                height="100%"
                onLoad={handleLoad}
                onError={handleError}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Enter a URL above to start scraping</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedStudio;
