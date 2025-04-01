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
} from "lucide-react";
import {
  getModels,
  updateModel,
  createModel,
  deleteModel,
} from "@/api/services/modelService";
import { getPromptById } from "@/api/services/promptService";

interface ModelManagementProps {
  className?: string;
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
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError("");
      const fetchedModels = await getModels();
      setModels(fetchedModels);
    } catch (err) {
      console.error("Error fetching models:", err);
      setError("Failed to load models. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateModel = async (modelId: number) => {
    try {
      await updateModel(modelId, { isActive: true });
      // Refresh models to show updated state
      fetchModels();
    } catch (err) {
      console.error("Error activating model:", err);
      setError("Failed to activate model. Please try again later.");
    }
  };

  const handleTestModel = async () => {
    setIsTestLoading(true);
    setTestResponse("");

    try {
      // In a real implementation, this would call the AI model with the test query
      // For now, we'll simulate a response after a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setTestResponse(
        "Based on your last scraping session, I've analyzed the e-commerce product data from 3 websites. The data includes 127 products with an average price of $42.99. Most products (72%) are in stock, with electronics being the most common category. The data quality is high with 98% of entries containing complete information. Would you like me to generate a more detailed report on specific product categories or pricing trends?",
      );
    } catch (err) {
      console.error("Error testing model:", err);
      setTestResponse(
        "An error occurred while testing the model. Please try again.",
      );
    } finally {
      setIsTestLoading(false);
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
          <Button>
            <Edit className="mr-2 h-4 w-4" />
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
                          />
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-2">
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Model Configuration</CardTitle>
                          <CardDescription>
                            Adjust parameters for GPT-4
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="api-key">API Key</Label>
                            <Input
                              id="api-key"
                              type="password"
                              value="sk-*****************************"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="model-version">Model Version</Label>
                            <Select defaultValue="gpt-4">
                              <SelectTrigger id="model-version">
                                <SelectValue placeholder="Select version" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gpt-4">GPT-4</SelectItem>
                                <SelectItem value="gpt-4-turbo">
                                  GPT-4 Turbo
                                </SelectItem>
                                <SelectItem value="gpt-3.5-turbo">
                                  GPT-3.5 Turbo
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Temperature</Label>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                0.0
                              </span>
                              <Slider
                                defaultValue={[0.7]}
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
                            <Label>Max Tokens</Label>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                256
                              </span>
                              <Slider
                                defaultValue={[2048]}
                                min={256}
                                max={4096}
                                step={256}
                                className="flex-1"
                              />
                              <span className="text-sm text-muted-foreground">
                                4096
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Context Retention</Label>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                1
                              </span>
                              <Slider
                                defaultValue={[5]}
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
                            <Label>Data Prioritization</Label>
                            <Select defaultValue="balanced">
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
                            <Switch id="fine-tuning" defaultChecked />
                            <Label htmlFor="fine-tuning">
                              Enable Fine-tuning
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch id="streaming" defaultChecked />
                            <Label htmlFor="streaming">
                              Enable Streaming Responses
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch id="default" defaultChecked />
                            <Label htmlFor="default">
                              Set as Default Model
                            </Label>
                          </div>
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
                        Save Changes
                      </Button>
                    </CardFooter>
                  </Card>
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
                      disabled={isTestLoading}
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
  models: any[];
  onActivate: (modelId: number) => void;
}

const ModelList: React.FC<ModelListProps> = ({ models = [], onActivate }) => {
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
          className={`p-3 rounded-md flex items-center justify-between cursor-pointer hover:bg-accent ${model.isActive ? "bg-accent" : ""}`}
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
                onClick={() => onActivate(model.id)}
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
