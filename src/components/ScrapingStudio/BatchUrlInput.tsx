import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, Upload, FileUp } from "lucide-react";

interface BatchUrlInputProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  onSubmit?: (urls: string[]) => void;
}

const BatchUrlInput: React.FC<BatchUrlInputProps> = ({
  urls,
  onChange,
  disabled = false,
  onSubmit,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddUrls = () => {
    if (!inputValue.trim()) return;

    // Split by newlines and filter out empty lines
    const newUrls = inputValue
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    // Add to existing URLs, removing duplicates
    const combinedUrls = [...new Set([...urls, ...newUrls])];
    onChange(combinedUrls);
    setInputValue("");
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    const filteredUrls = urls.filter((url) => url !== urlToRemove);
    onChange(filteredUrls);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const fileUrls = content
          .split("\n")
          .map((url) => url.trim())
          .filter((url) => url.length > 0);

        // Add to existing URLs, removing duplicates
        const combinedUrls = [...new Set([...urls, ...fileUrls])];
        onChange(combinedUrls);
      }
    };
    reader.readAsText(file);
    // Reset the input value so the same file can be uploaded again
    event.target.value = "";
  };

  const handleSubmit = () => {
    if (onSubmit && urls.length > 0) {
      onSubmit(urls);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Enter URLs (one per line)</Label>
        <Textarea
          placeholder="https://example.com\nhttps://another-example.com"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="min-h-[100px]"
          disabled={disabled}
        />
      </div>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={handleAddUrls}
          disabled={!inputValue.trim() || disabled}
        >
          <Upload className="mr-2 h-4 w-4" />
          Add URLs
        </Button>

        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 opacity-0 w-full cursor-pointer"
            accept=".txt,.csv"
            onChange={handleFileUpload}
            disabled={disabled}
          />
          <Button variant="outline" disabled={disabled}>
            <FileUp className="mr-2 h-4 w-4" />
            Upload URL List
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>URL List ({urls.length})</Label>
          {urls.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
              disabled={disabled}
            >
              Clear All
            </Button>
          )}
        </div>

        {urls.length > 0 ? (
          <ScrollArea className="h-[200px] border rounded-md p-2">
            <div className="space-y-2">
              {urls.map((url, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-muted/50 rounded-md"
                >
                  <span className="text-sm truncate flex-1">{url}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveUrl(url)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="border rounded-md p-4 text-center text-muted-foreground">
            No URLs added yet. Enter URLs above or upload a file.
          </div>
        )}
      </div>

      {onSubmit && (
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={urls.length === 0 || disabled}
          >
            Process {urls.length} URLs
          </Button>
        </div>
      )}
    </div>
  );
};

export default BatchUrlInput;
