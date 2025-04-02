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

interface Prompt {
  id: number;
  name: string;
  description?: string;
  template: string;
  isDefault?: boolean;
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

  // Prompt state
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<Prompt | null>(null);
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [newPrompt, setNewPrompt] = useState<Partial<Prompt>>({
    name: "",
    description: "",
    template: "",
    isDefault: false
  });
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptsError, setPromptsError] = useState<string | null>(null);

  // Formatting state
  const [formatSettings, setFormatSettings] = useState({
    responseLength: 50,
    formattingStyle: "structured",
    tone: "professional",
    includeSources: true,
    includeTimestamps: true,
    suggestFollowUp: true,
    showConfidence: false,
    introMessage: "Based on the data you've provided, here's what I found:",
    conclusionMessage: "Is there anything specific you'd like me to explain further?"
  });

  useEffect(() => {
    refreshModels();
    fetchPrompts();
  }, [refreshModels]);

  const fetchPrompts = async () => {
    try {
      setPromptsLoading(true);
      setPromptsError(null);

      const response = await fetch(
        `${process.env.VITE_API_BASE_URL || "http://localhost:3001/api"}/prompts`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch prompts: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setPrompts(data.data);

        // Select the default prompt if available
        const defaultPrompt = data.data.find((p: Prompt) => p.isDefault);
        if (defaultPrompt) {
          setSelectedPrompt(defaultPrompt);
          setEditedPrompt(defaultPrompt);
        } else if (data.data.length > 0) {
          setSelectedPrompt(data.data[0]);
          setEditedPrompt(data.data[0]);
        }
      } else {
        setPrompts([]);
      }
    } catch (err) {
      console.error("Error fetching prompts:", err);
      setPromptsError("Failed to load prompt templates");
      // Fallback to default prompts if API fails
      setPrompts([
        {
          id: 1,
          name: "Data Analysis Assistant",
          description: "Specialized prompt for analyzing scraped data",
          isDefault: true,
          template: `You are a data analysis assistant specialized in web scraping data.

Context: {{context}}
Scraped Data: {{scraped_data}}
User Query: {{query}}

Analyze the data provided and respond to the user's query with insights, patterns, and actionable information. Include relevant statistics when possible. Format your response with clear headings and bullet points for readability.`
        },
        {
          id: 2,
          name: "E-commerce Product Analyzer",
          description: "Analyze product data from e-commerce sites",
          isDefault: false,
          template: `You are an e-commerce product analysis specialist.

Scraped Data: {{scraped_data}}
User Query: {{query}}

Analyze the product data and provide insights on pricing trends, competitive positioning, and product features. Include recommendations for pricing strategy and marketing focus.`
        },
        {
          id: 3,
          name: "News Summarizer",
          description: "Summarize news articles with key points",
          isDefault: false,
          template: `You are a news summarization assistant.

Article Content: {{scraped_data}}
User Query: {{query}}

Provide a concise summary of the news article, highlighting the key points, main entities involved, and core message. Include a brief analysis of potential implications if relevant.`
        },
        {
          id: 4,
          name: "SEO Content Analyzer",
          description: "Analyze content for SEO optimization",
          isDefault: false,
          template: `You are an SEO content analysis specialist.

Content: {{scraped_data}}
User Query: {{query}}

Analyze the content for SEO effectiveness. Identify keyword density, heading structure, meta information quality, and content readability. Provide specific recommendations for improving SEO performance.`
        },
        {
          id: 5,
          name: "Competitive Research",
          description: "Compare data across competitor websites",
          isDefault: false,
          template: `You are a competitive intelligence specialist.

Competitor Data: {{scraped_data}}
User Query: {{query}}

Analyze the competitor data and identify strengths, weaknesses, unique selling propositions, and market positioning. Compare pricing strategies, product offerings, and messaging approaches. Provide strategic recommendations based on this analysis.`
        },
      ]);

      // Select the first prompt as default
      setSelectedPrompt({
        id: 1,
        name: "Data Analysis Assistant",
        description: "Specialized prompt for analyzing scraped data",
        isDefault: true,
        template: `You are a data analysis assistant specialized in web scraping data.

Context: {{context}}
Scraped Data: {{scraped_data}}
User Query: {{query}}

Analyze the data provided and respond to the user's query with insights, patterns, and actionable information. Include relevant statistics when possible. Format your response with clear headings and bullet points for readability.`
      });
      setEditedPrompt({
        id: 1,
        name: "Data Analysis Assistant",
        description: "Specialized prompt for analyzing scraped data",
        isDefault: true,
        template: `You are a data analysis assistant specialized in web scraping data.

Context: {{context}}
Scraped Data: {{scraped_data}}
User Query: {{query}}

Analyze the data provided and respond to the user's query with insights, patterns, and actionable information. Include relevant statistics when possible. Format your response with clear headings and bullet points for readability.`
      });
    } finally {
      setPromptsLoading(false);
    }
  };

  // Model management functions
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
      // Get the selected prompt if any
      const promptId = selectedPrompt?.id;

      // Prepare formatting options based on the current settings
      const formatOptions = {
        introMessage: formatSettings.introMessage,
        conclusionMessage: formatSettings.conclusionMessage,
        suggestFollowUp: formatSettings.suggestFollowUp,
        includeTimestamp: formatSettings.includeTimestamps,
        includeSource: formatSettings.includeSources,
        showConfidence: formatSettings.showConfidence,
        temperature: editedModel?.parameters?.temperature || 0.7,
        maxTokens: editedModel?.contextSize || 2048,
        topP: editedModel?.parameters?.topP || 1,
      };

      // Call the API to test the model with the selected prompt and formatting options
      const response = await fetch(`${process.env.VITE_API_BASE_URL || "http://localhost:3001/api"}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          message: testQuery,
          modelId: selectedModel.id,
          promptId,
          formatOptions
        })
      });

      if (!response.ok) {
        throw new Error(`Test failed: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success && result.data?.message) {
        setTestResponse(result.data.message.content);
      } else {
        throw new Error("Invalid response format");
      }
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

  // Prompt management functions
  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setEditedPrompt({ ...prompt });
    setIsCreatingPrompt(false);
  };

  const handleCreatePrompt = () => {
    setIsCreatingPrompt(true);
    setSelectedPrompt(null);
    setEditedPrompt(null);
    setNewPrompt({
      name: "",
      description: "",
      template: "",
      isDefault: false
    });
  };

  const handleCancelCreatePrompt = () => {
    setIsCreatingPrompt(false);
    if (prompts.length > 0) {
      const defaultPrompt = prompts.find(p => p.isDefault) || prompts[0];
      setSelectedPrompt(defaultPrompt);
      setEditedPrompt({ ...defaultPrompt });
    }
  };

  const handleSaveNewPrompt = async () => {
    try {
      const response = await fetch(`${process.env.VITE_API_BASE_URL || "http://localhost:3001/api"}/prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify(newPrompt)
      });

      if (!response.ok) {
        throw new Error(`Failed to create prompt: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setIsCreatingPrompt(false);
        setNewPrompt({
          name: "",
          description: "",
          template: "",
          isDefault: false
        });
        await fetchPrompts(); // Refresh prompts list
      }
    } catch (err) {
      console.error("Error creating prompt:", err);
    }
  };

  const handleUpdatePrompt = async () => {
    if (!selectedPrompt || !editedPrompt) return;

    try {
      const response = await fetch(`${process.env.VITE_API_BASE_URL || "http://localhost:3001/api"}/prompts/${selectedPrompt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify(editedPrompt)
      });

      if (!response.ok) {
        throw new Error(`Failed to update prompt: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setSelectedPrompt(result.data);
        setEditedPrompt({ ...result.data });
        await fetchPrompts(); // Refresh prompts list
      }
    } catch (err) {
      console.error("Error updating prompt:", err);
    }
  };

  const handleDeletePrompt = async () => {
    if (!selectedPrompt) return;

    try {
      const response = await fetch(`${process.env.VITE_API_BASE_URL || "http://localhost:3001/api"}/prompts/${selectedPrompt.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete prompt: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setSelectedPrompt(null);
        setEditedPrompt(null);
        await fetchPrompts(); // Refresh prompts list

        // Select another prompt if available
        if (prompts.length > 1) {
          const remainingPrompts = prompts.filter(p => p.id !== selectedPrompt.id);
          const defaultPrompt = remainingPrompts.find(p => p.isDefault) || remainingPrompts[0];
          setSelectedPrompt(defaultPrompt);
          setEditedPrompt({ ...defaultPrompt });
        }
      }
    } catch (err) {
      console.error("Error deleting prompt:", err);
    }
  };

  // Format settings handlers
  const handleFormatSettingChange = (field: string, value: any) => {
    setFormatSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className={`w-full h-full bg-background ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="prompts">Prompt Templates</TabsTrigger>
            <TabsTrigger value="formatting">Response Formatting</TabsTrigger>
          </TabsList>

          {activeTab === "models" && (
            <Button onClick={handleCreateModel}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Model
            </Button>
          )}

          {activeTab === "prompts" && (
            <Button onClick={handleCreatePrompt}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Template
            </Button>
          )}
        </div>

        <TabsContent value="models" className="h-[calc(100%-56px)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <div className="md:col-span-1 overflow-hidden">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Available Models</CardTitle>
                  <CardDescription>
                    Select a model to view or edit its configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-[calc(100%-32px)] pr-4">
                    <div className="space-y-2">
                      {loading ? (
                        <div className="flex items-center justify-center p-4">
                          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : error ? (
                        <div className="flex items-center justify-center p-4 text-destructive">
                          <AlertCircle className="h-6 w-6 mr-2" />
                          <span>Error loading models</span>
                        </div>
                      ) : (
                        models.map((model) => (
                          <div
                            key={model.id}
                            className={`p-3 rounded-md flex items-center justify-between cursor-pointer hover:bg-accent ${selectedModel?.id === model.id ? "bg-accent" : ""}`}
                            onClick={() => handleSelectModel(model)}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <span className="font-medium">{model.name}</span>
                                {model.isActive && (
                                  <Badge className="ml-2" variant="outline">
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {model.provider} - {model.version}
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={refreshModels}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh Models
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-2 overflow-hidden">
              {isCreatingModel ? (
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>Add New Model</CardTitle>
                    <CardDescription>
                      Configure a new AI model for your system
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto">
                    <ScrollArea className="h-full pr-4">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <Label htmlFor="model-provider">Provider</Label>
                            <Select
                              value={newModel.provider}
                              onValueChange={(value) =>
                                handleInputChange("provider", value)
                              }
                            >
                              <SelectTrigger id="model-provider">
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="OpenAI">OpenAI</SelectItem>
                                <SelectItem value="Anthropic">Anthropic</SelectItem>
                                <SelectItem value="Google">Google AI</SelectItem>
                                <SelectItem value="Mistral AI">Mistral AI</SelectItem>
                                <SelectItem value="Meta">Meta AI</SelectItem>
                                <SelectItem value="Hugging Face">
                                  Hugging Face
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="model-version">Model Version</Label>
                            <Input
                              id="model-version"
                              value={newModel.version || ""}
                              onChange={(e) =>
                                handleInputChange("version", e.target.value)
                              }
                              placeholder="e.g., gpt-4, claude-3-opus-20240229"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="model-api-key">API Key</Label>
                            <Input
                              id="model-api-key"
                              type="password"
                              value={newModel.apiKey || ""}
                              onChange={(e) =>
                                handleInputChange("apiKey", e.target.value)
                              }
                              placeholder="Enter API key (optional)"
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Model Parameters</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="model-context-size">
                                Context Size (tokens)
                              </Label>
                              <Input
                                id="model-context-size"
                                type="number"
                                value={newModel.contextSize || 4096}
                                onChange={(e) =>
                                  handleInputChange(
                                    "contextSize",
                                    parseInt(e.target.value),
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="model-memory-retention">
                                Memory Retention (messages)
                              </Label>
                              <Input
                                id="model-memory-retention"
                                type="number"
                                value={newModel.memoryRetention || 5}
                                onChange={(e) =>
                                  handleInputChange(
                                    "memoryRetention",
                                    parseInt(e.target.value),
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="model-rate-limit">
                                Rate Limit (requests per minute)
                              </Label>
                              <Input
                                id="model-rate-limit"
                                type="number"
                                value={newModel.rateLimit || 60}
                                onChange={(e) =>
                                  handleInputChange(
                                    "rateLimit",
                                    parseInt(e.target.value),
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="model-query-type">
                                Default For Query Type
                              </Label>
                              <Select
                                value={newModel.defaultForQueryType || "general"}
                                onValueChange={(value) =>
                                  handleInputChange("defaultForQueryType", value)
                                }
                              >
                                <SelectTrigger id="model-query-type">
                                  <SelectValue placeholder="Select query type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">General</SelectItem>
                                  <SelectItem value="chatbot">Chatbot</SelectItem>
                                  <SelectItem value="analysis">Analysis</SelectItem>
                                  <SelectItem value="scraping">Scraping</SelectItem>
                                  <SelectItem value="vector">Vector Search</SelectItem>
                                  <SelectItem value="code">Code Generation</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Temperature</Label>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                0.0
                              </span>
                              <Slider
                                value={
                                  newModel.parameters?.temperature
                                    ? [newModel.parameters.temperature]
                                    : [0.7]
                                }
                                min={0}
                                max={1}
                                step={0.1}
                                onValueChange={(value) =>
                                  handleInputChange("parameters.temperature", value[0])
                                }
                                className="flex-1"
                              />
                              <span className="text-sm text-muted-foreground">
                                1.0
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Top P</Label>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                0.0
                              </span>
                              <Slider
                                value={
                                  newModel.parameters?.topP
                                    ? [newModel.parameters.topP]
                                    : [1.0]
                                }
                                min={0}
                                max={1}
                                step={0.1}
                                onValueChange={(value) =>
                                  handleInputChange("parameters.topP", value[0])
                                }
                                className="flex-1"
                              />
                              <span className="text-sm text-muted-foreground">
                                1.0
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Response Verbosity</Label>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                Concise
                              </span>
                              <Slider
                                value={[newModel.responseVerbosity ? Number(newModel.responseVerbosity) : 50]}
                                min={0}
                                max={100}
                                step={10}
                                onValueChange={(value) =>
                                  handleInputChange("responseVerbosity", Number(value[0]))
                                }
                                className="flex-1"
                              />
                              <span className="text-sm text-muted-foreground">
                                Detailed
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="model-data-prioritization">
                              Data Prioritization
                            </Label>
                            <Select
                              value={newModel.dataPrioritization || "balanced"}
                              onValueChange={(value) =>
                                handleInputChange("dataPrioritization", value)
                              }
                            >
                              <SelectTrigger id="model-data-prioritization">
                                <SelectValue placeholder="Select prioritization" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="balanced">Balanced</SelectItem>
                                <SelectItem value="knowledge">
                                  Knowledge Base
                                </SelectItem>
                                <SelectItem value="scraped">Scraped Data</SelectItem>
                                <SelectItem value="user">User Input</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex flex-col space-y-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="model-is-active"
                                checked={newModel.isActive || false}
                                onCheckedChange={(checked) =>
                                  handleInputChange("isActive", checked)
                                }
                              />
                              <Label htmlFor="model-is-active">Set as Active</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id="model-fine-tuned"
                                checked={newModel.fineTuned || false}
                                onCheckedChange={(checked) =>
                                  handleInputChange("fineTuned", checked)
                                }
                              />
                              <Label htmlFor="model-fine-tuned">Fine-tuned</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id="model-streaming"
                                checked={newModel.streamingEnabled || true}
                                onCheckedChange={(checked) =>
                                  handleInputChange("streamingEnabled", checked)
                                }
                              />
                              <Label htmlFor="model-streaming">
                                Enable Streaming
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleCancelCreate}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveNewModel}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Model
                    </Button>
                  </CardFooter>
                </Card>
              ) : selectedModel ? (
                <div className="grid grid-cols-1 gap-6 h-full">
                  <Card className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>{selectedModel.name}</CardTitle>
                          <CardDescription>
                            {selectedModel.provider} - {selectedModel.version}
                          </CardDescription>
                        </div>
                        {selectedModel.isActive ? (
                          <Badge>Active</Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivateModel(selectedModel.id)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Set as Active
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                      <ScrollArea className="h-full pr-4">
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-model-name">Model Name</Label>
                              <Input
                                id="edit-model-name"
                                value={editedModel?.name || ""}
                                onChange={(e) =>
                                  handleInputChange("name", e.target.value)
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-model-provider">Provider</Label>
                              <Select
                                value={editedModel?.provider || ""}
                                onValueChange={(value) =>
                                  handleInputChange("provider", value)
                                }
                              >
                                <SelectTrigger id="edit-model-provider">
                                  <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="OpenAI">OpenAI</SelectItem>
                                  <SelectItem value="Anthropic">Anthropic</SelectItem>
                                  <SelectItem value="Google">Google AI</SelectItem>
                                  <SelectItem value="Mistral AI">
                                    Mistral AI
                                  </SelectItem>
                                  <SelectItem value="Meta">Meta AI</SelectItem>
                                  <SelectItem value="Hugging Face">
                                    Hugging Face
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-model-version">
                                Model Version
                              </Label>
                              <Input
                                id="edit-model-version"
                                value={editedModel?.version || ""}
                                onChange={(e) =>
                                  handleInputChange("version", e.target.value)
                                }
                                placeholder="e.g., gpt-4, claude-3-opus-20240229"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-model-api-key">API Key</Label>
                              <Input
                                id="edit-model-api-key"
                                type="password"
                                value={editedModel?.apiKey || ""}
                                onChange={(e) =>
                                  handleInputChange("apiKey", e.target.value)
                                }
                                placeholder="Enter API key (optional)"
                              />
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Model Parameters</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-model-context-size">
                                  Context Size (tokens)
                                </Label>
                                <Input
                                  id="edit-model-context-size"
                                  type="number"
                                  value={editedModel?.contextSize || 4096}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "contextSize",
                                      parseInt(e.target.value),
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-model-memory-retention">
                                  Memory Retention (messages)
                                </Label>
                                <Input
                                  id="edit-model-memory-retention"
                                  type="number"
                                  value={editedModel?.memoryRetention || 5}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "memoryRetention",
                                      parseInt(e.target.value),
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-model-rate-limit">
                                  Rate Limit (requests per minute)
                                </Label>
                                <Input
                                  id="edit-model-rate-limit"
                                  type="number"
                                  value={editedModel?.rateLimit || 60}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "rateLimit",
                                      parseInt(e.target.value),
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-model-query-type">
                                  Default For Query Type
                                </Label>
                                <Select
                                  value={
                                    editedModel?.defaultForQueryType || "general"
                                  }
                                  onValueChange={(value) =>
                                    handleInputChange("defaultForQueryType", value)
                                  }
                                >
                                  <SelectTrigger id="edit-model-query-type">
                                    <SelectValue placeholder="Select query type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="chatbot">Chatbot</SelectItem>
                                    <SelectItem value="analysis">Analysis</SelectItem>
                                    <SelectItem value="scraping">Scraping</SelectItem>
                                    <SelectItem value="vector">
                                      Vector Search
                                    </SelectItem>
                                    <SelectItem value="code">
                                      Code Generation
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Temperature</Label>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                  0.0
                                </span>
                                <Slider
                                  value={
                                    editedModel?.parameters?.temperature
                                      ? [editedModel.parameters.temperature]
                                      : [0.7]
                                  }
                                  min={0}
                                  max={1}
                                  step={0.1}
                                  onValueChange={(value) =>
                                    handleInputChange(
                                      "parameters.temperature",
                                      value[0],
                                    )
                                  }
                                  className="flex-1"
                                />
                                <span className="text-sm text-muted-foreground">
                                  1.0
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Top P</Label>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                  0.0
                                </span>
                                <Slider
                                  value={
                                    editedModel?.parameters?.topP
                                      ? [editedModel.parameters.topP]
                                      : [1.0]
                                  }
                                  min={0}
                                  max={1}
                                  step={0.1}
                                  onValueChange={(value) =>
                                    handleInputChange("parameters.topP", value[0])
                                  }
                                  className="flex-1"
                                />
                                <span className="text-sm text-muted-foreground">
                                  1.0
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Response Verbosity</Label>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                  Concise
                                </span>
                                <Slider
                                  value={[editedModel?.responseVerbosity ? Number(editedModel.responseVerbosity) : 50]}
                                  min={0}
                                  max={100}
                                  step={10}
                                  onValueChange={(value) =>
                                    handleInputChange("responseVerbosity", Number(value[0]))
                                  }
                                  className="flex-1"
                                />
                                <span className="text-sm text-muted-foreground">
                                  Detailed
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-model-data-prioritization">
                                Data Prioritization
                              </Label>
                              <Select
                                value={editedModel?.dataPrioritization || "balanced"}
                                onValueChange={(value) =>
                                  handleInputChange("dataPrioritization", value)
                                }
                              >
                                <SelectTrigger id="edit-model-data-prioritization">
                                  <SelectValue placeholder="Select prioritization" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="balanced">Balanced</SelectItem>
                                  <SelectItem value="knowledge">
                                    Knowledge Base
                                  </SelectItem>
                                  <SelectItem value="scraped">
                                    Scraped Data
                                  </SelectItem>
                                  <SelectItem value="user">User Input</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex flex-col space-y-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="edit-model-is-active"
                                  checked={editedModel?.isActive || false}
                                  onCheckedChange={(checked) =>
                                    handleInputChange("isActive", checked)
                                  }
                                />
                                <Label htmlFor="edit-model-is-active">
                                  Set as Active
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="edit-model-fine-tuned"
                                  checked={editedModel?.fineTuned || false}
                                  onCheckedChange={(checked) =>
                                    handleInputChange("fineTuned", checked)
                                  }
                                />
                                <Label htmlFor="edit-model-fine-tuned">
                                  Fine-tuned
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="edit-model-streaming"
                                  checked={editedModel?.streamingEnabled || true}
                                  onCheckedChange={(checked) =>
                                    handleInputChange("streamingEnabled", checked)
                                  }
                                />
                                <Label htmlFor="edit-model-streaming">
                                  Enable Streaming
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={handleDeleteModel}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setTestQuery(
                              "How would you summarize the data from my last scraping session?",
                            );
                            handleTestModel();
                          }}
                        >
                          <TestTube className="mr-2 h-4 w-4" />
                          Test Model
                        </Button>
                        <Button onClick={handleUpdateModel}>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>

                  {testResponse && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Test Results</CardTitle>
                        <CardDescription>
                          Model response to test query
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Test Query</Label>
                            <Textarea
                              value={testQuery}
                              onChange={(e) => setTestQuery(e.target.value)}
                              className="min-h-[80px]"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label>Response</Label>
                              {isTestLoading && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                                  Processing...
                                </div>
                              )}
                            </div>
                            <div className="p-4 rounded-md border bg-muted/50 whitespace-pre-wrap">
                              {testResponse}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          onClick={handleTestModel}
                          disabled={isTestLoading}
                          className="ml-auto"
                        >
                          {isTestLoading ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <TestTube className="mr-2 h-4 w-4" />
                              Run Test Again
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">
                      No Model Selected
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Select a model from the list or create a new one
                    </p>
                    <Button onClick={handleCreateModel}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Model
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="h-[calc(100%-56px)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Prompt Templates</CardTitle>
                  <CardDescription>Manage your prompt templates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {promptsLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : promptsError ? (
                        <div className="flex items-center justify-center p-4 text-destructive">
                          <AlertCircle className="h-6 w-6 mr-2" />
                          <span>{promptsError}</span>
                        </div>
                      ) : (
                        prompts.map((prompt) => (
                          <div
                            key={prompt.id}
                            className={`p-3 rounded-md flex items-center justify-between cursor-pointer hover:bg-accent ${selectedPrompt?.id === prompt.id ? "bg-accent" : ""}`}
                            onClick={() => handleSelectPrompt(prompt)}
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
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleCreatePrompt}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Template
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-2">
              {isCreatingPrompt ? (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Create New Template</CardTitle>
                    <CardDescription>Create a new prompt template</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        value={newPrompt.name}
                        onChange={(e) => setNewPrompt({ ...newPrompt, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template-description">Description</Label>
                      <Input
                        id="template-description"
                        value={newPrompt.description || ''}
                        onChange={(e) => setNewPrompt({ ...newPrompt, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prompt-template">Prompt Template</Label>
                      <Textarea
                        id="prompt-template"
                        className="min-h-[200px] font-mono text-sm"
                        value={newPrompt.template || ''}
                        onChange={(e) => setNewPrompt({ ...newPrompt, template: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is-default"
                        checked={newPrompt.isDefault || false}
                        onCheckedChange={(checked) => setNewPrompt({ ...newPrompt, isDefault: checked })}
                      />
                      <Label htmlFor="is-default">Set as Default Template</Label>
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
                    <Button
                      variant="outline"
                      onClick={handleCancelCreatePrompt}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveNewPrompt}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Template
                    </Button>
                  </CardFooter>
                </Card>
              ) : selectedPrompt ? (
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{selectedPrompt.name}</CardTitle>
                        <CardDescription>
                          {selectedPrompt.description}
                        </CardDescription>
                      </div>
                      {selectedPrompt.isDefault && <Badge>Default</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editedPrompt ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="edit-template-name">Template Name</Label>
                          <Input
                            id="edit-template-name"
                            value={editedPrompt.name}
                            onChange={(e) => setEditedPrompt({ ...editedPrompt, name: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-template-description">Description</Label>
                          <Input
                            id="edit-template-description"
                            value={editedPrompt.description || ''}
                            onChange={(e) => setEditedPrompt({ ...editedPrompt, description: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-prompt-template">Prompt Template</Label>
                          <Textarea
                            id="edit-prompt-template"
                            className="min-h-[200px] font-mono text-sm"
                            value={editedPrompt.template}
                            onChange={(e) => setEditedPrompt({ ...editedPrompt, template: e.target.value })}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit-is-default"
                            checked={editedPrompt.isDefault || false}
                            onCheckedChange={(checked) => setEditedPrompt({ ...editedPrompt, isDefault: checked })}
                          />
                          <Label htmlFor="edit-is-default">Set as Default Template</Label>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Label>Prompt Template</Label>
                        <div className="p-4 rounded-md border bg-muted/50 whitespace-pre-wrap font-mono text-sm">
                          {selectedPrompt.template}
                        </div>
                      </div>
                    )}

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
                    <Button
                      variant="outline"
                      onClick={handleDeletePrompt}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                    <Button onClick={handleUpdatePrompt}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">
                      No Template Selected
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Select a template from the list or create a new one
                    </p>
                    <Button onClick={handleCreatePrompt}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Template
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="formatting" className="h-[calc(100%-56px)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Response Formatting</CardTitle>
                <CardDescription>
                  Configure how AI responses are formatted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="intro-message">Introductory Message</Label>
                  <Textarea
                    id="intro-message"
                    placeholder="Optional message to display at the beginning of AI responses"
                    value={formatSettings.introMessage}
                    onChange={(e) => handleFormatSettingChange("introMessage", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conclusion-message">Concluding Message</Label>
                  <Textarea
                    id="conclusion-message"
                    placeholder="Optional message to display at the end of AI responses"
                    value={formatSettings.conclusionMessage}
                    onChange={(e) => handleFormatSettingChange("conclusionMessage", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Response Length</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      Concise
                    </span>
                    <Slider
                      value={[formatSettings.responseLength]}
                      min={0}
                      max={100}
                      step={10}
                      onValueChange={(value) => handleFormatSettingChange("responseLength", value[0])}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">
                      Detailed
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formatting-style">Formatting Style</Label>
                  <Select
                    value={formatSettings.formattingStyle}
                    onValueChange={(value) => handleFormatSettingChange("formattingStyle", value)}
                  >
                    <SelectTrigger id="formatting-style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="structured">
                        Structured (Headings & Lists)
                      </SelectItem>
                      <SelectItem value="paragraph">Paragraph Style</SelectItem>
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
                  <Label htmlFor="tone">Tone</Label>
                  <Select
                    value={formatSettings.tone}
                    onValueChange={(value) => handleFormatSettingChange("tone", value)}
                  >
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-sources"
                    checked={formatSettings.includeSources}
                    onCheckedChange={(checked) => handleFormatSettingChange("includeSources", checked)}
                  />
                  <Label htmlFor="include-sources">Include Data Sources</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-timestamps"
                    checked={formatSettings.includeTimestamps}
                    onCheckedChange={(checked) => handleFormatSettingChange("includeTimestamps", checked)}
                  />
                  <Label htmlFor="include-timestamps">Include Timestamps</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-followup"
                    checked={formatSettings.suggestFollowUp}
                    onCheckedChange={(checked) => handleFormatSettingChange("suggestFollowUp", checked)}
                  />
                  <Label htmlFor="include-followup">
                    Suggest Follow-up Questions
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-confidence"
                    checked={formatSettings.showConfidence}
                    onCheckedChange={(checked) => handleFormatSettingChange("showConfidence", checked)}
                  />
                  <Label htmlFor="include-confidence">
                    Show Confidence Scores
                  </Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Save Formatting Settings
                </Button>
              </CardFooter>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  See how your responses will be formatted
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <ScrollArea className="h-[500px]">
                  <div className="p-4 rounded-md border bg-card">
                    <div className="space-y-4">
                      {formatSettings.introMessage && (
                        <div className="text-sm text-muted-foreground italic">
                          {formatSettings.introMessage}
                        </div>
                      )}

                      {formatSettings.formattingStyle === "structured" ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold">Analysis Summary</h3>
                          <p>
                            Based on the scraped data, I've identified several key trends in the product pricing across different e-commerce platforms.
                          </p>

                          <h4 className="text-md font-semibold">Key Findings</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Average price point is $67.89 across all platforms</li>
                            <li>Competitor A consistently prices 5-10% below market average</li>
                            <li>Premium features correlate with 15% higher conversion rates</li>
                          </ul>

                          <h4 className="text-md font-semibold">Recommendations</h4>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>Consider adjusting base price to $64.99 to remain competitive</li>
                            <li>Highlight premium features more prominently in product descriptions</li>
                            <li>Implement limited-time bundle offers to increase average order value</li>
                          </ol>
                        </div>
                      ) : formatSettings.formattingStyle === "paragraph" ? (
                        <div className="space-y-4">
                          <p>
                            Based on the scraped data, I've identified several key trends in the product pricing across different e-commerce platforms. The average price point is $67.89 across all platforms, with Competitor A consistently pricing 5-10% below market average. Interestingly, premium features correlate with 15% higher conversion rates, suggesting value in highlighting these aspects.
                          </p>
                          <p>
                            I would recommend considering an adjustment to your base price to $64.99 to remain competitive while maintaining profit margins. Additionally, highlighting premium features more prominently in product descriptions could improve conversion rates. Finally, implementing limited-time bundle offers could effectively increase your average order value while providing customers with perceived additional value.
                          </p>
                        </div>
                      ) : formatSettings.formattingStyle === "conversational" ? (
                        <div className="space-y-4">
                          <p>
                            I took a look at the data you scraped, and I noticed some interesting patterns in how products are priced across different platforms.
                          </p>
                          <p>
                            On average, products are selling for about $67.89. One thing that stands out is that Competitor A is consistently undercutting the market by about 5-10%. That's something to keep an eye on!
                          </p>
                          <p>
                            Here's something interesting - products that highlight premium features are seeing 15% better conversion rates. That's a pretty significant difference.
                          </p>
                          <p>
                            If I were you, I might consider dropping your price point slightly to $64.99 to stay competitive. I'd also make those premium features really stand out in your product descriptions. And have you thought about creating some bundle offers? They could help increase your average order value.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 font-mono text-sm">
                          <div>
                            <span className="text-blue-500">// Analysis of E-commerce Pricing Data</span>
                            <br />
                            <span className="text-purple-500">const</span> <span className="text-green-500">marketAnalysis</span> = {`{`}
                            <br />
                            &nbsp;&nbsp;<span className="text-amber-500">averagePrice</span>: <span className="text-blue-500">67.89</span>,
                            <br />
                            &nbsp;&nbsp;<span className="text-amber-500">competitorPricing</span>: {`{`}
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-500">competitorA</span>: <span className="text-green-500">"5-10% below average"</span>,
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-500">competitorB</span>: <span className="text-green-500">"on par with average"</span>
                            <br />
                            &nbsp;&nbsp;{`}`},
                            <br />
                            &nbsp;&nbsp;<span className="text-amber-500">conversionFactors</span>: [
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;{`{`} <span className="text-amber-500">factor</span>: <span className="text-green-500">"premium features"</span>, <span className="text-amber-500">impact</span>: <span className="text-green-500">"15% higher conversion"</span> {`}`}
                            <br />
                            &nbsp;&nbsp;],
                            <br />
                            &nbsp;&nbsp;<span className="text-amber-500">recommendations</span>: [
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-500">"Adjust base price to $64.99"</span>,
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-500">"Highlight premium features"</span>,
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-500">"Implement bundle offers"</span>
                            <br />
                            &nbsp;&nbsp;]
                            <br />
                            {`}`};
                          </div>
                        </div>
                      )}

                      {formatSettings.suggestFollowUp && (
                        <div className="mt-6 pt-4 border-t">
                          <p className="font-medium">Follow-up Questions:</p>
                          <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                            <li>Would you like me to analyze specific competitor strategies in more detail?</li>
                            <li>Should I provide more information about pricing trends over time?</li>
                            <li>Would you like recommendations for specific product categories?</li>
                          </ul>
                        </div>
                      )}

                      {formatSettings.conclusionMessage && (
                        <div className="mt-4 text-sm text-muted-foreground italic">
                          {formatSettings.conclusionMessage}
                        </div>
                      )}

                      <div className="flex flex-col space-y-2 mt-4 text-xs text-muted-foreground">
                        {formatSettings.includeTimestamps && (
                          <div>Generated at: {new Date().toISOString()}</div>
                        )}
                        {formatSettings.includeSources && (
                          <div>Source: E-commerce Product Dataset (ID: 12345)</div>
                        )}
                        {formatSettings.showConfidence && (
                          <div>Confidence score: 92%</div>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  This is a preview based on your current formatting settings
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModelManagement;