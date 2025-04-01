import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  Check,
  ChevronRight,
  Edit,
  Save,
  TestTube,
  Trash2,
  RefreshCw,
  Plus,
} from "lucide-react";
import axios from "axios";
import { useModels } from "@/hooks/useModels";

interface ModelManagementProps {
  className?: string;
}

interface Model {
  id: number;
  name: string;
  provider: string;
  apiKey?: string;
  version?: string;
  parameters?: any;
  isActive?: boolean;
  contextSize?: number;
  memoryRetention?: number;
  defaultForQueryType?: string;
  rateLimit?: number;
  responseVerbosity?: number;
  dataPrioritization?: string;
  fineTuned?: boolean;
  streamingEnabled?: boolean;
}

const ModelManagement: React.FC<ModelManagementProps> = ({
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("models");
  const [testResponse, setTestResponse] = useState("");
  const [testQuery, setTestQuery] = useState(
    "How would you summarize the data from my last scraping session?",
  );
  const [isTestLoading, setIsTestLoading] = useState(false);
  const {
    models,
    loading,
    error,
    refreshModels,
    createModel,
    updateModel,
    deleteModel,
    testModel,
  } = useModels();
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [editedModel, setEditedModel] = useState<Model | null>(null);
  const [isCreatingModel, setIsCreatingModel] = useState(false);
  const [newModel, setNewModel] = useState<Partial<Model>>({
    name: "",
    provider: "OpenAI",
    version: "",
    apiKey: "",
    contextSize: 4096,
    memoryRetention: 5,
    defaultForQueryType: "general",
    rateLimit: 60,
    responseVerbosity: 50,
    dataPrioritization: "balanced",
    fineTuned: false,
    streamingEnabled: true,
    parameters: {
      temperature: 0.7,
      topP: 1,
    },
  });

  useEffect(() => {
    refreshModels();
  }, [refreshModels]);

  const handleSelectModel = (model: Model) => {
    setSelectedModel(model);
    setEditedModel({
      ...model,
      apiKey: model.apiKey ? "********" : "",
    });
    setIsCreatingModel(false);
  };

  const handleCreateModel = () => {
    setIsCreatingModel(true);
    setSelectedModel(null);
    setEditedModel(null);
  };

  const handleCancelCreate = () => {
    setIsCreatingModel(false);
  };

  const handleSaveNewModel = async () => {
    try {
      const result = await createModel(newModel as any);
      if (result) {
        setIsCreatingModel(false);
        setNewModel({
          name: "",
          provider: "OpenAI",
          version: "",
          apiKey: "",
          contextSize: 4096,
          memoryRetention: 5,
          defaultForQueryType: "general",
          rateLimit: 60,
          responseVerbosity: 50,
          dataPrioritization: "balanced",
          fineTuned: false,
          streamingEnabled: true,
          parameters: {
            temperature: 0.7,
            topP: 1,
          },
        });
        refreshModels();
      }
    } catch (err) {
      console.error("Error creating model:", err);
    }
  };

  const handleUpdateModel = async () => {
    if (!selectedModel || !editedModel) return;

    try {
      // Don't send masked API key
      const modelToUpdate = { ...editedModel };
      if (modelToUpdate.apiKey === "********") {
        delete modelToUpdate.apiKey;
      }

      const result = await updateModel(selectedModel.id, modelToUpdate);
      if (result) {
        setSelectedModel(result);
        setEditedModel({
          ...result,
          apiKey: result.apiKey ? "********" : "",
        });
        refreshModels();
      }
    } catch (err) {
      console.error("Error updating model:", err);
    }
  };

  const handleDeleteModel = async () => {
    if (!selectedModel) return;

    try {
      const result = await deleteModel(selectedModel.id);
      if (result) {
        setSelectedModel(null);
        setEditedModel(null);
        refreshModels();
      }
    } catch (err) {
      console.error("Error deleting model:", err);
    }
  };

  const handleActivateModel = async (modelId: number) => {
    try {
      await updateModel(modelId, { isActive: true });
      // Refresh models to show updated state
      refreshModels();
    } catch (err) {
      console.error("Error activating model:", err);
    }
  };

  const handleTestModel = async () => {
    if (!selectedModel) {
      return;
    }

    setIsTestLoading(true);
    setTestResponse("");

    try {
      const options = {
        temperature: editedModel?.parameters?.temperature || 0.7,
        maxTokens: editedModel?.contextSize || 2048,
        topP: editedModel?.parameters?.topP || 1,
      };

      const response = await testModel(selectedModel.id, testQuery, options);
      setTestResponse(response.text);
    } catch (err) {
      console.error("Error testing model:", err);
      setTestResponse(
        "An error occurred while testing the model. Please try again.",
      );
    } finally {
      setIsTestLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (isCreatingModel) {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        setNewModel({
          ...newModel,
          [parent]: {
            ...newModel[parent as keyof typeof newModel],
            [child]: value,
          },
        });
      } else {
        setNewModel({
          ...newModel,
          [field]: value,
        });
      }
    } else if (editedModel) {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        setEditedModel({
          ...editedModel,
          [parent]: {
            ...editedModel[parent as keyof typeof editedModel],
            [child]: value,
          },
        });
      } else {
        setEditedModel({
          ...editedModel,
          [field]: value,
        });
      }
    }
  };

  return (
    <div className={`w-full h-full bg-background p-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col h-full"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Model Management</h1>
            <p className="text-muted-foreground mt-1">
              Configure AI models, customize prompts, and adjust response
              formatting
            </p>
          </div>
          <Button onClick={handleCreateModel}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Model
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="formatting">Formatting</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="models" className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                <div className="md:col-span-1">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Available Models</CardTitle>
                      <CardDescription>
                        Select a model to configure
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex justify-center items-center h-[400px]">
                          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <ScrollArea className="h-[400px] pr-4">
                          <ModelList
                            models={models}
                            onActivate={handleActivateModel}
                            onSelect={handleSelectModel}
                            selectedModelId={selectedModel?.id}
                          />
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-2">
                  {isCreatingModel ? (
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Create New Model</CardTitle>
                            <CardDescription>
                              Configure a new AI model
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="model-name">Model Name</Label>
                              <Input
                                id="model-name"
                                value={newModel.name}
                                onChange={(e) =>
                                  handleInputChange("name", e.target.value)
                                }
                                placeholder="e.g., GPT-4 Custom"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="provider">Provider</Label>
                              <Select
                                value={newModel.provider}
                                onValueChange={(value) =>
                                  handleInputChange("provider", value)
                                }
                              >
                                <SelectTrigger id="provider">
                                  <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="OpenAI">OpenAI</SelectItem>
                                  <SelectItem value="Anthropic">
                                    Anthropic
                                  </SelectItem>
                                  <SelectItem value="Google">Google</SelectItem>
                                  <SelectItem value="Mistral AI">
                                    Mistral AI
                                  </SelectItem>
                                  <SelectItem value="Meta">Meta</SelectItem>
                                  <SelectItem value="xAI">xAI</SelectItem>
                                  <SelectItem value="DeepSeek">
                                    DeepSeek
                                  </SelectItem>
                                  <SelectItem value="Hugging Face">
                                    Hugging Face
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="api-key">API Key</Label>
                              <Input
                                id="api-key"
                                type="password"
                                value={newModel.apiKey}
                                onChange={(e) =>
                                  handleInputChange("apiKey", e.target.value)
                                }
                                placeholder="Enter API key"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="model-version">
                                Model Version
                              </Label>
                              <Input
                                id="model-version"
                                value={newModel.version}
                                onChange={(e) =>
                                  handleInputChange("version", e.target.value)
                                }
                                placeholder="e.g., gpt-4, claude-3-opus-20240229"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Temperature</Label>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                  0.0
                                </span>
                                <Slider
                                  value={[
                                    newModel.parameters?.temperature || 0.7,
                                  ]}
                                  onValueChange={(value) =>
                                    handleInputChange(
                                      "parameters.temperature",
                                      value[0],
                                    )
                                  }
                                  max={1}
                                  step={0.1}
                                  className="flex-1"
                                />
                                <span className="text-sm text-muted-foreground">
                                  1.0
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Context Size</Label>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                  1024
                                </span>
                                <Slider
                                  value={[newModel.contextSize || 4096]}
                                  onValueChange={(value) =>
                                    handleInputChange("contextSize", value[0])
                                  }
                                  min={1024}
                                  max={100000}
                                  step={1024}
                                  className="flex-1"
                                />
                                <span className="text-sm text-muted-foreground">
                                  100k
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Memory Retention</Label>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                  1
                                </span>
                                <Slider
                                  value={[newModel.memoryRetention || 5]}
                                  onValueChange={(value) =>
                                    handleInputChange(
                                      "memoryRetention",
                                      value[0],
                                    )
                                  }
                                  min={1}
                                  max={10}
                                  step={1}
                                  className="flex-1"
                                />
                                <span className="text-sm text-muted-foreground">
                                  10
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="query-type">
                                Default For Query Type
                              </Label>
                              <Select
                                value={newModel.defaultForQueryType}
                                onValueChange={(value) =>
                                  handleInputChange(
                                    "defaultForQueryType",
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger id="query-type">
                                  <SelectValue placeholder="Select query type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">
                                    General
                                  </SelectItem>
                                  <SelectItem value="chatbot">
                                    Chatbot
                                  </SelectItem>
                                  <SelectItem value="scraping">
                                    Scraping
                                  </SelectItem>
                                  <SelectItem value="analysis">
                                    Analysis
                                  </SelectItem>
                                  <SelectItem value="vector">
                                    Vector Search
                                  </SelectItem>
                                  <SelectItem value="code">
                                    Code Generation
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Data Prioritization</Label>
                              <Select
                                value={newModel.dataPrioritization}
                                onValueChange={(value) =>
                                  handleInputChange("dataPrioritization", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="scraped">
                                    Scraped Data First
                                  </SelectItem>
                                  <SelectItem value="balanced">
                                    Balanced
                                  </SelectItem>
                                  <SelectItem value="knowledge">
                                    Knowledge Base First
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center space-x-2 pt-4">
                              <Switch
                                id="fine-tuning-new"
                                checked={newModel.fineTuned}
                                onCheckedChange={(checked) =>
                                  handleInputChange("fineTuned", checked)
                                }
                              />
                              <Label htmlFor="fine-tuning-new">
                                Enable Fine-tuning
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id="streaming-new"
                                checked={newModel.streamingEnabled}
                                onCheckedChange={(checked) =>
                                  handleInputChange("streamingEnabled", checked)
                                }
                              />
                              <Label htmlFor="streaming-new">
                                Enable Streaming Responses
                              </Label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={handleCancelCreate}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveNewModel}>
                          <Save className="mr-2 h-4 w-4" />
                          Create Model
                        </Button>
                      </CardFooter>
                    </Card>
                  ) : selectedModel && editedModel ? (
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Model Configuration</CardTitle>
                            <CardDescription>
                              Adjust parameters for {selectedModel.name}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              selectedModel.isActive ? "default" : "secondary"
                            }
                          >
                            {selectedModel.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="api-key-edit">API Key</Label>
                              <Input
                                id="api-key-edit"
                                type="password"
                                value={editedModel.apiKey}
                                onChange={(e) =>
                                  handleInputChange("apiKey", e.target.value)
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="model-version-edit">
                                Model Version
                              </Label>
                              <Input
                                id="model-version-edit"
                                value={editedModel.version}
                                onChange={(e) =>
                                  handleInputChange("version", e.target.value)
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Temperature</Label>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                  0.0
                                </span>
                                <Slider
                                  value={[
                                    editedModel.parameters?.temperature || 0.7,
                                  ]}
                                  onValueChange={(value) =>
                                    handleInputChange(
                                      "parameters.temperature",
                                      value[0],
                                    )
                                  }
                                  max={1}
                                  step={0.1}
                                  className="flex-1"
                                />
                                <span className="text-sm text-muted-foreground">
                                  1.0
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Context Size</Label>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                  1024
                                </span>
                                <Slider
                                  value={[editedModel.contextSize || 4096]}
                                  onValueChange={(value) =>
                                    handleInputChange("contextSize", value[0])
                                  }
                                  min={1024}
                                  max={100000}
                                  step={1024}
                                  className="flex-1"
                                />
                                <span className="text-sm text-muted-foreground">
                                  100k
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Rate Limit (requests per minute)</Label>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                  10
                                </span>
                                <Slider
                                  value={[editedModel.rateLimit || 60]}
                                  onValueChange={(value) =>
                                    handleInputChange("rateLimit", value[0])
                                  }
                                  min={10}
                                  max={100}
                                  step={5}
                                  className="flex-1"
                                />
                                <span className="text-sm text-muted-foreground">
                                  100
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Memory Retention</Label>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                  1
                                </span>
                                <Slider
                                  value={[editedModel.memoryRetention || 5]}
                                  onValueChange={(value) =>
                                    handleInputChange(
                                      "memoryRetention",
                                      value[0],
                                    )
                                  }
                                  min={1}
                                  max={10}
                                  step={1}
                                  className="flex-1"
                                />
                                <span className="text-sm text-muted-foreground">
                                  10
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="query-type-edit">
                                Default For Query Type
                              </Label>
                              <Select
                                value={editedModel.defaultForQueryType}
                                onValueChange={(value) =>
                                  handleInputChange(
                                    "defaultForQueryType",
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger id="query-type-edit">
                                  <SelectValue placeholder="Select query type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">
                                    General
                                  </SelectItem>
                                  <SelectItem value="chatbot">
                                    Chatbot
                                  </SelectItem>
                                  <SelectItem value="scraping">
                                    Scraping
                                  </SelectItem>
                                  <SelectItem value="analysis">
                                    Analysis
                                  </SelectItem>
                                  <SelectItem value="vector">
                                    Vector Search
                                  </SelectItem>
                                  <SelectItem value="code">
                                    Code Generation
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Data Prioritization</Label>
                              <Select
                                value={editedModel.dataPrioritization}
                                onValueChange={(value) =>
                                  handleInputChange("dataPrioritization", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="scraped">
                                    Scraped Data First
                                  </SelectItem>
                                  <SelectItem value="balanced">
                                    Balanced
                                  </SelectItem>
                                  <SelectItem value="knowledge">
                                    Knowledge Base First
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center space-x-2 pt-4">
                              <Switch
                                id="fine-tuning-edit"
                                checked={editedModel.fineTuned}
                                onCheckedChange={(checked) =>
                                  handleInputChange("fineTuned", checked)
                                }
                              />
                              <Label htmlFor="fine-tuning-edit">
                                Enable Fine-tuning
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id="streaming-edit"
                                checked={editedModel.streamingEnabled}
                                onCheckedChange={(checked) =>
                                  handleInputChange("streamingEnabled", checked)
                                }
                              />
                              <Label htmlFor="streaming-edit">
                                Enable Streaming Responses
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id="active-edit"
                                checked={editedModel.isActive}
                                onCheckedChange={(checked) =>
                                  handleInputChange("isActive", checked)
                                }
                              />
                              <Label htmlFor="active-edit">
                                Set as Active Model
                              </Label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={handleDeleteModel}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                        <Button onClick={handleUpdateModel}>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </CardFooter>
                    </Card>
                  ) : (
                    <div className="h-full flex items-center justify-center border rounded-lg">
                      <div className="text-center p-6">
                        <div className="mx-auto w-16 h-16 mb-4 text-muted-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                          No Model Selected
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Select a model from the list or create a new one to
                          configure it.
                        </p>
                        <Button onClick={handleCreateModel}>
                          <Edit className="mr-2 h-4 w-4" />
                          Create New Model
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prompts" className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                <div className="md:col-span-1">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Prompt Templates</CardTitle>
                      <CardDescription>
                        Manage your prompt templates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] pr-4">
                        <PromptList />
                      </ScrollArea>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Create New Template
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                <div className="md:col-span-2">
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Edit Prompt Template</CardTitle>
                          <CardDescription>
                            Data Analysis Assistant
                          </CardDescription>
                        </div>
                        <Badge>Default</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input
                          id="template-name"
                          defaultValue="Data Analysis Assistant"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="template-description">
                          Description
                        </Label>
                        <Input
                          id="template-description"
                          defaultValue="Specialized prompt for analyzing scraped data"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prompt-template">Prompt Template</Label>
                        <Textarea
                          id="prompt-template"
                          className="min-h-[200px] font-mono text-sm"
                          defaultValue={`You are a data analysis assistant specialized in web scraping data.

Context: \{\{context\}\}
Scraped Data: \{\{scraped_data\}\}
User Query: \{\{query\}\}

Analyze the data provided and respond to the user's query with insights, patterns, and actionable information. Include relevant statistics when possible. Format your response with clear headings and bullet points for readability.`}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Available Variables</Label>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            &#123;&#123; context &#125;&#125;
                          </Badge>
                          <Badge variant="outline">
                            &#123;&#123; scraped_data &#125;&#125;
                          </Badge>
                          <Badge variant="outline">
                            &#123;&#123; query &#125;&#125;
                          </Badge>
                          <Badge variant="outline">
                            &#123;&#123; timestamp &#125;&#125;
                          </Badge>
                          <Badge variant="outline">
                            &#123;&#123; user_name &#125;&#125;
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                      <Button>
                        <Save className="mr-2 h-4 w-4" />
                        Save Template
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="formatting" className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Response Formatting</CardTitle>
                    <CardDescription>
                      Configure how AI responses are formatted
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Response Length</Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            Concise
                          </span>
                          <Slider defaultValue={[50]} className="flex-1" />
                          <span className="text-sm text-muted-foreground">
                            Detailed
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Formatting Style</Label>
                        <Select defaultValue="structured">
                          <SelectTrigger>
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="structured">
                              Structured (Headings & Lists)
                            </SelectItem>
                            <SelectItem value="paragraph">
                              Paragraph Style
                            </SelectItem>
                            <SelectItem value="conversational">
                              Conversational
                            </SelectItem>
                            <SelectItem value="technical">
                              Technical Documentation
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Tone</Label>
                        <Select defaultValue="professional">
                          <SelectTrigger>
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">
                              Professional
                            </SelectItem>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Include in Responses
                      </h3>

                      <div className="flex items-center space-x-2">
                        <Switch id="include-sources" defaultChecked />
                        <Label htmlFor="include-sources">
                          Include Data Sources
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch id="include-timestamps" defaultChecked />
                        <Label htmlFor="include-timestamps">
                          Include Timestamps
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch id="include-followup" defaultChecked />
                        <Label htmlFor="include-followup">
                          Suggest Follow-up Questions
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch id="include-confidence" />
                        <Label htmlFor="include-confidence">
                          Show Confidence Scores
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Save Formatting Settings
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Test Model</CardTitle>
                    <CardDescription>
                      Test your model with sample queries
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="test-query">Sample Query</Label>
                      <Textarea
                        id="test-query"
                        value={testQuery}
                        onChange={(e) => setTestQuery(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>

                    <Button
                      onClick={handleTestModel}
                      className="w-full"
                      disabled={isTestLoading || !selectedModel}
                    >
                      {isTestLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="mr-2 h-4 w-4"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </motion.div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <TestTube className="mr-2 h-4 w-4" />
                          Test Model Response
                        </>
                      )}
                    </Button>

                    {testResponse && (
                      <div className="mt-4 space-y-2">
                        <Label>Model Response</Label>
                        <div className="p-4 rounded-md border bg-muted/50">
                          <ScrollArea className="h-[200px]">
                            <div className="space-y-2">
                              <p>{testResponse}</p>
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </div>
  );
};

interface ModelListProps {
  models: Model[];
  onActivate: (modelId: number) => void;
  onSelect: (model: Model) => void;
  selectedModelId?: number;
}

const ModelList: React.FC<ModelListProps> = ({
  models = [],
  onActivate,
  onSelect,
  selectedModelId,
}) => {
  if (!models || models.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No models available. Add a new model to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {models.map((model) => (
        <div
          key={model.id}
          className={`p-3 rounded-md flex items-center justify-between cursor-pointer hover:bg-accent ${model.isActive ? "bg-accent" : ""} ${model.id === selectedModelId ? "border-2 border-primary" : ""}`}
          onClick={() => onSelect(model)}
        >
          <div className="flex flex-col">
            <span className="font-medium">{model.name}</span>
            <span className="text-xs text-muted-foreground">
              {model.provider}
            </span>
          </div>
          <div className="flex items-center">
            {model.isActive ? (
              <Check className="h-4 w-4 text-primary mr-1" />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onActivate(model.id);
                }}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      ))}
    </div>
  );
};

const PromptList = () => {
  const prompts = [
    {
      id: 1,
      name: "Data Analysis Assistant",
      description: "Specialized prompt for analyzing scraped data",
      isDefault: true,
    },
    {
      id: 2,
      name: "E-commerce Product Analyzer",
      description: "Analyze product data from e-commerce sites",
      isDefault: false,
    },
    {
      id: 3,
      name: "News Summarizer",
      description: "Summarize news articles with key points",
      isDefault: false,
    },
    {
      id: 4,
      name: "SEO Content Analyzer",
      description: "Analyze content for SEO optimization",
      isDefault: false,
    },
    {
      id: 5,
      name: "Competitive Research",
      description: "Compare data across competitor websites",
      isDefault: false,
    },
  ];

  return (
    <div className="space-y-2">
      {prompts.map((prompt) => (
        <div
          key={prompt.id}
          className="p-3 rounded-md flex items-center justify-between cursor-pointer hover:bg-accent"
        >
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="font-medium">{prompt.name}</span>
              {prompt.isDefault && (
                <Badge className="ml-2" variant="outline">
                  Default
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {prompt.description}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      ))}
    </div>
  );
};

export default ModelManagement;
