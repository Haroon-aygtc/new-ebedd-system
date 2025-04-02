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
          <CardTitle className="text-2xl font-bold">Web Scraper</CardTitle>
          <CardDescription>
            Extract structured data from websites
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {onToggleSelectMode && (
            <Button
              variant={isSelectMode ? "default" : "outline"}
              onClick={onToggleSelectMode}
              title="Toggle element selection mode"
              className="relative bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
            >
              <MousePointer className="mr-2 h-4 w-4" />
              {isSelectMode ? "Selection Mode: ON" : "Select Elements"}
              {/* Add a subtle highlight to make the button more noticeable */}
              {!isSelectMode && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
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
            <Button
              onClick={onStartScraping}
              disabled={isStartDisabled}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
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
