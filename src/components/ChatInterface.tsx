import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, User, Bot, X, ChevronDown, Settings, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatInterfaceProps {
  datasets?: Array<{ id: string; name: string }>;
  onSaveConversation?: (messages: Message[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  datasets = [
    { id: "1", name: "E-commerce Product Data" },
    { id: "2", name: "News Articles" },
    { id: "3", name: "Social Media Posts" },
  ],
  onSaveConversation = () => {},
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI assistant. I can help you analyze the data you've scraped. What would you like to know?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [selectedDataset, setSelectedDataset] = useState<string | undefined>(
    datasets[0]?.id,
  );
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Show AI typing indicator
    setIsTyping(true);

    try {
      // Get AI response
      const responseContent = await generateAIResponse(
        inputValue,
        selectedDataset,
      );

      // Create AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I'm sorry, I encountered an error while processing your request. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = async (
    query: string,
    datasetId?: string,
  ): Promise<string> => {
    try {
      // Get the dataset if available
      const dataset = datasets.find((d) => d.id === datasetId);

      // Call the chat service API
      const response = await fetch(
        `${process.env.VITE_API_BASE_URL || "http://localhost:3001/api"}/chat/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
          },
          body: JSON.stringify({
            message: query,
            datasetId: datasetId,
            modelId: 1, // Default model ID, could be made configurable
            conversationId: null, // New conversation
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to get AI response: ${response.statusText}`);
      }

      const result = await response.json();
      return (
        result.data?.message?.content ||
        "I'm sorry, I couldn't process your request at this time."
      );
    } catch (error) {
      console.error("Error generating AI response:", error);
      return `I apologize, but I encountered an error processing your request. The system may be experiencing technical difficulties. Would you like me to try a different approach to analyze the ${datasetId ? datasets.find((d) => d.id === datasetId)?.name || "dataset" : "data"}?`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: "1",
        content:
          "Hello! I'm your AI assistant. I can help you analyze the data you've scraped. What would you like to know?",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };

  const saveConversation = () => {
    onSaveConversation(messages);
  };

  // Function to render message content with markdown-like formatting
  const renderMessageContent = (content: string) => {
    // Simple markdown-like rendering
    const formattedContent = content.split("\n\n").map((paragraph, i) => {
      // Handle headers
      if (paragraph.startsWith("# ")) {
        return (
          <h1 key={i} className="text-xl font-bold mt-2 mb-1">
            {paragraph.substring(2)}
          </h1>
        );
      } else if (paragraph.startsWith("## ")) {
        return (
          <h2 key={i} className="text-lg font-bold mt-2 mb-1">
            {paragraph.substring(3)}
          </h2>
        );
      }

      // Handle lists
      if (paragraph.includes("\n- ")) {
        const [listTitle, ...items] = paragraph.split("\n- ");
        return (
          <div key={i} className="my-2">
            {listTitle && <p>{listTitle}</p>}
            <ul className="list-disc pl-5 mt-1">
              {items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          </div>
        );
      }

      // Handle numbered lists
      if (paragraph.includes("\n1. ")) {
        const [listTitle, ...items] = paragraph.split("\n");
        return (
          <div key={i} className="my-2">
            {listTitle && <p>{listTitle}</p>}
            <ol className="list-decimal pl-5 mt-1">
              {items.map((item, j) => {
                const content = item.substring(item.indexOf(".") + 1).trim();
                return <li key={j}>{content}</li>;
              })}
            </ol>
          </div>
        );
      }

      return (
        <p key={i} className="my-2">
          {paragraph}
        </p>
      );
    });

    return <div>{formattedContent}</div>;
  };

  return (
    <Card className="w-full h-full flex flex-col bg-background border rounded-xl shadow-md overflow-hidden">
      <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between">
        <div className="flex items-center">
          <CardTitle className="text-xl font-semibold">
            AI Chat Assistant
          </CardTitle>
          <Badge variant="secondary" className="ml-2">
            {datasets.find((d) => d.id === selectedDataset)?.name ||
              "No dataset"}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={clearConversation}>
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={saveConversation}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
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
                      {message.sender === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg px-4 py-2 ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                  >
                    {renderMessageContent(message.content)}
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex flex-row">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-secondary text-secondary-foreground">
                    <div className="flex space-x-1">
                      <motion.div
                        className="h-2 w-2 rounded-full bg-current"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          repeatDelay: 0.2,
                        }}
                      />
                      <motion.div
                        className="h-2 w-2 rounded-full bg-current"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          delay: 0.2,
                          repeatDelay: 0.2,
                        }}
                      />
                      <motion.div
                        className="h-2 w-2 rounded-full bg-current"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          delay: 0.4,
                          repeatDelay: 0.2,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <CardFooter className="p-4 border-t">
          <div className="w-full space-y-2">
            <div className="flex items-center space-x-2">
              <Select
                value={selectedDataset}
                onValueChange={setSelectedDataset}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Configure AI settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask a question about your data..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
};

export default ChatInterface;
