import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Plus, Save, Trash2, ChevronRight, Check } from "lucide-react";
import { useApi } from "@/hooks/useApi";

interface Prompt {
  id: number;
  name: string;
  description: string;
  template: string;
  isDefault: boolean;
}

const PromptManagement = () => {
  const { data: promptsData, loading, error, fetchData } = useApi();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Prompt>>({
    name: "",
    description: "",
    template: "",
    isDefault: false,
  });

  useEffect(() => {
    fetchData("/prompts");
  }, [fetchData]);

  useEffect(() => {
    if (promptsData) {
      setPrompts(promptsData as Prompt[]);
      if (promptsData.length > 0 && !selectedPrompt) {
        setSelectedPrompt(promptsData[0] as Prompt);
      }
    }
  }, [promptsData, selectedPrompt]);

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsEditing(false);
  };

  const handleEditPrompt = () => {
    if (selectedPrompt) {
      setFormData(selectedPrompt);
      setIsEditing(true);
    }
  };

  const handleCreatePrompt = () => {
    setFormData({
      name: "",
      description: "",
      template: "",
      isDefault: false,
    });
    setIsCreating(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isDefault: checked }));
  };

  const handleSavePrompt = async () => {
    try {
      if (isEditing && selectedPrompt) {
        // Update existing prompt
        const updatedPrompt = await fetchData(`/prompts/${selectedPrompt.id}`, {
          method: "PUT",
          body: formData,
        });
        if (updatedPrompt) {
          setPrompts((prev) =>
            prev.map((p) => (p.id === selectedPrompt.id ? updatedPrompt : p)),
          );
          setSelectedPrompt(updatedPrompt as Prompt);
        }
      } else if (isCreating) {
        // Create new prompt
        const newPrompt = await fetchData("/prompts", {
          method: "POST",
          body: formData,
        });
        if (newPrompt) {
          setPrompts((prev) => [...prev, newPrompt]);
          setSelectedPrompt(newPrompt as Prompt);
        }
      }
      setIsEditing(false);
      setIsCreating(false);
    } catch (error) {
      console.error("Error saving prompt:", error);
    }
  };

  const handleDeletePrompt = async () => {
    if (selectedPrompt) {
      try {
        const result = await fetchData(`/prompts/${selectedPrompt.id}`, {
          method: "DELETE",
        });
        if (result) {
          setPrompts((prev) => prev.filter((p) => p.id !== selectedPrompt.id));
          setSelectedPrompt(prompts.length > 1 ? prompts[0] : null);
        }
      } catch (error) {
        console.error("Error deleting prompt:", error);
      }
    }
  };

  // Fetch prompts from API or use fallback if API fails
  useEffect(() => {
    const getPrompts = async () => {
      if (!promptsData && !loading) {
        try {
          const response = await fetch(
            `${process.env.VITE_API_BASE_URL || "http://localhost:3001/api"}/prompts`,
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch prompts: ${response.statusText}`);
          }

          const result = await response.json();
          if (result.data && result.data.length > 0) {
            setPrompts(result.data);
            setSelectedPrompt(
              result.data.find((p: Prompt) => p.isDefault) || result.data[0],
            );
            return;
          }
        } catch (err) {
          console.error("Error fetching prompts directly:", err);
        }

        // If API fails or returns no data, use default prompts
        const defaultPrompts: Prompt[] = [
          {
            id: 1,
            name: "Data Analysis Assistant",
            description: "Specialized prompt for analyzing scraped data",
            template: `You are a data analysis assistant specialized in web scraping data.

Context: {{context}}
Scraped Data: {{scraped_data}}
User Query: {{query}}

Analyze the data provided and respond to the user's query with insights, patterns, and actionable information. Include relevant statistics when possible. Format your response with clear headings and bullet points for readability.`,
            isDefault: true,
          },
          {
            id: 2,
            name: "E-commerce Product Analyzer",
            description: "Analyze product data from e-commerce sites",
            template: `You are an e-commerce product analysis specialist.

Scraped Data: {{scraped_data}}
User Query: {{query}}

Analyze the product data and provide insights on pricing trends, competitive positioning, and product features. Include recommendations for pricing strategy and marketing focus.`,
            isDefault: false,
          },
          {
            id: 3,
            name: "News Summarizer",
            description: "Summarize news articles with key points",
            template: `You are a news summarization assistant.

Article Content: {{scraped_data}}
User Query: {{query}}

Provide a concise summary of the news article, highlighting the key points, main entities involved, and core message. Include a brief analysis of potential implications if relevant.`,
            isDefault: false,
          },
          {
            id: 4,
            name: "SEO Content Analyzer",
            description: "Analyze content for SEO optimization",
            template: `You are an SEO content analysis specialist.

Content: {{scraped_data}}
User Query: {{query}}

Analyze the content for SEO effectiveness. Identify keyword density, heading structure, meta information quality, and content readability. Provide specific recommendations for improving SEO performance.`,
            isDefault: false,
          },
          {
            id: 5,
            name: "Competitive Research",
            description: "Compare data across competitor websites",
            template: `You are a competitive intelligence specialist.

Competitor Data: {{scraped_data}}
User Query: {{query}}

Analyze the competitor data and identify strengths, weaknesses, unique selling propositions, and market positioning. Compare pricing strategies, product offerings, and messaging approaches. Provide strategic recommendations based on this analysis.`,
            isDefault: false,
          },
        ];
        setPrompts(defaultPrompts);
        setSelectedPrompt(defaultPrompts[0]);
      }
    };

    getPrompts();
  }, [promptsData, loading, error, fetchData]);

  return (
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
                {prompts.map((prompt) => (
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
                ))}
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
        <Card className="h-full">
          {selectedPrompt && !isEditing && !isCreating ? (
            <>
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
                <div className="space-y-2">
                  <Label>Prompt Template</Label>
                  <div className="p-4 rounded-md border bg-muted/50 whitespace-pre-wrap font-mono text-sm">
                    {selectedPrompt.template}
                  </div>
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the prompt template.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeletePrompt}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button onClick={handleEditPrompt}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Template
                </Button>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>
                  {isCreating ? "Create New Template" : "Edit Template"}
                </CardTitle>
                <CardDescription>
                  {isCreating
                    ? "Create a new prompt template"
                    : "Edit the selected prompt template"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-description">Description</Label>
                  <Input
                    id="template-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt-template">Prompt Template</Label>
                  <Textarea
                    id="prompt-template"
                    name="template"
                    className="min-h-[200px] font-mono text-sm"
                    value={formData.template}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-default"
                    checked={formData.isDefault}
                    onCheckedChange={handleSwitchChange}
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
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreating(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSavePrompt}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Template
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PromptManagement;
