import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { List, Compass } from 'lucide-react';

interface BatchUrlsBarProps {
  urls: string[];
  currentUrlIndex: number;
  onOpenBatchDialog: () => void;
  onOpenDiscoveryDialog: () => void;
  disabled?: boolean;
}

const BatchUrlsBar: React.FC<BatchUrlsBarProps> = ({
  urls,
  currentUrlIndex,
  onOpenBatchDialog,
  onOpenDiscoveryDialog,
  disabled = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onOpenBatchDialog}
          disabled={disabled}
        >
          <List className="mr-2 h-4 w-4" />
          Batch URLs
        </Button>
        <Button
          variant="outline"
          onClick={onOpenDiscoveryDialog}
          disabled={disabled}
        >
          <Compass className="mr-2 h-4 w-4" />
          Discover URLs
        </Button>
      </div>

      {urls.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center">
            <List className="mr-1 h-3 w-3" />
            {urls.length} URLs in queue
          </Badge>
          {currentUrlIndex > 0 && (
            <Badge variant="outline">
              URL {currentUrlIndex + 1} of {urls.length}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchUrlsBar;
