import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

interface Selector {
  id: string;
  selector: string;
  type: string;
  name?: string;
  attribute?: string;
  aiGenerated?: boolean;
}

interface SelectorPanelProps {
  selectors: Selector[];
  onRemoveSelector: (id: string) => void;
  onClearSelectors: () => void;
  onTypeChange: (id: string, type: string) => void;
  onNameChange: (id: string, name: string) => void;
  onAttributeChange?: (id: string, attribute: string) => void;
}

const SelectorPanel: React.FC<SelectorPanelProps> = ({
  selectors,
  onRemoveSelector,
  onClearSelectors,
  onTypeChange,
  onNameChange,
  onAttributeChange
}) => {
  const selectorTypes = [
    { value: 'text', label: 'Text' },
    { value: 'html', label: 'HTML' },
    { value: 'attribute', label: 'Attribute' },
    { value: 'image', label: 'Image' },
    { value: 'link', label: 'Link' },
    { value: 'list', label: 'List' }
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Selected Elements</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearSelectors}
            disabled={selectors.length === 0}
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-3">
        {selectors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <p>No elements selected</p>
            <p className="text-sm mt-2">Click on elements in the preview to select them</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectors.map((selector) => (
              <div key={selector.id} className="border rounded-md p-3 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => onRemoveSelector(selector.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="space-y-2 pr-6">
                  {selector.aiGenerated && (
                    <Badge variant="secondary" className="mb-2">AI Suggested</Badge>
                  )}
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label htmlFor={`name-input-${selector.id}`} className="text-xs font-medium">Name</label>
                      <input
                        id={`name-input-${selector.id}`}
                        type="text"
                        value={selector.name || ''}
                        onChange={(e) => onNameChange(selector.id, e.target.value)}
                        className="w-full p-1 text-sm border rounded"
                        placeholder="Field name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor={`type-select-${selector.id}`} className="text-xs font-medium">Type</label>
                      <select
                        id={`type-select-${selector.id}`}
                        value={selector.type}
                        onChange={(e) => onTypeChange(selector.id, e.target.value)}
                        className="w-full p-1 text-sm border rounded"
                      >
                        {selectorTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor={`selector-input-${selector.id}`} className="text-xs font-medium">Selector</label>
                    <input
                      id={`selector-input-${selector.id}`}
                      type="text"
                      value={selector.selector}
                      readOnly
                      className="w-full p-1 text-sm border rounded bg-gray-50"
                    />
                  </div>
                  
                  {selector.type === 'attribute' && onAttributeChange && (
                    <div>
                      <label htmlFor={`attribute-input-${selector.id}`} className="text-xs font-medium">Attribute Name</label>
                      <input
                        id={`attribute-input-${selector.id}`}
                        type="text"
                        value={selector.attribute || ''}
                        onChange={(e) => onAttributeChange(selector.id, e.target.value)}
                        className="w-full p-1 text-sm border rounded"
                        placeholder="e.g., href, src, data-id"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SelectorPanel;
