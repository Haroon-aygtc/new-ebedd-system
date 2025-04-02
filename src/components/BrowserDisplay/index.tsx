import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink } from 'lucide-react';

interface BrowserDisplayProps {
  url: string;
  height?: string | number;
  width?: string | number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const BrowserDisplay: React.FC<BrowserDisplayProps> = ({
  url,
  height = '600px',
  width = '100%',
  onLoad,
  onError
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);

  const loadUrl = async (urlToLoad: string) => {
    if (!urlToLoad) return;

    setIsLoading(true);
    setError(null);

    try {
      // Show loading state in iframe
      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(`
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
          doc.close();
        }
      }

      console.log('Fetching URL:', urlToLoad);
      // Use our proxy service to fetch the URL content
      const proxyUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/proxy/url`;
      console.log('Using proxy URL:', proxyUrl);

      const response = await fetch(proxyUrl, {
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

      const result = await response.json();

      if (result.success && result.data && result.data.content) {
        setContent(result.data.content);

        // Display the content in the iframe
        if (iframeRef.current) {
          const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
          if (doc) {
            doc.open();
            doc.write(result.data.content);
            doc.close();

            // Add base target to open links in new tab
            try {
              const base = doc.createElement('base');
              base.target = '_blank';
              doc.head.appendChild(base);
            } catch (e) {
              console.warn('Could not add base target to iframe', e);
            }

            if (onLoad) onLoad();
          }
        }
      } else {
        throw new Error('Invalid response from proxy service');
      }
    } catch (err) {
      console.error('Error loading URL:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');

      // Try fallback method using allorigins.win
      try {
        console.log('Trying fallback method with allorigins.win');

        // Show loading message for fallback method
        if (iframeRef.current) {
          const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
          if (doc) {
            doc.open();
            doc.write(`
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
                      background-color: #f0f9ff;
                      color: #0369a1;
                    }
                    .message {
                      text-align: center;
                      max-width: 80%;
                      padding: 2rem;
                      background-color: white;
                      border-radius: 0.5rem;
                      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    }
                    .info-icon {
                      color: #0ea5e9;
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
                  <div class="message">
                    <div class="info-icon">ℹ️</div>
                    <h2>Using Fallback Method</h2>
                    <p>Primary method failed. Trying alternative approach...</p>
                    <div class="spinner"></div>
                    <div class="url">${urlToLoad}</div>
                  </div>
                </body>
              </html>
            `);
            doc.close();
          }
        }

        const fallbackUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(urlToLoad)}`;
        const fallbackResponse = await fetch(fallbackUrl);

        if (!fallbackResponse.ok) {
          throw new Error(`Fallback service failed: ${fallbackResponse.statusText}`);
        }

        const fallbackData = await fallbackResponse.json();

        if (fallbackData.contents) {
          console.log('Fallback method succeeded');
          // Load the HTML content into the iframe
          if (iframeRef.current) {
            const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
            if (doc) {
              // Process the HTML to fix links and add base target
              const processedHtml = `
                <html>
                  <head>
                    <base href="${urlToLoad}" target="_blank">
                    <meta http-equiv="Content-Security-Policy" content="
                      default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
                      img-src * data: blob:;
                      style-src * 'unsafe-inline';
                      script-src * 'unsafe-inline' 'unsafe-eval';
                      connect-src *;
                    ">
                    <script>
                      // Prevent navigation away from the iframe
                      window.addEventListener('click', function(e) {
                        const target = e.target.closest('a');
                        if (target && target.href) {
                          e.preventDefault();
                          window.open(target.href, '_blank');
                        }
                      }, true);

                      // Prevent form submissions
                      window.addEventListener('submit', function(e) {
                        e.preventDefault();
                      }, true);
                    </script>
                  </head>
                  <body>
                    ${fallbackData.contents}
                  </body>
                </html>
              `;

              doc.open();
              doc.write(processedHtml);
              doc.close();

              if (onLoad) onLoad();
              return; // Success with fallback, exit the function
            }
          }
        } else {
          throw new Error('Invalid response from fallback service');
        }
      } catch (fallbackErr) {
        console.error('Fallback method also failed:', fallbackErr);
        // Continue to error display
      }

      // Show error in iframe
      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(`
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
                  <p>${err instanceof Error ? err.message : 'Unknown error'}</p>
                  <div class="url">${urlToLoad}</div>
                  <p>Please check the URL and try again.</p>
                  <button class="retry-btn" onclick="window.parent.document.getElementById('retry-button').click()">Retry</button>
                </div>
              </body>
            </html>
          `);
          doc.close();
        }
      }

      if (onError) onError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load the URL when it changes
  useEffect(() => {
    if (url) {
      loadUrl(url);
    }
  }, [url]);

  // Handle direct URL loading
  const handleDirectLoad = () => {
    // This is a fallback method that opens the URL directly in the iframe
    // It will work for some sites but not for those with X-Frame-Options restrictions
    if (iframeRef.current) {
      try {
        console.log('Trying direct iframe loading for:', url);

        // First show a loading message
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(`
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
                    background-color: #f0f9ff;
                    color: #0369a1;
                  }
                  .message {
                    text-align: center;
                    max-width: 80%;
                    padding: 2rem;
                    background-color: white;
                    border-radius: 0.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                  }
                  .info-icon {
                    color: #0ea5e9;
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
                <div class="message">
                  <div class="info-icon">ℹ️</div>
                  <h2>Direct Loading</h2>
                  <p>Attempting to load website directly...</p>
                  <div class="spinner"></div>
                  <div class="url">${url}</div>
                  <p>This may not work for all websites due to security restrictions.</p>
                </div>
              </body>
            </html>
          `);
          doc.close();
        }

        // Then set the src attribute to load the URL directly
        // This will trigger a navigation in the iframe
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.src = url;
          }
        }, 500);

        // We can't reliably detect if the direct loading worked due to cross-origin restrictions
        // So we'll just assume it's loading and let the user see the result
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          if (onLoad) onLoad();
        }, 3000);
      } catch (error) {
        console.error('Error in direct loading:', error);
        if (onError) onError(new Error('Failed to load iframe directly'));
      }
    }
  };

  // Handle retry
  const handleRetry = () => {
    if (url) {
      // Don't try to access iframe content directly to avoid cross-origin errors
      // Just reload the URL
      loadUrl(url);
    }
  };

  // Handle open in new tab
  const handleOpenInNewTab = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-muted p-2 flex justify-between items-center">
        <div className="flex-1 truncate px-2 text-sm font-medium">
          {url || 'No URL loaded'}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            disabled={isLoading || !url}
            id="retry-button"
            title="Retry loading"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDirectLoad}
            disabled={!url}
            title="Try direct loading (may not work for all sites)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <path d="M9 16l3-3 3 3"></path>
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenInNewTab}
            disabled={!url}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-0 overflow-hidden" style={{ height, width }}>
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          title="Web Preview"
          onLoad={() => {
            // Don't try to access iframe content directly to avoid cross-origin errors
            console.log('Iframe loaded');
            setIsLoading(false);
            if (onLoad) onLoad();
          }}
          onError={(e) => {
            console.error('Iframe error:', e);
            if (onError) onError(new Error('Failed to load iframe'));
          }}
        />
      </CardContent>
    </Card>
  );
};

export default BrowserDisplay;
