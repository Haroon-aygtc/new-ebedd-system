import React, { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/luxury-card";
import { Loader2, MousePointer, Globe, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/luxury-button";

interface LuxuryBrowserPreviewProps {
  isLoading: boolean;
  url: string;
  onElementSelect: (selector: string, element: HTMLElement) => void;
  isSelectMode: boolean;
  onRefresh?: () => void;
}

const LuxuryBrowserPreview: React.FC<LuxuryBrowserPreviewProps> = ({
  isLoading,
  url,
  onElementSelect,
  isSelectMode,
  onRefresh,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(
    null,
  );
  const [selectedCount, setSelectedCount] = useState(0);

  // Function to generate a CSS selector for an element
  const generateSelector = (element: HTMLElement): string => {
    if (element.id) {
      return `#${element.id}`;
    }

    let selector = element.tagName.toLowerCase();
    if (element.className) {
      const classes = element.className
        .split(" ")
        .filter((c) => c && !c.includes("tempo-"));
      if (classes.length > 0) {
        selector += `.${classes.join(".")}`;
      }
    }

    return selector;
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setupIframeInteractions();
  };

  // Setup interactions within the iframe
  const setupIframeInteractions = () => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDoc) return;

    // Remove any existing event listeners
    const cleanup = () => {
      iframeDoc.removeEventListener("mouseover", handleMouseOver);
      iframeDoc.removeEventListener("mouseout", handleMouseOut);
      iframeDoc.removeEventListener("click", handleClick);
    };

    // Add event listeners if in select mode
    if (isSelectMode) {
      // Prevent default link behavior
      const links = iframeDoc.querySelectorAll("a");
      links.forEach((link) => {
        link.addEventListener("click", (e) => {
          if (isSelectMode) {
            e.preventDefault();
            e.stopPropagation();
          }
        });
      });

      // Add mouseover, mouseout, and click handlers
      iframeDoc.addEventListener("mouseover", handleMouseOver);
      iframeDoc.addEventListener("mouseout", handleMouseOut);
      iframeDoc.addEventListener("click", handleClick);

      // Add a visual indicator that select mode is active
      const selectModeIndicator = iframeDoc.createElement("div");
      selectModeIndicator.id = "select-mode-indicator";
      selectModeIndicator.style.position = "fixed";
      selectModeIndicator.style.top = "10px";
      selectModeIndicator.style.right = "10px";
      selectModeIndicator.style.backgroundColor = "rgba(37, 65, 146, 0.9)";
      selectModeIndicator.style.color = "white";
      selectModeIndicator.style.padding = "10px 16px";
      selectModeIndicator.style.borderRadius = "8px";
      selectModeIndicator.style.zIndex = "9999";
      selectModeIndicator.style.display = "flex";
      selectModeIndicator.style.alignItems = "center";
      selectModeIndicator.style.gap = "8px";
      selectModeIndicator.style.fontSize = "14px";
      selectModeIndicator.style.fontFamily =
        "'Inter var', system-ui, -apple-system, sans-serif";
      selectModeIndicator.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
      selectModeIndicator.style.backdropFilter = "blur(4px)";
      selectModeIndicator.style.border = "1px solid rgba(255, 255, 255, 0.2)";
      selectModeIndicator.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
          <path d="m13 13 6 6"/>
        </svg>
        <span>Selection Mode Active</span>
        <span style="display: inline-flex; align-items: center; justify-content: center; background-color: rgba(255, 255, 255, 0.2); border-radius: 4px; min-width: 20px; height: 20px; padding: 0 6px; margin-left: 4px; font-size: 12px;">${selectedCount}</span>
      `;
      iframeDoc.body.appendChild(selectModeIndicator);

      return () => {
        cleanup();
        if (iframeDoc.body.contains(selectModeIndicator)) {
          iframeDoc.body.removeChild(selectModeIndicator);
        }
      };
    } else {
      cleanup();
    }
  };

  // Handle mouse over event
  const handleMouseOver = (e: Event) => {
    if (!isSelectMode) return;
    const target = e.target as HTMLElement;

    // Skip body and html elements
    if (
      target.tagName.toLowerCase() === "body" ||
      target.tagName.toLowerCase() === "html"
    ) {
      return;
    }

    // Add highlight
    target.style.outline = "2px solid #4179d0";
    target.style.outlineOffset = "-2px";
    target.style.cursor = "pointer";
    target.style.transition = "all 0.2s ease";
    target.style.boxShadow = "0 0 0 4px rgba(65, 121, 208, 0.3)";

    setHoveredElement(target);
    e.stopPropagation();
  };

  // Handle mouse out event
  const handleMouseOut = (e: Event) => {
    if (!isSelectMode) return;
    const target = e.target as HTMLElement;

    // Remove highlight
    target.style.outline = "";
    target.style.outlineOffset = "";
    target.style.cursor = "";
    target.style.boxShadow = "";

    setHoveredElement(null);
    e.stopPropagation();
  };

  // Handle click event
  const handleClick = (e: Event) => {
    if (!isSelectMode) return;
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    const selector = generateSelector(target);
    onElementSelect(selector, target);
    setSelectedCount((prev) => prev + 1);

    // Add a visual feedback for selection
    const originalBackground = target.style.backgroundColor;
    const originalTransition = target.style.transition;

    target.style.transition = "background-color 0.3s ease";
    target.style.backgroundColor = "rgba(29, 185, 129, 0.2)";

    setTimeout(() => {
      target.style.backgroundColor = originalBackground;
      target.style.transition = originalTransition;
    }, 500);
  };

  // Update iframe interactions when select mode changes
  useEffect(() => {
    if (iframeLoaded) {
      return setupIframeInteractions();
    }
  }, [isSelectMode, iframeLoaded, selectedCount]);

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex items-center justify-between bg-luxury-50 border-b border-luxury-100 p-2 rounded-t-lg">
        <div className="flex items-center space-x-2 px-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-luxury-300" />
            <div className="w-3 h-3 rounded-full bg-luxury-300" />
            <div className="w-3 h-3 rounded-full bg-luxury-300" />
          </div>
          <div className="flex items-center bg-white border border-luxury-200 rounded-md px-2 py-1 flex-1 max-w-md">
            <Globe className="h-3 w-3 text-luxury-500 mr-2" />
            <span className="text-xs truncate text-luxury-700">
              {url || "Enter a URL to begin"}
            </span>
          </div>
        </div>

        {onRefresh && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            className="h-7 px-2"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex flex-col items-center"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Loader2 className="h-10 w-10 animate-spin text-navy-600" />
              <p className="mt-4 text-sm font-medium text-navy-800">
                Loading content...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSelectMode && (
          <motion.div
            className="absolute top-12 left-4 z-10 flex items-center gap-2 bg-navy-600 text-white px-4 py-2 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <MousePointer className="h-4 w-4" />
            <span className="text-sm font-medium">
              Click on elements to select them
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-hidden bg-white border-x border-b border-luxury-100 rounded-b-lg">
        <iframe
          ref={iframeRef}
          src={
            url ? `/api/proxy/url?url=${encodeURIComponent(url)}` : undefined
          }
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          title="Browser Preview"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
};

export default LuxuryBrowserPreview;
