import React, { useRef, useEffect } from 'react';

interface BrowserPreviewProps {
  isLoading: boolean;
  url: string;
  onElementSelect?: (selector: string, element: HTMLElement) => void;
  isSelectMode: boolean;
}

const BrowserPreview: React.FC<BrowserPreviewProps> = ({
  isLoading,
  url,
  onElementSelect,
  isSelectMode
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Setup iframe for element selection
  useEffect(() => {
    if (!isSelectMode || !iframeRef.current) return;
    
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!iframeDoc) return;
    
    // Add styles for highlighting elements
    const style = iframeDoc.createElement('style');
    style.textContent = `
      .tempo-hovered {
        outline: 2px solid #3b82f6 !important;
        background-color: rgba(59, 130, 246, 0.1) !important;
      }
      .tempo-selected {
        outline: 2px solid #10b981 !important;
        background-color: rgba(16, 185, 129, 0.1) !important;
      }
    `;
    iframeDoc.head.appendChild(style);
    
    // Add event listeners for element selection
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'HTML' || target.tagName === 'BODY') return;
      
      // Remove previous hover class
      const previousHovered = iframeDoc.querySelector('.tempo-hovered');
      if (previousHovered) {
        previousHovered.classList.remove('tempo-hovered');
      }
      
      // Add hover class to current element
      target.classList.add('tempo-hovered');
    };
    
    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLElement;
      if (target.tagName === 'HTML' || target.tagName === 'BODY') return;
      
      // Generate a CSS selector for the element
      const selector = generateSelector(target);
      
      // Call the callback with the selector and element
      if (onElementSelect) {
        onElementSelect(selector, target);
      }
    };
    
    // Add event listeners to the iframe document
    iframeDoc.addEventListener('mouseover', handleMouseOver);
    iframeDoc.addEventListener('click', handleClick);
    
    // Cleanup function
    return () => {
      iframeDoc.removeEventListener('mouseover', handleMouseOver);
      iframeDoc.removeEventListener('click', handleClick);
    };
  }, [isSelectMode, onElementSelect]);
  
  // Handle messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      
      // Handle link clicks
      if (event.data.type === 'link-click' && event.data.href) {
        console.log('Link clicked in iframe:', event.data.href);
        // Handle link click
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  // Generate a CSS selector for an element
  const generateSelector = (element: HTMLElement): string => {
    // Simple implementation - in a real app, this would be more sophisticated
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ')
        .filter(c => c && !c.includes('tempo-'))
        .map(c => `.${c}`)
        .join('');
      
      if (classes) return classes;
    }
    
    // Fallback to tag name
    return element.tagName.toLowerCase();
  };
  
  return (
    <div className="relative w-full h-full bg-gray-100 rounded-md overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Loading {url}...</p>
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Web Preview"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
};

export default BrowserPreview;
