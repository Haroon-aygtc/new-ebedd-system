import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/luxury-card";
import { Button } from "@/components/ui/luxury-button";
import {
  Play,
  StopCircle,
  Download,
  MousePointer,
  Database,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/luxury-badge";

interface LuxuryScrapingHeaderProps {
  isScraping: boolean;
  onStartScraping: () => void;
  onStopScraping: () => void;
  onExport: () => void;
  isStartDisabled: boolean;
  isSelectMode?: boolean;
  onToggleSelectMode?: () => void;
  onOpenSettings?: () => void;
  selectedElementsCount?: number;
}

const LuxuryScrapingHeader: React.FC<LuxuryScrapingHeaderProps> = ({
  isScraping,
  onStartScraping,
  onStopScraping,
  onExport,
  isStartDisabled,
  isSelectMode = false,
  onToggleSelectMode,
  onOpenSettings,
  selectedElementsCount = 0,
}) => {
  return (
    <CardHeader className="bg-gradient-to-r from-luxury-50 to-white border-b border-luxury-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl font-bold font-display text-navy-900">
              <span className="gradient-text-navy">Web Scraper</span>
            </CardTitle>
            <Badge variant="navy" className="hidden md:flex">
              Intelligent Studio
            </Badge>
          </div>
          <CardDescription className="text-luxury-700 mt-1">
            Extract structured data from websites with precision
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          {onToggleSelectMode && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant={isSelectMode ? "default" : "secondary"}
                onClick={onToggleSelectMode}
                title="Toggle element selection mode"
                className="relative"
                withMotion
              >
                <MousePointer className="mr-2 h-4 w-4" />
                {isSelectMode ? "Selection Mode: ON" : "Select Elements"}
                {!isSelectMode && selectedElementsCount === 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-gold-500"></span>
                  </span>
                )}
              </Button>
            </motion.div>
          )}

          {isScraping ? (
            <Button variant="destructive" onClick={onStopScraping} withMotion>
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Scraping
            </Button>
          ) : (
            <Button
              variant="emerald"
              onClick={onStartScraping}
              disabled={isStartDisabled}
              withMotion
            >
              <Play className="mr-2 h-4 w-4" />
              Start Scraping
            </Button>
          )}

          <Button variant="gold" onClick={onExport} withMotion>
            <Database className="mr-2 h-4 w-4" />
            Export Data
          </Button>

          {onOpenSettings && (
            <Button
              variant="outline"
              size="icon"
              onClick={onOpenSettings}
              className="hidden md:flex"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {selectedElementsCount > 0 && (
        <div className="mt-2 flex items-center">
          <Badge variant="luxury" className="text-xs">
            {selectedElementsCount} element
            {selectedElementsCount !== 1 ? "s" : ""} selected
          </Badge>
        </div>
      )}
    </CardHeader>
  );
};

export default LuxuryScrapingHeader;
