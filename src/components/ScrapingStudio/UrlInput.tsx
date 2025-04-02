import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface UrlInputProps {
  onLoadUrl: (url: string) => Promise<void>;
  disabled?: boolean;
}

const UrlInput: React.FC<UrlInputProps> = ({ onLoadUrl, disabled = false }) => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [urlError, setUrlError] = useState<string>('');
  const urlInputRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setUrlError('');
    
    // Validate URL
    if (!url.trim()) {
      setUrlError('Please enter a URL');
      return;
    }
    
    // Add http:// prefix if missing
    let urlToLoad = url.trim();
    if (!/^https?:\/\//i.test(urlToLoad)) {
      urlToLoad = 'https://' + urlToLoad;
      setUrl(urlToLoad);
    }
    
    try {
      // Validate URL format
      new URL(urlToLoad);
      
      setIsLoading(true);
      
      try {
        await onLoadUrl(urlToLoad);
      } catch (error) {
        console.error('Error loading URL:', error);
        setUrlError(`Failed to load URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Focus the input field for correction
        urlInputRef.current?.focus();
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Invalid URL format:', error);
      setUrlError('Please enter a valid URL');
      // Focus the input field for correction
      urlInputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleUrlSubmit} className="flex w-full flex-col space-y-2">
      <div className="flex w-full items-center space-x-2">
        <Input
          type="url"
          placeholder="Enter URL to scrape (e.g., example.com)"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (urlError) setUrlError('');
          }}
          className={`flex-1 ${urlError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          disabled={disabled || isLoading}
          ref={urlInputRef}
        />
        <Button 
          type="submit" 
          disabled={!url || isLoading || disabled}
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
  );
};

export default UrlInput;
