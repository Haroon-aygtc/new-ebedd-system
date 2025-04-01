// Types
interface Model {
  id: number;
  name: string;
  provider: string;
  apiKey?: string;
  version?: string;
  parameters?: any;
  isActive?: boolean;
  contextSize?: number;
  memoryRetention?: number;
  defaultForQueryType?: string;
  rateLimit?: number;
  responseVerbosity?: number;
  dataPrioritization?: string;
  fineTuned?: boolean;
  streamingEnabled?: boolean;
}

// Import the Model model
import AIModel from "../models/Model";

// Initialize default models if none exist
const initializeDefaultModels = async () => {
  const count = await AIModel.count();
  if (count === 0) {
    await AIModel.bulkCreate([
      {
        name: "GPT-4",
        provider: "OpenAI",
        version: "gpt-4",
        isActive: true,
        contextSize: 8192,
        memoryRetention: 5,
        defaultForQueryType: "chatbot",
        rateLimit: 60,
        responseVerbosity: 70,
        dataPrioritization: "balanced",
        fineTuned: false,
        streamingEnabled: true,
        parameters: {
          temperature: 0.7,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
        },
      },
      {
        name: "Claude 3 Opus",
        provider: "Anthropic",
        version: "claude-3-opus-20240229",
        isActive: false,
        contextSize: 100000,
        memoryRetention: 8,
        defaultForQueryType: "analysis",
        rateLimit: 40,
        responseVerbosity: 80,
        dataPrioritization: "knowledge",
        fineTuned: false,
        streamingEnabled: true,
        parameters: {
          temperature: 0.5,
          topK: 40,
          topP: 0.9,
        },
      },
      {
        name: "Gemini Pro",
        provider: "Google",
        version: "gemini-pro",
        isActive: false,
        contextSize: 32768,
        memoryRetention: 4,
        defaultForQueryType: "scraping",
        rateLimit: 60,
        responseVerbosity: 60,
        dataPrioritization: "scraped",
        fineTuned: false,
        streamingEnabled: true,
        parameters: {
          temperature: 0.4,
          topK: 40,
          topP: 0.95,
        },
      },
      {
        name: "Mistral Large",
        provider: "Mistral AI",
        version: "mistral-large-latest",
        isActive: false,
        contextSize: 32768,
        memoryRetention: 3,
        defaultForQueryType: "vector",
        rateLimit: 50,
        responseVerbosity: 40,
        dataPrioritization: "balanced",
        fineTuned: true,
        streamingEnabled: true,
        parameters: {
          temperature: 0.7,
          topP: 0.9,
        },
      },
      {
        name: "Llama 3",
        provider: "Meta",
        version: "llama-3-70b",
        isActive: false,
        contextSize: 8192,
        memoryRetention: 2,
        defaultForQueryType: "general",
        rateLimit: 30,
        responseVerbosity: 50,
        dataPrioritization: "balanced",
        fineTuned: false,
        streamingEnabled: false,
        parameters: {
          temperature: 0.8,
          topP: 0.95,
        },
      },
      {
        name: "GPT-3.5 Turbo",
        provider: "OpenAI",
        version: "gpt-3.5-turbo",
        isActive: false,
        contextSize: 16385,
        memoryRetention: 3,
        defaultForQueryType: "general",
        rateLimit: 90,
        responseVerbosity: 40,
        dataPrioritization: "balanced",
        fineTuned: false,
        streamingEnabled: true,
        parameters: {
          temperature: 0.9,
          topP: 1,
        },
      },
      {
        name: "Grok-1",
        provider: "xAI",
        version: "grok-1",
        isActive: false,
        contextSize: 8192,
        memoryRetention: 4,
        defaultForQueryType: "chatbot",
        rateLimit: 40,
        responseVerbosity: 75,
        dataPrioritization: "knowledge",
        fineTuned: false,
        streamingEnabled: true,
        parameters: {
          temperature: 0.8,
          topP: 0.9,
        },
      },
      {
        name: "DeepSeek Coder",
        provider: "DeepSeek",
        version: "deepseek-coder-33b-instruct",
        isActive: false,
        contextSize: 16384,
        memoryRetention: 3,
        defaultForQueryType: "code",
        rateLimit: 30,
        responseVerbosity: 60,
        dataPrioritization: "knowledge",
        fineTuned: true,
        streamingEnabled: false,
        parameters: {
          temperature: 0.2,
          topP: 0.95,
        },
      },
      {
        name: "Hugging Face Mixtral",
        provider: "Hugging Face",
        version: "mixtral-8x7b-instruct",
        isActive: false,
        contextSize: 32768,
        memoryRetention: 4,
        defaultForQueryType: "general",
        rateLimit: 20,
        responseVerbosity: 50,
        dataPrioritization: "balanced",
        fineTuned: false,
        streamingEnabled: true,
        parameters: {
          temperature: 0.7,
          topP: 0.9,
        },
      },
    ]);
  }
};

// Call initialization
initializeDefaultModels();

/**
 * Get all models
 */
export const getModels = async (): Promise<any[]> => {
  const models = await AIModel.findAll();
  return models.map((model) => model.toJSON());
};

/**
 * Get a model by ID
 */
export const getModelById = async (id: number): Promise<any | null> => {
  const model = await AIModel.findByPk(id);
  return model ? model.toJSON() : null;
};

/**
 * Create a new model
 */
export const createModel = async (modelData: Omit<any, "id">): Promise<any> => {
  // If setting this model as active, deactivate all others
  if (modelData.isActive) {
    await AIModel.update({ isActive: false }, { where: {} });
  }

  const newModel = await AIModel.create({
    ...modelData,
    isActive: modelData.isActive ?? false,
  });

  return newModel.toJSON();
};

/**
 * Update a model
 */
export const updateModel = async (
  id: number,
  modelData: Partial<any>,
): Promise<any | null> => {
  const model = await AIModel.findByPk(id);
  if (!model) return null;

  // If setting this model as active, deactivate all others
  if (modelData.isActive) {
    await AIModel.update({ isActive: false }, { where: {} });
  }

  await model.update(modelData);
  return model.toJSON();
};

/**
 * Delete a model
 */
export const deleteModel = async (id: number): Promise<boolean> => {
  const model = await AIModel.findByPk(id);
  if (!model) return false;

  await model.destroy();
  return true;
};

/**
 * Get models by query type
 */
export const getModelsByQueryType = async (
  queryType: string,
): Promise<any[]> => {
  const models = await AIModel.findAll({
    where: {
      defaultForQueryType: queryType,
    },
  });
  return models.map((model) => model.toJSON());
};

/**
 * Get default model for query type
 */
export const getDefaultModelForQueryType = async (
  queryType: string,
): Promise<any | null> => {
  const models = await getModelsByQueryType(queryType);

  // Find active model for this query type
  const activeModel = models.find((model) => model.isActive);

  // If no active model found, return first one or null
  return activeModel || (models.length > 0 ? models[0] : null);
};
