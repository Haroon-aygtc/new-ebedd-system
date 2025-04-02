import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, StopCircle, Download, MousePointer } from "lucide-react";

interface ScrapingHeaderProps {
  isScraping: boolean;
  onStartScraping: () => void;
  onStopScraping: () => void;
  onExport: () => void;
  isStartDisabled: boolean;
  isSelectMode?: boolean;
  onToggleSelectMode?: () => void;
}

const ScrapingHeader: React.FC<ScrapingHeaderProps> = ({
  isScraping,
  onStartScraping,
  onStopScraping,
  onExport,
  isStartDisabled,
  isSelectMode = false,
  onToggleSelectMode,
}) => {
  return (
    <CardHeader>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-2xl">Scraping Studio</CardTitle>
          <CardDescription>
            Configure and visualize your web scraping process
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {onToggleSelectMode && (
            <Button
              variant={isSelectMode ? "secondary" : "outline"}
              onClick={onToggleSelectMode}
              title="Toggle element selection mode"
              className="relative" // Added for highlighting
            >
              <MousePointer className="mr-2 h-4 w-4" />
              {isSelectMode ? "Selection Mode: ON" : "Select Elements"}
              {/* Add a subtle highlight to make the button more noticeable */}
              {!isSelectMode && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              )}
            </Button>
          )}
          {isScraping ? (
            <Button variant="destructive" onClick={onStopScraping}>
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Scraping
            </Button>
          ) : (
            <Button onClick={onStartScraping} disabled={isStartDisabled}>
              <Play className="mr-2 h-4 w-4" />
              Start Scraping
            </Button>
          )}
          <Button variant="outline" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default ScrapingHeader;
