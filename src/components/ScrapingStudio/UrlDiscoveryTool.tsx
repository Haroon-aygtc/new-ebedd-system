import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Check, Compass, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { discoverUrls } from "@/api/services/scrapeService";

interface UrlDiscoveryToolProps {
  onSubmit: (urls: string[]) => void;
  onCancel: () => void;
}

const UrlDiscoveryTool: React.FC<UrlDiscoveryToolProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [startUrl, setStartUrl] = useState<string>("");
  const [urlPattern, setUrlPattern] = useState<string>("");
  const [maxDepth, setMaxDepth] = useState<number>(1);
  const [maxUrls, setMaxUrls] = useState<number>(20);
  const [sameDomain, setSameDomain] = useState<boolean>(true);
  const [useJavascript, setUseJavascript] = useState<boolean>(true);
  const [discoveredUrls, setDiscoveredUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());

  const handleStartUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartUrl(e.target.value);
    setError("");
  };

  const handleUrlPatternChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlPattern(e.target.value);
  };

  const handleMaxDepthChange = (value: number[]) => {
    setMaxDepth(value[0]);
  };

  const handleMaxUrlsChange = (value: number[]) => {
    setMaxUrls(value[0]);
  };

  const handleSameDomainChange = (checked: boolean) => {
    setSameDomain(checked);
  };

  const handleJavascriptChange = (checked: boolean) => {
    setUseJavascript(checked);
  };

  const handleDiscover = async () => {
    if (!startUrl) {
      setError("Please enter a starting URL");
      return;
    }

    try {
      // Validate URL
      let processedUrl = startUrl;
      if (!startUrl.startsWith("http://") && !startUrl.startsWith("https://")) {
        processedUrl = "https://" + startUrl;
      }
      new URL(processedUrl);

      setIsLoading(true);
      setError("");
      setDiscoveredUrls([]);
      setSelectedUrls(new Set());

      // Call the URL discovery service
      const urls = await discoverUrls(processedUrl, {
        maxDepth,
        urlPattern: urlPattern || undefined,
        maxUrls,
        sameDomain,
        javascript: useJavascript,
      });

      setDiscoveredUrls(urls);

      // Auto-select all discovered URLs
      const newSelected = new Set(urls);
      setSelectedUrls(newSelected);
    } catch (error) {
      console.error("Error discovering URLs:", error);
      setError(
        "Failed to discover URLs. Please check the starting URL and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUrlSelection = (url: string) => {
    const newSelected = new Set(selectedUrls);
    if (newSelected.has(url)) {
      newSelected.delete(url);
    } else {
      newSelected.add(url);
    }
    setSelectedUrls(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedUrls(new Set(discoveredUrls));
  };

  const handleSelectNone = () => {
    setSelectedUrls(new Set());
  };

  const handleSubmit = () => {
    if (selectedUrls.size === 0) {
      setError("Please select at least one URL");
      return;
    }
    onSubmit(Array.from(selectedUrls));
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Compass className="mr-2 h-5 w-5" />
          URL Discovery Tool
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="start-url"
                className="block text-sm font-medium mb-1"
              >
                Starting URL
              </label>
              <Input
                id="start-url"
                placeholder="https://example.com"
                value={startUrl}
                onChange={handleStartUrlChange}
              />
            </div>

            <div>
              <label
                htmlFor="url-pattern"
                className="block text-sm font-medium mb-1"
              >
                URL Pattern (optional regex)
              </label>
              <Input
                id="url-pattern"
                placeholder="product|category"
                value={urlPattern}
                onChange={handleUrlPatternChange}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Only URLs matching this pattern will be included
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="max-depth">Crawl Depth</Label>
                  <span className="text-sm text-muted-foreground">
                    {maxDepth}
                  </span>
                </div>
                <Slider
                  id="max-depth"
                  min={1}
                  max={5}
                  step={1}
                  value={[maxDepth]}
                  onValueChange={handleMaxDepthChange}
                />
                <p className="text-xs text-muted-foreground">
                  How many links deep to crawl (higher values take longer)
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="max-urls">Max URLs</Label>
                  <span className="text-sm text-muted-foreground">
                    {maxUrls}
                  </span>
                </div>
                <Slider
                  id="max-urls"
                  min={5}
                  max={100}
                  step={5}
                  value={[maxUrls]}
                  onValueChange={handleMaxUrlsChange}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of URLs to discover
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="same-domain">Stay on Same Domain</Label>
              <Switch
                id="same-domain"
                checked={sameDomain}
                onCheckedChange={handleSameDomainChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="use-javascript">Use JavaScript (for SPAs)</Label>
              <Switch
                id="use-javascript"
                checked={useJavascript}
                onCheckedChange={handleJavascriptChange}
              />
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {discoveredUrls.length > 0 && (
            <div className="border rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Discovered URLs</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{discoveredUrls.length} URLs</Badge>
                  <Badge variant="secondary">
                    {selectedUrls.size} selected
                  </Badge>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mb-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleSelectNone}>
                  Select None
                </Button>
              </div>
              <ScrollArea className="h-60">
                <ul className="space-y-1">
                  {discoveredUrls.map((url, index) => (
                    <li
                      key={index}
                      className={`text-sm font-mono flex items-center p-1 rounded cursor-pointer ${selectedUrls.has(url) ? "bg-accent" : "hover:bg-accent/50"}`}
                      onClick={() => toggleUrlSelection(url)}
                    >
                      {selectedUrls.has(url) ? (
                        <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 border rounded mr-2 flex-shrink-0" />
                      )}
                      <span className="truncate">{url}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="space-x-2">
          <Button
            variant="secondary"
            onClick={handleDiscover}
            disabled={!startUrl || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Discovering...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Discover URLs
              </>
            )}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedUrls.size === 0 || isLoading}
          >
            Use Selected URLs
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default UrlDiscoveryTool;
