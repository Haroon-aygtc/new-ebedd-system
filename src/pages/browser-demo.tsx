import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import BrowserDisplay from '@/components/BrowserDisplay';

const BrowserDemo = () => {
  const [url, setUrl] = useState<string>('');
  const [displayUrl, setDisplayUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
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
  };

  const handleError = (error: Error) => {
    setIsLoading(false);
    console.error('Error loading URL:', error);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Browser Display Demo</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter URL (e.g., example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!url.trim() || isLoading}>
            {isLoading ? 'Loading...' : 'Load URL'}
          </Button>
        </div>
      </form>
      
      {displayUrl ? (
        <BrowserDisplay
          url={displayUrl}
          height={600}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <p>Enter a URL above to display a website</p>
        </div>
      )}
      
      <div className="mt-6 text-sm text-muted-foreground">
        <h2 className="font-medium text-foreground">How it works:</h2>
        <ol className="list-decimal pl-5 space-y-2 mt-2">
          <li>Enter a URL in the input field above</li>
          <li>The URL is sent to a proxy server that fetches the content</li>
          <li>The content is processed to work in an iframe</li>
          <li>The processed content is displayed in the iframe</li>
        </ol>
        <p className="mt-4">
          This approach works for most websites, even those that set X-Frame-Options headers
          that would normally prevent them from being displayed in an iframe.
        </p>
      </div>
    </div>
  );
};

export default BrowserDemo;
