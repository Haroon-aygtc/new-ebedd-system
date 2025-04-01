import { getModelById } from "./modelService";
import { getPromptById } from "./promptService";
import { callOpenAI, callAnthropic, callGoogleAI } from "./aiProviders";

// Types
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

// Import the Conversation model
import ConversationModel from "../models/Conversation";
import axios from "axios";

/**
 * Process a message with AI and get a response
 */
export const sendMessage = async (
  message: string,
  conversationId?: string,
  modelId: number = 1, // Default to GPT-4
  datasetId?: string,
): Promise<{ message: Message; conversation: Conversation }> => {
  try {
    // Get or create conversation
    let conversation;

    if (conversationId) {
      conversation = await ConversationModel.findByPk(conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }
      conversation = conversation.toJSON();
    } else {
      // Create new conversation
      conversation = await ConversationModel.create({
        id: Date.now().toString(),
        title: message.substring(0, 30) + (message.length > 30 ? "..." : ""),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      conversation = conversation.toJSON();
    }

    // Add user message to conversation
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    };

    conversation.messages.push(userMessage);

    // Get model and generate response
    const model = await getModelById(modelId);
    if (!model) {
      throw new Error("AI model not found");
    }

    // Get the default prompt if not specified
    const prompt = await getPromptById(1); // Default to Data Analysis Assistant

    // Get dataset context if provided
    let datasetContext = "";
    if (datasetId) {
      try {
        const scrapedData = await axios.get(
          `http://localhost:3001/api/scrape/${datasetId}`,
        );
        if (scrapedData.data && scrapedData.data.data) {
          datasetContext = JSON.stringify(scrapedData.data.data);
        }
      } catch (error) {
        console.error("Error fetching dataset:", error);
      }
    }

    // Prepare the prompt with context
    let promptTemplate = prompt
      ? prompt.template
      : "You are an AI assistant. Please answer the following query: {{query}}";
    promptTemplate = promptTemplate.replace(
      "{{context}}",
      "Intelligent Scraping Studio AI Assistant",
    );
    promptTemplate = promptTemplate.replace(
      "{{scraped_data}}",
      datasetContext || "No specific dataset provided",
    );
    promptTemplate = promptTemplate.replace("{{query}}", message);

    // Call the appropriate AI model API based on the provider
    let responseContent = "";

    try {
      if (model.provider === "OpenAI") {
        // Call OpenAI API
        const openaiResponse = await callOpenAI(promptTemplate, model);
        responseContent = openaiResponse;
      } else if (model.provider === "Anthropic") {
        // Call Anthropic API
        const anthropicResponse = await callAnthropic(promptTemplate, model);
        responseContent = anthropicResponse;
      } else {
        // Fallback to a generic response if the model provider is not implemented
        responseContent = `I've analyzed your query about "${message}". Based on the available data, I can provide insights and recommendations tailored to your specific needs. Would you like me to elaborate on any particular aspect?`;
      }
    } catch (error) {
      console.error("Error calling AI model API:", error);
      responseContent =
        "I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.";
    }

    // Create AI response message
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: responseContent,
      sender: "ai",
      timestamp: new Date(),
    };

    // Add AI message to conversation
    conversation.messages.push(aiMessage);
    conversation.updatedAt = new Date();

    // Update the conversation in the database
    await ConversationModel.update(
      {
        messages: conversation.messages,
        updatedAt: conversation.updatedAt,
      },
      { where: { id: conversation.id } },
    );

    return { message: aiMessage, conversation };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Get all conversations
 */
export const getConversations = async (): Promise<any[]> => {
  const conversations = await ConversationModel.findAll();
  return conversations.map((conversation) => conversation.toJSON());
};

/**
 * Save a conversation
 */
export const saveConversation = async (
  messages: Message[],
  title?: string,
): Promise<any> => {
  try {
    const conversationTitle =
      title ||
      messages[0]?.content.substring(0, 30) +
        (messages[0]?.content.length > 30 ? "..." : "") ||
      "New Conversation";

    const conversation = await ConversationModel.create({
      id: Date.now().toString(),
      title: conversationTitle,
      messages,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return conversation.toJSON();
  } catch (error) {
    console.error("Error saving conversation:", error);
    throw error;
  }
};
