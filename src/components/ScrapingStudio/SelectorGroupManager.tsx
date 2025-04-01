import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Check,
  Edit,
  Layers,
  Plus,
  Save,
  Trash,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectorGroup {
  id: string;
  name: string;
  description?: string;
  selectors: Array<{
    id: string;
    selector: string;
    type: string;
    name?: string;
  }>;
}

interface SelectorGroupManagerProps {
  currentSelectors: Array<{
    id: string;
    selector: string;
    type: string;
    name?: string;
  }>;
  savedGroups: SelectorGroup[];
  onSaveGroup: (group: SelectorGroup) => void;
  onLoadGroup: (
    selectors: Array<{
      id: string;
      selector: string;
      type: string;
      name?: string;
    }>,
  ) => void;
  onDeleteGroup: (groupId: string) => void;
  onClose: () => void;
}

const SelectorGroupManager: React.FC<SelectorGroupManagerProps> = ({
  currentSelectors,
  savedGroups,
  onSaveGroup,
  onLoadGroup,
  onDeleteGroup,
  onClose,
}) => {
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [newGroupDescription, setNewGroupDescription] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const handleSaveNewGroup = () => {
    if (!newGroupName.trim()) {
      setError("Please enter a group name");
      return;
    }

    if (currentSelectors.length === 0) {
      setError("No selectors to save. Please select elements first.");
      return;
    }

    const newGroup: SelectorGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      description: newGroupDescription.trim() || undefined,
      selectors: [...currentSelectors],
    };

    onSaveGroup(newGroup);
    setNewGroupName("");
    setNewGroupDescription("");
    setError("");
  };

  const handleUpdateGroup = (group: SelectorGroup) => {
    if (editingGroupId) {
      const updatedGroup = {
        ...group,
        name: newGroupName.trim() || group.name,
        description: newGroupDescription.trim() || group.description,
      };
      onSaveGroup(updatedGroup);
      setEditingGroupId(null);
      setNewGroupName("");
      setNewGroupDescription("");
    }
  };

  const handleEditGroup = (group: SelectorGroup) => {
    setEditingGroupId(group.id);
    setNewGroupName(group.name);
    setNewGroupDescription(group.description || "");
  };

  const handleCancelEdit = () => {
    setEditingGroupId(null);
    setNewGroupName("");
    setNewGroupDescription("");
  };

  const handleLoadGroup = () => {
    if (!selectedGroupId) {
      setError("Please select a group to load");
      return;
    }

    const group = savedGroups.find((g) => g.id === selectedGroupId);
    if (group) {
      onLoadGroup(group.selectors);
      onClose();
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Layers className="mr-2 h-5 w-5" />
          Selector Group Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Save current selectors as a group */}
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-3">
              Save Current Selectors as Group
            </h3>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="group-name"
                  className="block text-sm font-medium mb-1"
                >
                  Group Name
                </label>
                <Input
                  id="group-name"
                  placeholder="E.g., Product Details"
                  value={newGroupName}
                  onChange={(e) => {
                    setNewGroupName(e.target.value);
                    setError("");
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="group-description"
                  className="block text-sm font-medium mb-1"
                >
                  Description (optional)
                </label>
                <Input
                  id="group-description"
                  placeholder="E.g., Extracts product title, price, and image"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-between items-center">
                <Badge variant="outline">
                  {currentSelectors.length} selectors
                </Badge>
                <Button
                  onClick={
                    editingGroupId
                      ? () =>
                          handleUpdateGroup(
                            savedGroups.find((g) => g.id === editingGroupId)!,
                          )
                      : handleSaveNewGroup
                  }
                  disabled={
                    !newGroupName.trim() || currentSelectors.length === 0
                  }
                  size="sm"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingGroupId ? "Update Group" : "Save as Group"}
                </Button>
              </div>
              {editingGroupId && (
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel Edit
                  </Button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Saved groups */}
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-3">Saved Selector Groups</h3>
            {savedGroups.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="select-group"
                    className="block text-sm font-medium mb-1"
                  >
                    Select a Group to Load
                  </label>
                  <Select
                    value={selectedGroupId}
                    onValueChange={setSelectedGroupId}
                  >
                    <SelectTrigger id="select-group">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} ({group.selectors.length} selectors)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadGroup}
                    disabled={!selectedGroupId}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Load Selected Group
                  </Button>
                </div>

                <ScrollArea className="h-60 border rounded-md p-2">
                  <div className="space-y-3">
                    {savedGroups.map((group) => (
                      <div key={group.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium">{group.name}</h4>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGroup(group)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteGroup(group.id)}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        {group.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {group.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {group.selectors.map((selector, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {selector.type}:{" "}
                              {selector.name || selector.selector}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed rounded-md">
                <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  No saved selector groups yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Save your current selectors as a group for reuse
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SelectorGroupManager;
