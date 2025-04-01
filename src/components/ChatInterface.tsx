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

  const handleSendMessage = () => {
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

    // Simulate AI typing
    setIsTyping(true);

    // Simulate AI response after delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue, selectedDataset),
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (query: string, datasetId?: string): string => {
    // This would be replaced with actual AI response logic
    const dataset = datasets.find((d) => d.id === datasetId);

    if (
      query.toLowerCase().includes("data") ||
      query.toLowerCase().includes("information")
    ) {
      return `Based on the ${dataset?.name || "selected dataset"}, I've analyzed the following patterns:\n\n- The data contains 245 entries with complete information\n- There are 3 main categories identified\n- The average value across all entries is 78.3\n\nWould you like me to provide more specific insights?`;
    } else if (
      query.toLowerCase().includes("summary") ||
      query.toLowerCase().includes("overview")
    ) {
      return `# Summary of ${dataset?.name || "Dataset"}\n\n## Key Findings\n- Most frequent category: Electronics (42%)\n- Price range: $12.99 - $1,299.99\n- Top brands: TechCo, ElectroMax, DigiPro\n\n## Recommendations\n1. Focus marketing on the $100-$300 price range\n2. Increase inventory for TechCo products\n3. Consider expanding the smartphone accessories category`;
    } else {
      return `I've analyzed the ${dataset?.name || "selected dataset"} based on your query. The data shows interesting patterns that might be relevant to your question. Would you like me to:\n\n1. Provide a detailed breakdown of the data?\n2. Generate visualizations of key metrics?\n3. Compare this dataset with other scraped information?`;
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
