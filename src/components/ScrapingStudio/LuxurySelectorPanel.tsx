import React from "react";
import { Button } from "@/components/ui/luxury-button";
import { Badge } from "@/components/ui/luxury-badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/luxury-card";
import { X, Trash2, Plus, Code, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/luxury-input";
import { motion, AnimatePresence } from "framer-motion";

interface Selector {
  id: string;
  selector: string;
  type: string;
  name?: string;
  attribute?: string;
  aiGenerated?: boolean;
}

interface LuxurySelectorPanelProps {
  selectors: Selector[];
  onRemoveSelector: (id: string) => void;
  onClearSelectors: () => void;
  onTypeChange: (id: string, type: string) => void;
  onNameChange: (id: string, name: string) => void;
  onAttributeChange?: (id: string, attribute: string) => void;
}

const LuxurySelectorPanel: React.FC<LuxurySelectorPanelProps> = ({
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "navy";
      case "html":
        return "luxury";
      case "attribute":
        return "gold";
      case "image":
        return "emerald";
      case "link":
        return "navy";
      case "list":
        return "gold";
      default:
        return "luxury";
    }
  };

  return (
    <Card className="h-full flex flex-col bg-white shadow-luxury">
      <CardHeader className="pb-2 bg-gradient-to-r from-luxury-50 to-white border-b border-luxury-100">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-display text-navy-900">
            Selected Elements
          </CardTitle>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClearSelectors}
            disabled={selectors.length === 0}
            className="h-8"
          >
            <X className="mr-2 h-3 w-3" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-3">
        {selectors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-luxury-500 p-4">
            <div className="bg-luxury-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Plus className="h-8 w-8 text-luxury-400" />
            </div>
            <p className="font-medium mb-2 text-luxury-700">
              No elements selected
            </p>
            <p className="text-sm mt-2 max-w-xs">
              Click on elements in the preview to select them for data
              extraction
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full pr-2">
            <AnimatePresence initial={false}>
              <div className="space-y-4">
                {selectors.map((selector, index) => (
                  <motion.div
                    key={selector.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      delay: index * 0.05,
                    }}
                    className="border rounded-lg p-4 relative bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full hover:bg-luxury-100"
                      onClick={() => onRemoveSelector(selector.id)}
                    >
                      <Trash2 className="h-4 w-4 text-luxury-500" />
                    </Button>

                    <div className="space-y-4 pr-6">
                      <div className="flex items-center gap-2">
                        {selector.aiGenerated && (
                          <Badge
                            variant="gold"
                            animation="pulse"
                            className="mb-1 flex items-center gap-1"
                          >
                            <Sparkles className="h-3 w-3" />
                            AI Suggested
                          </Badge>
                        )}
                        <Badge variant={getTypeColor(selector.type)}>
                          {selector.type.charAt(0).toUpperCase() +
                            selector.type.slice(1)}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label
                            htmlFor={`name-input-${selector.id}`}
                            className="text-xs font-medium text-luxury-700 mb-1 block"
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
                            className="w-full"
                            placeholder="Enter field name"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor={`type-select-${selector.id}`}
                            className="text-xs font-medium text-luxury-700 mb-1 block"
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
                              className="w-full bg-luxury-50 border-luxury-200"
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
                            className="text-xs font-medium text-luxury-700 mb-1 block flex items-center gap-1"
                          >
                            <Code className="h-3 w-3" />
                            CSS Selector
                          </Label>
                          <div className="relative">
                            <Input
                              id={`selector-input-${selector.id}`}
                              type="text"
                              value={selector.selector}
                              readOnly
                              className="w-full font-mono text-sm bg-navy-50 text-navy-800 border-navy-200"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <Badge
                                variant="navy"
                                className="h-5 px-1.5 text-[10px]"
                              >
                                CSS
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {selector.type === "attribute" && onAttributeChange && (
                          <div>
                            <Label
                              htmlFor={`attribute-input-${selector.id}`}
                              className="text-xs font-medium text-luxury-700 mb-1 block"
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
                              className="w-full"
                              placeholder="e.g., href, src, data-id"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default LuxurySelectorPanel;
