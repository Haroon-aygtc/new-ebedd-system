import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bot,
  Save,
  Send,
  Settings,
  User,
  RefreshCw,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  followUpQuestions?: string[];
}

interface ChatInterfaceProps {
  datasets?: Array<{ id: string; name: string }>;
  onSaveConversation?: (messages: Message[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  datasets = [],
  onSaveConversation = () => {},
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = generateAiResponse(inputValue, selectedDataset);
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse.content,
        sender: 'ai',
        timestamp: new Date(),
        followUpQuestions: aiResponse.followUpQuestions,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAiResponse = (userInput: string, datasetId: string): { content: string, followUpQuestions?: string[] } => {
    // In a real implementation, this would call an AI service
    // For now, we'll return mock responses based on the input

    const dataset = datasets.find((d) => d.id === datasetId);
    const datasetContext = dataset
      ? `Based on the ${dataset.name} dataset, `
      : '';

    if (userInput.toLowerCase().includes('top') || userInput.toLowerCase().includes('best')) {
      return {
        content: `${datasetContext}I've analyzed the data and found the following top items:\n\n1. Product A - 245 sales, $12,450 revenue\n2. Product B - 189 sales, $9,450 revenue\n3. Product C - 156 sales, $7,800 revenue\n4. Product D - 134 sales, $6,700 revenue\n5. Product E - 98 sales, $4,900 revenue`,
        followUpQuestions: [
          "Can you provide more details about Product A?",
          "What are the profit margins for these products?",
          "How do these compare to last month's top products?"
        ]
      };
    }

    if (userInput.toLowerCase().includes('trend') || userInput.toLowerCase().includes('pattern')) {
      return {
        content: `${datasetContext}I've identified several interesting trends in the data:\n\n- Sales are consistently higher on weekends (25% increase)\n- Mobile purchases have increased by 34% in the last month\n- Customer retention rate is 68%, which is 12% above industry average\n- The average order value has increased from $45 to $52`,
        followUpQuestions: [
          "What's driving the increase in mobile purchases?",
          "Can you break down the weekend sales by product category?",
          "How does our customer retention compare to competitors?"
        ]
      };
    }

    if (userInput.toLowerCase().includes('summarize') || userInput.toLowerCase().includes('summary')) {
      return {
        content: `${datasetContext}Here's a summary of the key insights:\n\n## Overall Performance\n- Total revenue: $124,500 (↑18% from previous period)\n- Total orders: 2,345 (↑12% from previous period)\n- Average order value: $53.09 (↑5% from previous period)\n\n## Customer Segments\n- New customers: 876 (37% of total)\n- Returning customers: 1,469 (63% of total)\n\n## Product Categories\n- Electronics: 42% of sales\n- Clothing: 28% of sales\n- Home goods: 18% of sales\n- Other: 12% of sales`,
        followUpQuestions: [
          "Which product category has the highest profit margin?",
          "What marketing channels are driving new customer acquisition?",
          "Can you forecast next month's revenue based on these trends?"
        ]
      };
    }

    // Default response
    return {
      content: `${datasetContext}I've analyzed the data based on your query "${userInput}". \n\nThe analysis shows several interesting patterns and insights that might be valuable for your business decisions. The data indicates variations in customer behavior, product performance, and market trends.`,
      followUpQuestions: [
        "Would you like me to focus on a specific aspect of this analysis?",
        "Should I provide more detailed information about any particular metric?",
        "Would you like to see this data visualized in a specific way?"
      ]
    };
  };

  const handleSaveConversation = () => {
    if (messages.length > 0) {
      onSaveConversation(messages);
    }
  };

  const handleFollowUpQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
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

          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
              <SelectItem value="claude">Claude</SelectItem>
              <SelectItem value="llama">Llama 2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveConversation}
            disabled={messages.length === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Chat
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 p-4 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Start a conversation by typing a message below. You can ask
                    questions about your data or request analysis.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ?