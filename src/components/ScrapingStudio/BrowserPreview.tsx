import React, { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, MousePointer } from "lucide-react";

interface BrowserPreviewProps {
  isLoading: boolean;
  url: string;
  onElementSelect: (selector: string, element: HTMLElement) => void;
  isSelectMode: boolean;
}

const BrowserPreview: React.FC<BrowserPreviewProps> = ({
  isLoading,
  url,
  onElementSelect,
  isSelectMode,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

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
      selectModeIndicator.style.backgroundColor = "rgba(99, 102, 241, 0.8)";
      selectModeIndicator.style.color = "white";
      selectModeIndicator.style.padding = "8px 12px";
      selectModeIndicator.style.borderRadius = "4px";
      selectModeIndicator.style.zIndex = "9999";
      selectModeIndicator.style.display = "flex";
      selectModeIndicator.style.alignItems = "center";
      selectModeIndicator.style.gap = "8px";
      selectModeIndicator.style.fontSize = "14px";
      selectModeIndicator.style.fontFamily =
        "system-ui, -apple-system, sans-serif";
      selectModeIndicator.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
          <path d="m13 13 6 6"/>
        </svg>
        Selection Mode Active
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
    target.style.outline = "2px solid #6366f1";
    target.style.outlineOffset = "-2px";
    target.style.cursor = "pointer";

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
  };

  // Update iframe interactions when select mode changes
  useEffect(() => {
    if (iframeLoaded) {
      return setupIframeInteractions();
    }
  }, [isSelectMode, iframeLoaded]);

  return (
    <div className="relative w-full h-full flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">
              Loading content...
            </p>
          </div>
        </div>
      )}

      {isSelectMode && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm">
          <MousePointer className="h-4 w-4" />
          <span>Click on elements to select them</span>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
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

export default BrowserPreview;
