import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SelectedElement } from "@/types/scraping";

interface ElementSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  element: HTMLElement | null;
  onConfirm: (element: SelectedElement) => void;
}

export const ElementSelector: React.FC<ElementSelectorProps> = ({
  isOpen,
  onClose,
  element,
  onConfirm,
}) => {
  const [elementName, setElementName] = useState("");
  const [extractionType, setExtractionType] = useState("text");
  const [attribute, setAttribute] = useState("");
  const [selector, setSelector] = useState("");

  React.useEffect(() => {
    if (element) {
      // Generate a CSS selector for the element
      let generatedSelector = "";

      // Try to use ID if available
      if (element.id) {
        generatedSelector = `#${element.id}`;
      } else {
        // Otherwise, create a selector based on tag and classes
        const tagName = element.tagName.toLowerCase();
        const classes = Array.from(element.classList).join(".");
        generatedSelector = classes ? `${tagName}.${classes}` : tagName;

        // Add nth-child if needed for more specificity
        if (element.parentElement) {
          const siblings = Array.from(element.parentElement.children);
          const index = siblings.indexOf(element);
          if (index !== -1) {
            generatedSelector += `:nth-child(${index + 1})`;
          }
        }
      }

      setSelector(generatedSelector);

      // Set default name based on element content or tag
      const elementText = element.textContent?.trim().substring(0, 20) || "";
      setElementName(elementText || element.tagName.toLowerCase());

      // Suggest extraction type based on element
      if (element.tagName === "IMG") {
        setExtractionType("attribute");
        setAttribute("src");
      } else if (element.tagName === "A") {
        setExtractionType("attribute");
        setAttribute("href");
      } else {
        setExtractionType("text");
        setAttribute("");
      }
    }
  }, [element]);

  const handleConfirm = () => {
    if (!selector) return;

    onConfirm({
      name: elementName,
      selector,
      type: extractionType,
      attribute: extractionType === "attribute" ? attribute : undefined,
    });

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setElementName("");
    setExtractionType("text");
    setAttribute("");
    setSelector("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure Element Selection</DialogTitle>
          <DialogDescription>
            Customize how this element will be scraped
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="element-name" className="text-right">
              Name
            </Label>
            <Input
              id="element-name"
              value={elementName}
              onChange={(e) => setElementName(e.target.value)}
              className="col-span-3"
              placeholder="Element name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="selector" className="text-right">
              Selector
            </Label>
            <Input
              id="selector"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              className="col-span-3"
              placeholder="CSS selector"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Extract</Label>
            <RadioGroup
              value={extractionType}
              onValueChange={setExtractionType}
              className="col-span-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="extract-text" />
                <Label htmlFor="extract-text">Text content</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="html" id="extract-html" />
                <Label htmlFor="extract-html">HTML content</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="attribute" id="extract-attr" />
                <Label htmlFor="extract-attr">Attribute</Label>
              </div>
            </RadioGroup>
          </div>
          {extractionType === "attribute" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="attribute" className="text-right">
                Attribute
              </Label>
              <Input
                id="attribute"
                value={attribute}
                onChange={(e) => setAttribute(e.target.value)}
                className="col-span-3"
                placeholder="e.g., href, src, alt"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              !selector || (extractionType === "attribute" && !attribute)
            }
          >
            Add Element
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ElementSelector;
