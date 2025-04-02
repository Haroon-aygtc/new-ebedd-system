import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { X, Trash2, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  onAttributeChange,
}) => {
  const selectorTypes = [
    { value: "text", label: "Text" },
    { value: "html", label: "HTML" },
    { value: "attribute", label: "Attribute" },
    { value: "image", label: "Image" },
    { value: "link", label: "Link" },
    { value: "list", label: "List" },
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
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-3">
        {selectors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <div className="bg-muted rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium mb-2">No elements selected</p>
            <p className="text-sm mt-2">
              Click on elements in the preview to select them
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-3">
              {selectors.map((selector) => (
                <div
                  key={selector.id}
                  className="border rounded-md p-3 relative bg-card"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => onRemoveSelector(selector.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>

                  <div className="space-y-3 pr-6">
                    <div className="flex items-center gap-2">
                      {selector.aiGenerated && (
                        <Badge variant="secondary" className="mb-2">
                          AI Suggested
                        </Badge>
                      )}
                      <Badge variant="outline">{selector.type}</Badge>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <Label
                          htmlFor={`name-input-${selector.id}`}
                          className="text-xs font-medium"
                        >
                          Field Name
                        </Label>
                        <Input
                          id={`name-input-${selector.id}`}
                          type="text"
                          value={selector.name || ""}
                          onChange={(e) =>
                            onNameChange(selector.id, e.target.value)
                          }
                          className="w-full mt-1"
                          placeholder="Enter field name"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor={`type-select-${selector.id}`}
                          className="text-xs font-medium"
                        >
                          Extraction Type
                        </Label>
                        <Select
                          value={selector.type}
                          onValueChange={(value) =>
                            onTypeChange(selector.id, value)
                          }
                        >
                          <SelectTrigger
                            id={`type-select-${selector.id}`}
                            className="w-full mt-1"
                          >
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectorTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label
                          htmlFor={`selector-input-${selector.id}`}
                          className="text-xs font-medium"
                        >
                          CSS Selector
                        </Label>
                        <Input
                          id={`selector-input-${selector.id}`}
                          type="text"
                          value={selector.selector}
                          readOnly
                          className="w-full mt-1 font-mono text-sm bg-muted"
                        />
                      </div>

                      {selector.type === "attribute" && onAttributeChange && (
                        <div>
                          <Label
                            htmlFor={`attribute-input-${selector.id}`}
                            className="text-xs font-medium"
                          >
                            Attribute Name
                          </Label>
                          <Input
                            id={`attribute-input-${selector.id}`}
                            type="text"
                            value={selector.attribute || ""}
                            onChange={(e) =>
                              onAttributeChange(selector.id, e.target.value)
                            }
                            className="w-full mt-1"
                            placeholder="e.g., href, src, data-id"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default SelectorPanel;
