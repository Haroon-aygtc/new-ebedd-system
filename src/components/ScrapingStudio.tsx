import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  Code,
  Copy,
  Download,
  Eye,
  FileJson,
  FileSpreadsheet,
  Globe,
  Loader2,
  MousePointer,
  Play,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  X,
  Grid,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useScraper } from "@/hooks/useScraper";
import BrowserPreview from "@/components/BrowserPreview";
import ElementSelector from "@/components/ElementSelector";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ScrapingStudioProps {
  className?: string;
}

const ScrapingStudio: React.FC<ScrapingStudioProps> = ({ className = "" }) => {
  const { toast } = useToast();
  const {
    url,
    setUrl,
    pageContent,
    isLoading,
    error,
    selectedElements,
    scrapingConfig,
    setScrapingConfig,
    scrapingResults,
    scrapingProgress,
    isScrapingActive,
    loadUrl,
    selectElement,
    removeSelectedElement,
    startScraping,
    stopScraping,
    exportResults,
    saveConfig,
    loadConfig,
  } = useScraper();

  const [activeTab, setActiveTab] = useState("browser");
  const [configName, setConfigName] = useState("");
  const [showElementSelector, setShowElementSelector] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "json">("table");
  const [selectedHTMLElement, setSelectedHTMLElement] =
    useState<HTMLElement | null>(null);
  const [elementSelectorOpen, setElementSelectorOpen] = useState(false);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUrl();
  };

  const handleElementSelect = (element: HTMLElement) => {
    setSelectedHTMLElement(element);
    setElementSelectorOpen(true);
  };

  const handleElementConfirm = (element: any) => {
    selectElement(element);
  };

  const handleSaveConfig = () => {
    if (!configName) {
      toast({
        title: "Configuration name required",
        description: "Please enter a name for this scraping configuration",
        variant: "destructive",
      });
      return;
    }

    saveConfig(configName);
    toast({
      title: "Configuration saved",
      description: `Scraping configuration "${configName}" has been saved successfully.`,
    });
  };

  const handleExport = (format: "json" | "csv") => {
    exportResults(format);
    toast({
      title: "Export successful",
      description: `Data has been exported as ${format.toUpperCase()} successfully.`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The data has been copied to your clipboard.",
    });
  };

  return (
    <div className={`w-full h-full bg-background ${className}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center space-x-4 p-4 border-b">
          <form onSubmit={handleUrlSubmit} className="flex-1 flex space-x-2">
            <div className="relative flex-1">
              <Globe className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="Enter URL to scrape"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-8"
                required
              />
            </div>
            <Button type="submit" disabled={isLoading || !url}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>Load URL</>
              )}
            </Button>
          </form>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowElementSelector(!showElementSelector)}
              disabled={!pageContent || isScrapingActive}
              className={showElementSelector ? "bg-accent" : ""}
            >
              <MousePointer className="h-4 w-4" />
            </Button>
            <Button
              variant={isScrapingActive ? "destructive" : "default"}
              onClick={isScrapingActive ? stopScraping : startScraping}
              disabled={!pageContent || selectedElements.length === 0}
            >
              {isScrapingActive ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Scraping
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 p-3 border-l-4 border-destructive flex items-center">
            <AlertCircle className="h-5 w-5 text-destructive mr-2" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <div className="border-b px-4">
              <TabsList>
                <TabsTrigger value="browser">Browser Preview</TabsTrigger>
                <TabsTrigger value="config">Scraping Config</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="browser" className="h-full">
                <div className="relative h-full">
                  <BrowserPreview
                    content={pageContent}
                    isLoading={isLoading}
                    showSelector={showElementSelector}
                    onElementSelect={handleElementSelect}
                    selectedElements={selectedElements}
                  />
                </div>
              </TabsContent>

              <TabsContent value="config" className="h-full p-4 overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Selected Elements</CardTitle>
                      <CardDescription>
                        Elements selected for scraping
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedElements.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MousePointer className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No elements selected</p>
                          <p className="text-sm mt-1">
                            Use the element selector to pick items to scrape
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-3">
                            {selectedElements.map((element, index) => (
                              <div
                                key={index}
                                className="flex items-start justify-between p-3 border rounded-md"
                              >
                                <div>
                                  <div className="flex items-center">
                                    <Badge variant="outline" className="mr-2">
                                      {element.type}
                                    </Badge>
                                    <span className="font-medium">
                                      {element.name || `Element ${index + 1}`}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Selector: {element.selector}
                                  </p>
                                  {element.attribute && (
                                    <p className="text-xs text-muted-foreground">
                                      Attribute: {element.attribute}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSelectedElement(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Scraping Options</CardTitle>
                      <CardDescription>
                        Configure how the scraper should behave
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="pagination-selector">
                            Pagination Selector
                          </Label>
                          <Input
                            id="pagination-selector"
                            placeholder="CSS selector for next page button"
                            value={scrapingConfig.paginationSelector || ""}
                            onChange={(e) =>
                              setScrapingConfig({
                                ...scrapingConfig,
                                paginationSelector: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="max-pages">Maximum Pages</Label>
                          <Input
                            id="max-pages"
                            type="number"
                            min="1"
                            max="100"
                            placeholder="Max pages to scrape"
                            value={scrapingConfig.maxPages || ""}
                            onChange={(e) =>
                              setScrapingConfig({
                                ...scrapingConfig,
                                maxPages: parseInt(e.target.value) || 1,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="delay">
                            Delay Between Requests (ms)
                          </Label>
                          <Input
                            id="delay"
                            type="number"
                            min="0"
                            max="10000"
                            step="100"
                            placeholder="Delay in milliseconds"
                            value={scrapingConfig.delay || ""}
                            onChange={(e) =>
                              setScrapingConfig({
                                ...scrapingConfig,
                                delay: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="follow-links"
                            checked={scrapingConfig.followLinks || false}
                            onCheckedChange={(checked) =>
                              setScrapingConfig({
                                ...scrapingConfig,
                                followLinks: checked,
                              })
                            }
                          />
                          <Label htmlFor="follow-links">Follow Links</Label>
                        </div>

                        {scrapingConfig.followLinks && (
                          <div className="space-y-2 pl-6">
                            <Label htmlFor="link-selector">Link Selector</Label>
                            <Input
                              id="link-selector"
                              placeholder="CSS selector for links to follow"
                              value={scrapingConfig.linkSelector || ""}
                              onChange={(e) =>
                                setScrapingConfig({
                                  ...scrapingConfig,
                                  linkSelector: e.target.value,
                                })
                              }
                            />
                            <Label htmlFor="max-depth">Maximum Depth</Label>
                            <Input
                              id="max-depth"
                              type="number"
                              min="1"
                              max="5"
                              placeholder="Max link depth"
                              value={scrapingConfig.maxDepth || ""}
                              onChange={(e) =>
                                setScrapingConfig({
                                  ...scrapingConfig,
                                  maxDepth: parseInt(e.target.value) || 1,
                                })
                              }
                            />
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="use-headless"
                            checked={scrapingConfig.headless || false}
                            onCheckedChange={(checked) =>
                              setScrapingConfig({
                                ...scrapingConfig,
                                headless: checked,
                              })
                            }
                          />
                          <Label htmlFor="use-headless">Headless Mode</Label>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Configuration name"
                          value={configName}
                          onChange={(e) => setConfigName(e.target.value)}
                          className="w-[200px]"
                        />
                        <Button variant="outline" onClick={handleSaveConfig}>
                          <Save className="mr-2 h-4 w-4" />
                          Save Config
                        </Button>
                      </div>
                      <Button variant="outline" onClick={() => loadConfig()}>
                        <Settings className="mr-2 h-4 w-4" />
                        Load Config
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent
                value="results"
                className="h-full p-4 overflow-hidden"
              >
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium">
                        Scraping Results
                        {scrapingResults.length > 0 && (
                          <Badge variant="outline" className="ml-2">
                            {scrapingResults.length} items
                          </Badge>
                        )}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex border rounded-md overflow-hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-none ${viewMode === "table" ? "bg-accent" : ""}`}
                          onClick={() => setViewMode("table")}
                        >
                          <Grid className="h-4 w-4 mr-1" />
                          Table
                        </Button>
                        <Separator orientation="vertical" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-none ${viewMode === "json" ? "bg-accent" : ""}`}
                          onClick={() => setViewMode("json")}
                        >
                          <Code className="h-4 w-4 mr-1" />
                          JSON
                        </Button>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                copyToClipboard(
                                  JSON.stringify(scrapingResults, null, 2),
                                )
                              }
                              disabled={scrapingResults.length === 0}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy to clipboard</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleExport("json")}
                              disabled={scrapingResults.length === 0}
                            >
                              <FileJson className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Export as JSON</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleExport("csv")}
                              disabled={scrapingResults.length === 0}
                            >
                              <FileSpreadsheet className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Export as CSV</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {isScrapingActive && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Scraping in progress...
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(scrapingProgress * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={scrapingProgress * 100}
                        className="h-2"
                      />
                    </div>
                  )}

                  <div className="flex-1 overflow-hidden border rounded-md">
                    {scrapingResults.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                        <Download className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-lg">No data available</p>
                        <p className="text-sm">
                          Configure and run the scraper to see results here
                        </p>
                      </div>
                    ) : viewMode === "table" ? (
                      <div className="h-full overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(scrapingResults[0]).map((key) => (
                                <TableHead key={key}>{key}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {scrapingResults.map((result, index) => (
                              <TableRow key={index}>
                                {Object.values(result).map((value, i) => (
                                  <TableCell key={i}>
                                    {typeof value === "string" ? (
                                      value.length > 100 ? (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <span>
                                                {value.substring(0, 100)}...
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-md">
                                              {value}
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      ) : (
                                        value
                                      )
                                    ) : (
                                      JSON.stringify(value)
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <ScrollArea className="h-full">
                        <pre className="p-4 text-sm font-mono">
                          {JSON.stringify(scrapingResults, null, 2)}
                        </pre>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <ElementSelector
        isOpen={elementSelectorOpen}
        onClose={() => setElementSelectorOpen(false)}
        element={selectedHTMLElement}
        onConfirm={handleElementConfirm}
      />
    </div>
  );
};

export default ScrapingStudio;
