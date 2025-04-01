import { useState } from "react";
import { useApi } from "./useApi";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const { loading, error, fetchData } = useApi();

  const loadConversations = async () => {
    try {
      const result = await fetchData("/chat/conversations");
      if (result) {
        setConversations(result);
      }
      return result;
    } catch (error) {
      console.error("Error loading conversations:", error);
      throw error;
    }
  };

  const sendMessage = async (
    message: string,
    conversationId?: string,
    modelId?: number,
    datasetId?: string,
  ) => {
    try {
      setIsTyping(true);

      const result = await fetchData("/chat", {
        method: "POST",
        body: { message, conversationId, modelId, datasetId },
      });

      if (result) {
        if (conversationId) {
          // Update existing conversation
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversationId ? result.conversation : conv,
            ),
          );
        } else {
          // Add new conversation
          setConversations((prev) => [...prev, result.conversation]);
        }

        setCurrentConversation(result.conversation);
      }

      return result;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    } finally {
      setIsTyping(false);
    }
  };

  const saveConversation = async (messages: Message[], title?: string) => {
    try {
      const result = await fetchData("/chat/save", {
        method: "POST",
        body: { messages, title },
      });

      if (result) {
        setConversations((prev) => [...prev, result]);
      }

      return result;
    } catch (error) {
      console.error("Error saving conversation:", error);
      throw error;
    }
  };

  return {
    conversations,
    currentConversation,
    isTyping,
    loading,
    error,
    loadConversations,
    sendMessage,
    saveConversation,
    setCurrentConversation,
  };
}
