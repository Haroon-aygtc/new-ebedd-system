import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';

interface ScrapedItem {
  url: string;
  data: Array<{
    name: string;
    selector: string;
    type: string;
    value: string | string[];
  }>;
  timestamp: string;
  error?: string;
}

interface ResultsPanelProps {
  results: ScrapedItem[];
  onExport: (format: string) => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, onExport }) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  const formatValue = (value: string | string[]) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Scraped Results</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExport('json')}
              disabled={results.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExport('csv')}
              disabled={results.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-3">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <p>No data scraped yet</p>
            <p className="text-sm mt-2">Select elements and start scraping to see results here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((item, index) => (
              <div key={index} className="border rounded-md overflow-hidden">
                <div 
                  className="bg-muted p-3 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleExpand(index)}
                >
                  <div>
                    <div className="font-medium truncate max-w-md">{item.url}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(JSON.stringify(item.data, null, 2));
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                {expandedItems.has(index) && (
                  <div className="p-3">
                    {item.error ? (
                      <div className="text-red-500 p-2 bg-red-50 rounded">
                        Error: {item.error}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {item.data.map((field, fieldIndex) => (
                          <div key={fieldIndex} className="border-b pb-2 last:border-b-0 last:pb-0">
                            <div className="font-medium">{field.name}</div>
                            <div className="text-xs text-muted-foreground mb-1">
                              {field.selector} ({field.type})
                            </div>
                            <div className="bg-gray-50 p-2 rounded text-sm break-words">
                              {formatValue(field.value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsPanel;
