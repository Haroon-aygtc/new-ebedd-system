import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import BrowserDisplay from '@/components/BrowserDisplay';

const BrowserDemo: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [displayUrl, setDisplayUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check if the proxy server is running
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/proxy/url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url: 'https://example.com' }),
        });

        if (response.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (error) {
        console.error('Error checking server:', error);
        setServerStatus('offline');
      }
    };

    checkServer();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Browser Display Demo</h1>

      {serverStatus === 'checking' && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 rounded-full bg-yellow-500 animate-pulse"></div>
            <AlertTitle>Checking proxy server status...</AlertTitle>
          </div>
        </Alert>
      )}

      {serverStatus === 'offline' && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 rounded-full bg-red-500"></div>
            <AlertTitle>Proxy Server Offline</AlertTitle>
          </div>
          <AlertDescription>
            The proxy server is not running. The browser preview will use fallback methods,
            but some websites may not display correctly. Start the server with <code className="bg-gray-100 px-1 py-0.5 rounded">node server.js</code> for better results.
          </AlertDescription>
        </Alert>
      )}

      {serverStatus === 'online' && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 rounded-full bg-green-500"></div>
            <AlertTitle>Proxy Server Online</AlertTitle>
          </div>
          <AlertDescription>
            The proxy server is running. Website previews should work correctly.
          </AlertDescription>
        </Alert>
      )}

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

      {error && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <AlertTitle>Error Loading URL</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
        <p className="mt-2">
          <strong>Fallback Methods:</strong> If the proxy server is offline or fails, the component will try:
          <ol className="list-decimal pl-5 space-y-1 mt-1">
            <li>Using the allorigins.win proxy service</li>
            <li>Direct iframe loading (may not work for all sites)</li>
          </ol>
        </p>
      </div>
    </div>
  );
};

export default BrowserDemo;
