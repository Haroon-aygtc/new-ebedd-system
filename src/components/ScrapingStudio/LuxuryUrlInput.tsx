import React, { useState } from "react";
import { Input } from "@/components/ui/luxury-input";
import { Button } from "@/components/ui/luxury-button";
import { Search, History, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LuxuryUrlInputProps {
  onLoadUrl: (url: string) => void;
  disabled?: boolean;
}

const LuxuryUrlInput: React.FC<LuxuryUrlInputProps> = ({
  onLoadUrl,
  disabled = false,
}) => {
  const [url, setUrl] = useState("");
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || disabled) return;

    // Add to recent URLs if not already there
    if (!recentUrls.includes(url)) {
      setRecentUrls((prev) => [url, ...prev].slice(0, 5));
    }

    onLoadUrl(url);
  };

  const handleSelectRecent = (recentUrl: string) => {
    setUrl(recentUrl);
    setShowRecent(false);
    onLoadUrl(recentUrl);
  };

  const handleClearRecent = () => {
    setRecentUrls([]);
    setShowRecent(false);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to scrape (e.g., https://example.com)"
            disabled={disabled}
            className="pl-10 pr-10 h-12 border-luxury-200"
            withMotion
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-luxury-400" />
          </div>
          {recentUrls.length > 0 && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowRecent(!showRecent)}
            >
              <History className="h-4 w-4 text-luxury-400 hover:text-luxury-600 transition-colors" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={!url.trim() || disabled} withMotion>
          Load URL
        </Button>
      </form>

      <AnimatePresence>
        {showRecent && recentUrls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-luxury border border-luxury-100 overflow-hidden"
          >
            <div className="p-2 border-b border-luxury-100 flex justify-between items-center">
              <span className="text-sm font-medium text-luxury-700">
                Recent URLs
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearRecent}
                className="h-7 px-2 text-xs hover:bg-luxury-100"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
            <ul className="max-h-60 overflow-auto">
              {recentUrls.map((recentUrl, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectRecent(recentUrl)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-luxury-50 transition-colors flex items-center gap-2 text-luxury-800"
                  >
                    <History className="h-3 w-3 text-luxury-400" />
                    <span className="truncate">{recentUrl}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LuxuryUrlInput;
