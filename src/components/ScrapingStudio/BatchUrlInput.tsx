import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Check, List, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BatchUrlInputProps {
  onSubmit: (urls: string[]) => void;
  onCancel: () => void;
}

const BatchUrlInput: React.FC<BatchUrlInputProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [urlInput, setUrlInput] = useState<string>("");
  const [parsedUrls, setParsedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUrlInput(e.target.value);
    setError("");
  };

  const parseUrls = () => {
    // Split by newlines, commas, or spaces and filter out empty strings
    const urls = urlInput
      .split(/[\n,\s]+/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    // Validate URLs
    const validUrls: string[] = [];
    const invalidUrls: string[] = [];

    urls.forEach((url) => {
      try {
        // Add http:// if missing
        let processedUrl = url;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          processedUrl = "https://" + url;
        }

        // Check if it's a valid URL
        new URL(processedUrl);
        validUrls.push(processedUrl);
      } catch (e) {
        invalidUrls.push(url);
      }
    });

    if (invalidUrls.length > 0) {
      setError(
        `Found ${invalidUrls.length} invalid URLs: ${invalidUrls.join(", ")}`,
      );
    }

    if (validUrls.length === 0) {
      setError("No valid URLs found. Please enter at least one valid URL.");
      return;
    }

    setParsedUrls(validUrls);
  };

  const handleSubmit = () => {
    if (parsedUrls.length === 0) {
      parseUrls();
      return;
    }
    onSubmit(parsedUrls);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <List className="mr-2 h-5 w-5" />
          Batch URL Processing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="urls" className="block text-sm font-medium mb-1">
              Enter URLs (one per line, or comma/space separated)
            </label>
            <Textarea
              id="urls"
              placeholder="https://example.com\nhttps://another-site.com"
              rows={6}
              value={urlInput}
              onChange={handleInputChange}
              className="font-mono text-sm"
            />
          </div>

          {error && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {parsedUrls.length > 0 && (
            <div className="border rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Parsed URLs</h3>
                <Badge variant="outline">{parsedUrls.length} URLs</Badge>
              </div>
              <ScrollArea className="h-40">
                <ul className="space-y-1">
                  {parsedUrls.map((url, index) => (
                    <li
                      key={index}
                      className="text-sm font-mono flex items-center"
                    >
                      <Check className="h-3 w-3 text-green-500 mr-2" />
                      {url}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="space-x-2">
          {parsedUrls.length === 0 && (
            <Button variant="secondary" onClick={parseUrls}>
              Parse URLs
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={urlInput.trim().length === 0}
          >
            <Upload className="mr-2 h-4 w-4" />
            {parsedUrls.length > 0 ? "Process URLs" : "Continue"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BatchUrlInput;
