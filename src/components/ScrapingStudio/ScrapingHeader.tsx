import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, StopCircle, Download } from 'lucide-react';

interface ScrapingHeaderProps {
  isScraping: boolean;
  onStartScraping: () => void;
  onStopScraping: () => void;
  onExport: () => void;
  isStartDisabled: boolean;
}

const ScrapingHeader: React.FC<ScrapingHeaderProps> = ({
  isScraping,
  onStartScraping,
  onStopScraping,
  onExport,
  isStartDisabled
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
          {isScraping ? (
            <Button variant="destructive" onClick={onStopScraping}>
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Scraping
            </Button>
          ) : (
            <Button
              onClick={onStartScraping}
              disabled={isStartDisabled}
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
