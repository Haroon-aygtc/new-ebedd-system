import { getModelById } from "./modelService";
import {
  getPromptById,
  getDefaultPrompt,
  processPromptTemplate,
} from "./promptService";
import {
  callOpenAI,
  callAnthropic,
  callGoogleAI,
  callMistralAI,
  callModel,
} from "./aiProviders";

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
  userId?: string;
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
  modelId: number = 1, // Default to model ID 1
  datasetId?: string,
  promptId?: number,
  formatOptions?: any,
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

    // Get the prompt template (either specified or default)
    const prompt = promptId
      ? await getPromptById(promptId)
      : await getDefaultPrompt();

    if (!prompt) {
      throw new Error("No prompt template found");
    }

    // Get dataset context if provided
    let datasetContext = "";
    if (datasetId) {
      try {
        const scrapedData = await axios.get(
          `${process.env.VITE_API_BASE_URL || "http://localhost:3001/api"}/scrape/${datasetId}`,
        );
        if (scrapedData.data && scrapedData.data.data) {
          datasetContext = JSON.stringify(scrapedData.data.data);
        }
      } catch (error) {
        console.error("Error fetching dataset:", error);
      }
    }

    // Get previous context from conversation if needed
    const previousMessages = conversation.messages
      .slice(-model.memoryRetention || -5) // Use model's memory retention setting or default to 5
      .map(
        (msg) =>
          `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.content}`,
      )
      .join("\n\n");

    // Prepare the prompt variables
    const promptVariables = {
      context: "Intelligent Scraping Studio AI Assistant",
      scraped_data: datasetContext || "No specific dataset provided",
      query: message,
      previous_messages: previousMessages,
      timestamp: new Date().toISOString(),
      user_name: "User", // This could be replaced with actual user name if available
    };

    // Process the prompt template with variables
    const processedPrompt = processPromptTemplate(
      prompt.template,
      promptVariables,
    );

    // Call the appropriate AI model API based on the provider
    let responseContent = "";

    try {
      // Prepare model options based on formatting preferences
      const modelOptions = {
        temperature:
          formatOptions?.temperature || model.parameters?.temperature || 0.7,
        maxTokens: formatOptions?.maxTokens || model.contextSize || 2048,
        topP: formatOptions?.topP || model.parameters?.topP || 1,
        stream: formatOptions?.stream || model.streamingEnabled || false,
      };

      // Call the model using the unified callModel function
      const modelResponse = await callModel(
        modelId,
        processedPrompt,
        modelOptions,
      );
      responseContent = modelResponse.text;

      // Apply formatting based on formatOptions if needed
      if (formatOptions) {
        // Add introductory message if specified
        if (formatOptions.introMessage) {
          responseContent = `${formatOptions.introMessage}\n\n${responseContent}`;
        }

        // Add concluding message if specified
        if (formatOptions.conclusionMessage) {
          responseContent = `${responseContent}\n\n${formatOptions.conclusionMessage}`;
        }

        // Add follow-up questions if enabled
        if (formatOptions.suggestFollowUp) {
          responseContent = `${responseContent}\n\n**Follow-up Questions You Might Consider:**\n1. Can you provide more details about specific aspects of this data?\n2. How does this compare to industry benchmarks?\n3. What actionable steps would you recommend based on this analysis?`;
        }

        // Add timestamp if enabled
        if (formatOptions.includeTimestamp) {
          responseContent = `${responseContent}\n\n*Generated at: ${new Date().toISOString()}*`;
        }

        // Add data source if enabled and dataset is provided
        if (formatOptions.includeSource && datasetId) {
          responseContent = `${responseContent}\n\n*Source: Dataset ID ${datasetId}*`;
        }
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
export const getConversations = async (
  userId?: string,
): Promise<Conversation[]> => {
  try {
    const query = userId ? { where: { userId } } : {};
    const conversations = await ConversationModel.findAll({
      ...query,
      order: [["updatedAt", "DESC"]],
    });
    return conversations.map(
      (conversation) => conversation.toJSON() as Conversation,
    );
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

/**
 * Get a conversation by ID
 */
export const getConversationById = async (
  id: string,
): Promise<Conversation | null> => {
  try {
    const conversation = await ConversationModel.findByPk(id);
    return conversation ? (conversation.toJSON() as Conversation) : null;
  } catch (error) {
    console.error(`Error fetching conversation with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Save a conversation
 */
export const saveConversation = async (
  messages: Message[],
  title?: string,
  userId?: string,
): Promise<Conversation> => {
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
      userId,
    });

    return conversation.toJSON() as Conversation;
  } catch (error) {
    console.error("Error saving conversation:", error);
    throw error;
  }
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (id: string): Promise<boolean> => {
  try {
    const conversation = await ConversationModel.findByPk(id);
    if (!conversation) return false;

    await conversation.destroy();
    return true;
  } catch (error) {
    console.error(`Error deleting conversation with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Update a conversation title
 */
export const updateConversationTitle = async (
  id: string,
  title: string,
): Promise<Conversation | null> => {
  try {
    const conversation = await ConversationModel.findByPk(id);
    if (!conversation) return null;

    await conversation.update({ title });
    return conversation.toJSON() as Conversation;
  } catch (error) {
    console.error(`Error updating conversation title for ID ${id}:`, error);
    throw error;
  }
};
