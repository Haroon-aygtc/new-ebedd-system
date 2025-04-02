import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Loader2, Search, Globe, Check, X } from "lucide-react";

interface UrlDiscoveryToolProps {
  onUrlsDiscover: (urls: string[]) => void;
}

const UrlDiscoveryTool: React.FC<UrlDiscoveryToolProps> = ({
  onUrlsDiscover,
}) => {
  const [startUrl, setStartUrl] = useState("");
  const [maxDepth, setMaxDepth] = useState(1);
  const [maxUrls, setMaxUrls] = useState(50);
  const [sameDomain, setSameDomain] = useState(true);
  const [urlPattern, setUrlPattern] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [discoveredUrls, setDiscoveredUrls] = useState<string[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  const handleDiscover = async () => {
    if (!startUrl) return;

    setIsLoading(true);
    setDiscoveredUrls([]);
    setSelectedUrls([]);

    try {
      // In a real implementation, this would be an API call to your backend
      // For now, we'll simulate the API call with a timeout and mock data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate some mock URLs based on the start URL
      const urlObj = new URL(startUrl);
      const domain = urlObj.hostname;
      const path = urlObj.pathname;

      // Generate mock discovered URLs
      const mockUrls = [
        startUrl,
        `${urlObj.protocol}//${domain}/products`,
        `${urlObj.protocol}//${domain}/categories`,
        `${urlObj.protocol}//${domain}/about`,
        `${urlObj.protocol}//${domain}/contact`,
        `${urlObj.protocol}//${domain}/blog`,
        `${urlObj.protocol}//${domain}/products/item1`,
        `${urlObj.protocol}//${domain}/products/item2`,
        `${urlObj.protocol}//${domain}/products/item3`,
        `${urlObj.protocol}//${domain}/categories/electronics`,
        `${urlObj.protocol}//${domain}/categories/clothing`,
        `${urlObj.protocol}//${domain}/blog/post1`,
        `${urlObj.protocol}//${domain}/blog/post2`,
      ];

      // Filter by pattern if provided
      let filteredUrls = mockUrls;
      if (urlPattern) {
        const regex = new RegExp(urlPattern);
        filteredUrls = mockUrls.filter((url) => regex.test(url));
      }

      // Limit to maxUrls
      filteredUrls = filteredUrls.slice(0, maxUrls);

      setDiscoveredUrls(filteredUrls);
      // Auto-select all discovered URLs
      setSelectedUrls(filteredUrls);
    } catch (error) {
      console.error("Error discovering URLs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    setSelectedUrls([...discoveredUrls]);
  };

  const handleDeselectAll = () => {
    setSelectedUrls([]);
  };

  const handleToggleUrl = (url: string) => {
    if (selectedUrls.includes(url)) {
      setSelectedUrls(selectedUrls.filter((u) => u !== url));
    } else {
      setSelectedUrls([...selectedUrls, url]);
    }
  };

  const handleUseSelected = () => {
    onUrlsDiscover(selectedUrls);
  };

  return (
    <div className="space-y-6 w-full bg-background p-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="start-url">Starting URL</Label>
          <div className="flex space-x-2">
            <Input
              id="start-url"
              placeholder="https://example.com"
              value={startUrl}
              onChange={(e) => setStartUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleDiscover} disabled={!startUrl || isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Discover URLs
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Crawl Depth</Label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[maxDepth]}
                min={1}
                max={5}
                step={1}
                onValueChange={(value) => setMaxDepth(value[0])}
                disabled={isLoading}
              />
              <span className="w-8 text-center">{maxDepth}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Max URLs</Label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[maxUrls]}
                min={10}
                max={100}
                step={10}
                onValueChange={(value) => setMaxUrls(value[0])}
                disabled={isLoading}
              />
              <span className="w-8 text-center">{maxUrls}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="url-pattern">URL Pattern (regex)</Label>
          <Input
            id="url-pattern"
            placeholder="e.g., /products/.+"
            value={urlPattern}
            onChange={(e) => setUrlPattern(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="same-domain"
            checked={sameDomain}
            onCheckedChange={(checked) => setSameDomain(checked as boolean)}
            disabled={isLoading}
          />
          <Label htmlFor="same-domain">Stay on same domain</Label>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-medium mb-2">Discovering URLs</h3>
            <p className="text-muted-foreground">
              Crawling website to find URLs...
            </p>
          </div>
        </div>
      ) : discoveredUrls.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              Discovered URLs ({discoveredUrls.length})
            </h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                Deselect All
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[300px] border rounded-md p-2">
            <div className="space-y-2">
              {discoveredUrls.map((url, index) => {
                const isSelected = selectedUrls.includes(url);
                return (
                  <div
                    key={index}
                    className={`flex items-center p-2 rounded-md ${isSelected ? "bg-primary/10" : "bg-muted/50"} cursor-pointer`}
                    onClick={() => handleToggleUrl(url)}
                  >
                    <div className="mr-2">
                      {isSelected ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <div className="h-4 w-4 rounded-sm border" />
                      )}
                    </div>
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm truncate flex-1">{url}</span>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="flex justify-end space-x-2">
            <Button
              onClick={handleUseSelected}
              disabled={selectedUrls.length === 0}
            >
              Use Selected ({selectedUrls.length})
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-md p-8 text-center">
          <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No URLs Discovered Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Enter a starting URL and click "Discover URLs" to crawl the website
            and find pages to scrape.
          </p>
        </div>
      )}
    </div>
  );
};

export default UrlDiscoveryTool;
