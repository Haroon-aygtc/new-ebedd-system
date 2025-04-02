import React, { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SelectedElement } from "@/types/scraping";

interface BrowserPreviewProps {
  content: string;
  isLoading: boolean;
  showSelector: boolean;
  selectedElements: SelectedElement[];
  onElementSelect: (element: HTMLElement) => void;
}

export const BrowserPreview: React.FC<BrowserPreviewProps> = ({
  content,
  isLoading,
  showSelector,
  selectedElements,
  onElementSelect,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState("100%");

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !content) return;

    const handleLoad = () => {
      try {
        const iframeDocument =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDocument) return;

        // Add custom styles to highlight selected elements
        const style = iframeDocument.createElement("style");
        style.textContent = `
          .tempo-element-highlight {
            outline: 2px solid #3b82f6 !important;
            outline-offset: 2px !important;
            background-color: rgba(59, 130, 246, 0.1) !important;
          }
          .tempo-element-selected {
            outline: 2px solid #10b981 !important;
            outline-offset: 2px !important;
            background-color: rgba(16, 185, 129, 0.1) !important;
          }
          * {
            cursor: ${showSelector ? "pointer" : "auto"} !important;
          }
        `;
        iframeDocument.head.appendChild(style);

        // Highlight already selected elements
        selectedElements.forEach((element) => {
          try {
            const elements = iframeDocument.querySelectorAll(element.selector);
            elements.forEach((el) => {
              el.classList.add("tempo-element-selected");
            });
          } catch (err) {
            console.error("Error highlighting selected element:", err);
          }
        });

        // Add event listeners for element selection
        if (showSelector) {
          const addHoverEffect = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains("tempo-element-highlight")) {
              target.classList.remove("tempo-element-highlight");
            }
            target.classList.add("tempo-element-highlight");
          };

          const removeHoverEffect = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            target.classList.remove("tempo-element-highlight");
          };

          const handleElementClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const target = e.target as HTMLElement;
            onElementSelect(target);
            target.classList.remove("tempo-element-highlight");
            target.classList.add("tempo-element-selected");
          };

          iframeDocument.body.addEventListener("mouseover", addHoverEffect);
          iframeDocument.body.addEventListener("mouseout", removeHoverEffect);
          iframeDocument.body.addEventListener("click", handleElementClick);

          return () => {
            iframeDocument.body.removeEventListener(
              "mouseover",
              addHoverEffect,
            );
            iframeDocument.body.removeEventListener(
              "mouseout",
              removeHoverEffect,
            );
            iframeDocument.body.removeEventListener(
              "click",
              handleElementClick,
            );
          };
        }
      } catch (err) {
        console.error("Error setting up iframe:", err);
      }
    };

    iframe.addEventListener("load", handleLoad);
    return () => {
      iframe.removeEventListener("load", handleLoad);
    };
  }, [content, showSelector, selectedElements, onElementSelect]);

  return (
    <div className="h-full w-full bg-background">
      {isLoading ? (
        <div className="h-full flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Loading page content...</p>
          <p className="text-sm text-muted-foreground mt-2">
            This may take a few moments depending on the page size
          </p>
        </div>
      ) : content ? (
        <iframe
          ref={iframeRef}
          srcDoc={content}
          className="w-full h-full border-0"
          sandbox="allow-same-origin"
          title="Browser Preview"
        />
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
          <p className="text-lg">No content loaded</p>
          <p className="text-sm mt-2">
            Enter a URL and click "Load URL" to begin
          </p>
        </div>
      )}
    </div>
  );
};

export default BrowserPreview;
