import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Maximize2, Minimize2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./ChatWidget.module.css";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { sendMessage } from "@/api/services/chatService";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatWidgetProps {
  initialOpen?: boolean;
  title?: string;
  subtitle?: string;
  position?: "bottom-right" | "bottom-left";
  avatarSrc?: string;
  onSendMessage?: (message: string) => Promise<string>;
  modelId?: number;
  datasetId?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  initialOpen = false,
  title = "AI Assistant",
  subtitle = "Ask me anything about your data",
  position = "bottom-right",
  avatarSrc = "https://api.dicebear.com/7.x/avataaars/svg?seed=aiassistant",
  onSendMessage,
  modelId = 1,
  datasetId,
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      let aiResponse: string;

      if (onSendMessage) {
        // Use the provided callback if available
        aiResponse = await onSendMessage(message);
      } else {
        // Use the chat service
        try {
          const response = await sendMessage(
            message,
            conversationId,
            modelId,
            datasetId,
          );
          aiResponse = response.message.content;

          // Set the conversation ID for future messages
          if (!conversationId) {
            setConversationId(response.conversation.id);
          }
        } catch (error) {
          console.error("Error from chat service:", error);
          aiResponse = "Sorry, I encountered an error processing your request.";
        }
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);

      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Sorry, I encountered an error processing your request.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const positionClass = position === "bottom-left" ? "left-4" : "right-4";

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
    <div className={`fixed ${positionClass} bottom-4 z-50`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`bg-card border rounded-lg shadow-lg flex flex-col ${isExpanded ? "fixed inset-4 z-50" : "w-80 h-96"}`}
          >
            {/* Chat Header */}
            <div className="p-3 border-b flex items-center justify-between bg-primary text-primary-foreground rounded-t-lg">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={avatarSrc} alt="AI Assistant" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-sm">{title}</h3>
                  <p className="text-xs opacity-80">{subtitle}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary/80"
                  onClick={toggleExpand}
                >
                  {isExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary/80"
                  onClick={toggleChat}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-4">
                  <div className="text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Send a message to start the conversation</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {renderMessageContent(msg.content)}
                      </div>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-foreground/50 bounceDot" />
                      <div className="w-2 h-2 rounded-full bg-foreground/50 bounceDot" />
                      <div className="w-2 h-2 rounded-full bg-foreground/50 bounceDot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t">
              <div className="flex items-center space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
          onClick={toggleChat}
        >
          <MessageSquare className="h-6 w-6" />
        </motion.button>
      )}
    </div>
  );
};

export default ChatWidget;
