import axios from "axios";
import { getModelById } from "./modelService";

/**
 * Interface for model request options
 */
interface ModelRequestOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
  stopSequences?: string[];
}

/**
 * Interface for model response
 */
interface ModelResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: any;
}

/**
 * Call OpenAI API with the given prompt and model configuration
 */
export const callOpenAI = async (
  model: any,
  prompt: string,
  options: ModelRequestOptions = {},
): Promise<ModelResponse> => {
  try {
    const apiKey = model.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "your_openai_api_key") {
      throw new Error(
        "Valid OpenAI API key not found. Please configure your API key in the settings.",
      );
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: model.version || "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature:
          options.temperature || model.parameters?.temperature || 0.7,
        max_tokens: options.maxTokens || model.parameters?.max_tokens || 2048,
        top_p: options.topP || model.parameters?.topP || 1,
        frequency_penalty:
          options.frequencyPenalty || model.parameters?.frequencyPenalty || 0,
        presence_penalty:
          options.presencePenalty || model.parameters?.presencePenalty || 0,
        stream: options.stream || model.streamingEnabled || false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    return {
      text: response.data.choices[0].message.content,
      usage: {
        promptTokens: response.data.usage.prompt_tokens,
        completionTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens,
      },
      metadata: {
        model: model.version,
        provider: model.provider,
      },
    };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
};

/**
 * Call Anthropic API with the given prompt and model configuration
 */
export const callAnthropic = async (
  model: any,
  prompt: string,
  options: ModelRequestOptions = {},
): Promise<ModelResponse> => {
  try {
    const apiKey = model.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your_anthropic_api_key") {
      throw new Error(
        "Valid Anthropic API key not found. Please configure your API key in the settings.",
      );
    }

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: model.version || "claude-3-opus-20240229",
        messages: [{ role: "user", content: prompt }],
        max_tokens: options.maxTokens || model.parameters?.max_tokens || 2048,
        temperature:
          options.temperature || model.parameters?.temperature || 0.7,
        top_p: options.topP || model.parameters?.topP || 0.9,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
      },
    );

    return {
      text: response.data.content[0].text,
      usage: {
        promptTokens: response.data.usage?.input_tokens || 0,
        completionTokens: response.data.usage?.output_tokens || 0,
        totalTokens:
          (response.data.usage?.input_tokens || 0) +
          (response.data.usage?.output_tokens || 0),
      },
      metadata: {
        model: model.version,
        provider: model.provider,
      },
    };
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    throw error;
  }
};

/**
 * Call Google AI API with the given prompt and model configuration
 */
export const callGoogleAI = async (
  model: any,
  prompt: string,
  options: ModelRequestOptions = {},
): Promise<ModelResponse> => {
  try {
    const apiKey = model.apiKey || process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey === "your_google_api_key") {
      throw new Error(
        "Valid Google AI API key not found. Please configure your API key in the settings.",
      );
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${model.version || "gemini-1.5-flash"}:generateContent`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature:
            options.temperature || model.parameters?.temperature || 0.7,
          topP: options.topP || model.parameters?.topP || 0.9,
          maxOutputTokens:
            options.maxTokens || model.parameters?.max_tokens || 2048,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          key: apiKey,
        },
      },
    );

    return {
      text: response.data.candidates[0].content.parts[0].text,
      usage: {
        promptTokens: response.data.usageMetadata?.promptTokenCount || 0,
        completionTokens:
          response.data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens:
          (response.data.usageMetadata?.promptTokenCount || 0) +
          (response.data.usageMetadata?.candidatesTokenCount || 0),
      },
      metadata: {
        model: model.version,
        provider: model.provider,
      },
    };
  } catch (error) {
    console.error("Error calling Google AI API:", error);
    throw error;
  }
};

/**
 * Call Mistral AI API with the given prompt and model configuration
 */
export const callMistralAI = async (
  model: any,
  prompt: string,
  options: ModelRequestOptions = {},
): Promise<ModelResponse> => {
  try {
    const apiKey = model.apiKey || process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Valid Mistral AI API key not found. Please configure your API key in the settings.",
      );
    }

    const response = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: model.version || "mistral-large-latest",
        messages: [{ role: "user", content: prompt }],
        max_tokens: options.maxTokens || model.parameters?.max_tokens || 2048,
        temperature:
          options.temperature || model.parameters?.temperature || 0.7,
        top_p: options.topP || model.parameters?.topP || 0.9,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    return {
      text: response.data.choices[0].message.content,
      usage: {
        promptTokens: response.data.usage?.prompt_tokens || 0,
        completionTokens: response.data.usage?.completion_tokens || 0,
        totalTokens: response.data.usage?.total_tokens || 0,
      },
      metadata: {
        model: model.version,
        provider: model.provider,
      },
    };
  } catch (error) {
    console.error("Error calling Mistral AI API:", error);
    throw error;
  }
};

/**
 * Call an AI model with the given prompt
 */
export const callModel = async (
  modelId: number,
  prompt: string,
  options: ModelRequestOptions = {},
): Promise<ModelResponse> => {
  try {
    // Get model configuration from database
    const model = await getModelById(modelId);
    if (!model) {
      throw new Error(`Model with ID ${modelId} not found`);
    }

    // Call the appropriate provider based on the model's provider
    switch (model.provider.toLowerCase()) {
      case "openai":
        return await callOpenAI(model, prompt, options);
      case "anthropic":
        return await callAnthropic(model, prompt, options);
      case "google":
        return await callGoogleAI(model, prompt, options);
      case "mistral":
      case "mistral ai":
        return await callMistralAI(model, prompt, options);
      default:
        throw new Error(`Unsupported provider: ${model.provider}`);
    }
  } catch (error) {
    console.error("Error calling AI model:", error);
    throw error;
  }
};

/**
 * Update model vectorization
 */
export const updateModelVectorization = async (
  modelId: number,
  data: any,
): Promise<boolean> => {
  try {
    // Get the model
    const model = await getModelById(modelId);
    if (!model) {
      throw new Error(`Model with ID ${modelId} not found`);
    }

    // In a real implementation, this would update the model's vector database
    console.log(`Updating vectorization for model ${modelId} with data:`, data);

    // Return success
    return true;
  } catch (error) {
    console.error(`Error updating vectorization for model ${modelId}:`, error);
    throw error;
  }
};

/**
 * Retrain a model with new data
 */
export const retrainModel = async (
  modelId: number,
  trainingData: any,
): Promise<boolean> => {
  try {
    // Get the model
    const model = await getModelById(modelId);
    if (!model) {
      throw new Error(`Model with ID ${modelId} not found`);
    }

    // In a real implementation, this would initiate a model retraining job
    console.log(`Retraining model ${modelId} with data:`, trainingData);

    // Return success
    return true;
  } catch (error) {
    console.error(`Error retraining model ${modelId}:`, error);
    throw error;
  }
};
