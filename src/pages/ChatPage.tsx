import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Save,
  Send,
  Settings,
  User,
  Wand2,
  Database,
  RefreshCw,
  MessageSquare,
  Plus,
  Trash,
  Clock,
  Sparkles,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

interface Dataset {
  id: string;
  name: string;
  type: "scrape" | "upload" | "api";
  items: number;
  lastUpdated: Date;
}

const ChatPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([2048]);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "E-commerce Data Analysis",
      lastMessage: "What are the top selling products?",
      timestamp: new Date("2023-05-15T14:30:00"),
      messages: [
        {
          id: "1",
          content: "Can you analyze the e-commerce data for me?",
          sender: "user",
          timestamp: new Date("2023-05-15T14:28:00"),
        },
        {
          id: "2",
          content:
            "I'll analyze the e-commerce data for you. What specific insights are you looking for?",
          sender: "ai",
          timestamp: new Date("2023-05-15T14:28:30"),
        },
        {
          id: "3",
          content: "What are the top selling products?",
          sender: "user",
          timestamp: new Date("2023-05-15T14:30:00"),
        },
      ],
    },
    {
      id: "2",
      title: "News Article Summarization",
      lastMessage: "Can you summarize these articles?",
      timestamp: new Date("2023-05-14T10:15:00"),
      messages: [],
    },
  ]);
  const [datasets, setDatasets] = useState<Dataset[]>([
    {
      id: "1",
      name: "E-commerce Product Data",
      type: "scrape",
      items: 1245,
      lastUpdated: new Date("2023-05-15T14:30:00"),
    },
    {
      id: "2",
      name: "News Articles",
      type: "scrape",
      items: 876,
      lastUpdated: new Date("2023-05-14T10:15:00"),
    },
    {
      id: "3",
      name: "Customer Feedback",
      type: "upload",
      items: 532,
      lastUpdated: new Date("2023-05-13T09:20:00"),
    },
    {
      id: "4",
      name: "Social Media Posts",
      type: "api",
      items: 2145,
      lastUpdated: new Date("2023-05-12T16:45:00"),
    },
  ]);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null,
  );
  const [newConversationTitle, setNewConversationTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversation messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      const conversation = conversations.find(
        (c) => c.id === activeConversation,
      );
      if (conversation) {
        setMessages(conversation.messages);
      }
    } else {
      setMessages([]);
    }
  }, [activeConversation, conversations]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    // Create a new conversation if none is active
    if (!activeConversation) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: inputValue.slice(0, 30) + (inputValue.length > 30 ? "..." : ""),
        lastMessage: inputValue,
        timestamp: new Date(),
        messages: [userMessage],
      };
      setConversations([...conversations, newConversation]);
      setActiveConversation(newConversation.id);
    } else {
      // Update the existing conversation
      setConversations(
        conversations.map((conv) =>
          conv.id === activeConversation
            ? {
                ...conv,
                lastMessage: inputValue,
                timestamp: new Date(),
                messages: [...conv.messages, userMessage],
              }
            : conv,
        ),
      );
    }

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = generateAiResponse(inputValue, selectedDataset);
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse,
        sender: "ai",
        timestamp: new Date(),
      };

      const newMessages = [...updatedMessages, aiMessage];
      setMessages(newMessages);

      // Update the conversation with the AI response
      setConversations(
        conversations.map((conv) =>
          conv.id === activeConversation
            ? {
                ...conv,
                messages: newMessages,
              }
            : conv,
        ),
      );

      setIsTyping(false);
    }, 1500);
  };

  const generateAiResponse = (userInput: string, datasetId: string): string => {
    // In a real implementation, this would call an AI service
    // For now, we'll return mock responses based on the input

    const dataset = datasets.find((d) => d.id === datasetId);
    const datasetContext = dataset
      ? `Based on the ${dataset.name} dataset, `
      : "";

    if (
      userInput.toLowerCase().includes("top") ||
      userInput.toLowerCase().includes("best")
    ) {
      return `${datasetContext}I've analyzed the data and found the following top items:

1. Product A - 245 sales, $12,450 revenue
2. Product B - 189 sales, $9,450 revenue
3. Product C - 156 sales, $7,800 revenue
4. Product D - 134 sales, $6,700 revenue
5. Product E - 98 sales, $4,900 revenue

Would you like me to provide more details about any specific product?`;
    }

    if (
      userInput.toLowerCase().includes("trend") ||
      userInput.toLowerCase().includes("pattern")
    ) {
      return `${datasetContext}I've identified several interesting trends in the data:

- Sales are consistently higher on weekends (25% increase)
- Mobile purchases have increased by 34% in the last month
- Customer retention rate is 68%, which is 12% above industry average
- The average order value has increased from $45 to $52

Would you like me to analyze any of these trends in more detail?`;
    }

    if (
      userInput.toLowerCase().includes("summarize") ||
      userInput.toLowerCase().includes("summary")
    ) {
      return `${datasetContext}Here's a summary of the key insights:

## Overall Performance
- Total revenue: $124,500 (↑18% from previous period)
- Total orders: 2,345 (↑12% from previous period)
- Average order value: $53.09 (↑5% from previous period)

## Customer Segments
- New customers: 876 (37% of total)
- Returning customers: 1,469 (63% of total)

## Product Categories
- Electronics: 42% of sales
- Clothing: 28% of sales
- Home goods: 18% of sales
- Other: 12% of sales

Is there a specific area you'd like me to explore further?`;
    }

    // Default response
    return `${datasetContext}I've analyzed the data based on your query "${userInput}". 

The analysis shows several interesting patterns and insights that might be valuable for your business decisions. The data indicates variations in customer behavior, product performance, and market trends.

Would you like me to focus on a specific aspect of this analysis or provide more detailed information about any particular metric?`;
  };

  const handleCreateNewConversation = () => {
    const title = newConversationTitle.trim() || "New Conversation";
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title,
      lastMessage: "",
      timestamp: new Date(),
      messages: [],
    };

    setConversations([...conversations, newConversation]);
    setActiveConversation(newConversation.id);
    setMessages([]);
    setNewConversationTitle("");
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(conversations.filter((conv) => conv.id !== id));
    if (activeConversation === id) {
      setActiveConversation(null);
      setMessages([]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Chat</h1>
          <p className="text-muted-foreground">
            Interact with your data using AI-powered chat
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="chat" className="flex-1">
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="chat" className="h-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
              {/* Conversations sidebar */}
              <div className="md:col-span-1 border rounded-lg overflow-hidden flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Conversations</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setActiveConversation(null);
                        setMessages([]);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="New conversation title"
                      value={newConversationTitle}
                      onChange={(e) => setNewConversationTitle(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleCreateNewConversation}>
                      Create
                    </Button>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {conversations.length > 0 ? (
                      conversations
                        .sort(
                          (a, b) =>
                            b.timestamp.getTime() - a.timestamp.getTime(),
                        )
                        .map((conversation) => (
                          <div
                            key={conversation.id}
                            className={`p-3 rounded-md cursor-pointer mb-2 ${activeConversation === conversation.id ? "bg-accent" : "hover:bg-accent/50"}`}
                            onClick={() =>
                              setActiveConversation(conversation.id)
                            }
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 truncate">
                                <div className="font-medium truncate">
                                  {conversation.title}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {conversation.lastMessage ||
                                    "No messages yet"}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-2 opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteConversation(conversation.id);
                                }}
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {conversation.timestamp.toLocaleDateString()}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No conversations yet. Start a new chat!
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Chat area */}
              <div className="md:col-span-3 border rounded-lg overflow-hidden flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center">
                    <h3 className="font-medium">
                      {activeConversation
                        ? conversations.find((c) => c.id === activeConversation)
                            ?.title || "Chat"
                        : "New Chat"}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={selectedDataset}
                      onValueChange={setSelectedDataset}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select dataset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No dataset</SelectItem>
                        {datasets.map((dataset) => (
                          <SelectItem key={dataset.id} value={dataset.id}>
                            {dataset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon">
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                          >
                            <Avatar
                              className={`h-8 w-8 ${message.sender === "user" ? "ml-2" : "mr-2"}`}
                            >
                              <AvatarFallback
                                className={
                                  message.sender === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-secondary-foreground"
                                }
                              >
                                {message.sender === "user" ? "U" : "AI"}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`rounded-lg px-4 py-2 ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                            >
                              <div className="whitespace-pre-wrap">
                                {message.content}
                              </div>
                              <div className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          Start a New Conversation
                        </h3>
                        <p className="text-muted-foreground max-w-md">
                          Ask questions about your data, request analysis, or
                          get insights from your scraped content.
                        </p>
                      </div>
                    )}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex flex-row">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback className="bg-secondary text-secondary-foreground">
                              AI
                            </AvatarFallback>
                          </Avatar>
                          <div className="rounded-lg px-4 py-2 bg-secondary text-secondary-foreground">
                            <div className="flex space-x-1">
                              <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                              <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                              <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Model Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="model-select">AI Model</Label>
                    <Select
                      value={selectedModel}
                      onValueChange={setSelectedModel}
                    >
                      <SelectTrigger id="model-select">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">
                          GPT-3.5 Turbo
                        </SelectItem>
                        <SelectItem value="claude-3-opus">
                          Claude 3 Opus
                        </SelectItem>
                        <SelectItem value="claude-3-sonnet">
                          Claude 3 Sonnet
                        </SelectItem>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                        <SelectItem value="mistral-large">
                          Mistral Large
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="temperature">Temperature</Label>
                      <span className="text-sm">{temperature[0]}</span>
                    </div>
                    <Slider
                      id="temperature"
                      min={0}
                      max={1}
                      step={0.1}
                      value={temperature}
                      onValueChange={setTemperature}
                    />
                    <p className="text-xs text-muted-foreground">
                      Controls randomness: Lower values are more deterministic,
                      higher values are more creative.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="max-tokens">Max Tokens</Label>
                      <span className="text-sm">{maxTokens[0]}</span>
                    </div>
                    <Slider
                      id="max-tokens"
                      min={256}
                      max={4096}
                      step={256}
                      value={maxTokens}
                      onValueChange={setMaxTokens}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum length of the generated response.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="streaming">Response Streaming</Label>
                      <p className="text-xs text-muted-foreground">
                        Show responses as they're generated
                      </p>
                    </div>
                    <Switch id="streaming" defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Formatting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="formatting-style">Formatting Style</Label>
                    <Select defaultValue="structured">
                      <SelectTrigger id="formatting-style">
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
                    <Label htmlFor="tone">Tone</Label>
                    <Select defaultValue="professional">
                      <SelectTrigger id="tone">
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

                  <div className="space-y-2">
                    <Label htmlFor="intro-message">Introductory Message</Label>
                    <Textarea
                      id="intro-message"
                      placeholder="Optional message to display at the beginning of AI responses"
                      defaultValue="Based on the data you've provided, here's what I found:"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="include-sources">
                        Include Data Sources
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Show where information came from
                      </p>
                    </div>
                    <Switch id="include-sources" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="suggest-followup">
                        Suggest Follow-up Questions
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        AI suggests relevant follow-up questions
                      </p>
                    </div>
                    <Switch id="suggest-followup" defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Data Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Select which datasets the AI can access when generating
                      responses.
                    </p>

                    <div className="border rounded-md">
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Available Datasets</h4>
                          <Badge variant="outline">
                            {datasets.length} datasets
                          </Badge>
                        </div>
                      </div>
                      <div className="p-2">
                        {datasets.map((dataset) => (
                          <div
                            key={dataset.id}
                            className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
                          >
                            <div className="flex items-center">
                              <div className="mr-2">
                                {dataset.type === "scrape" ? (
                                  <Database className="h-4 w-4 text-blue-500" />
                                ) : dataset.type === "upload" ? (
                                  <Database className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Database className="h-4 w-4 text-purple-500" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {dataset.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {dataset.items} items · Updated{" "}
                                  {dataset.lastUpdated.toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <Switch
                              checked={selectedDataset === dataset.id}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedDataset(dataset.id);
                                } else if (selectedDataset === dataset.id) {
                                  setSelectedDataset("");
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ChatPage;
