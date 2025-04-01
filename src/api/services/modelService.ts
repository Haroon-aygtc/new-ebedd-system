// Types
interface Model {
  id: number;
  name: string;
  provider: string;
  apiKey?: string;
  version?: string;
  parameters?: any;
  isActive?: boolean;
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
      },
      {
        name: "Claude 3 Opus",
        provider: "Anthropic",
        version: "claude-3-opus-20240229",
        isActive: false,
      },
      {
        name: "Gemini Pro",
        provider: "Google",
        version: "gemini-pro",
        isActive: false,
      },
      {
        name: "Mistral Large",
        provider: "Mistral AI",
        version: "mistral-large-latest",
        isActive: false,
      },
      {
        name: "Llama 3",
        provider: "Meta",
        version: "llama-3-70b",
        isActive: false,
      },
      {
        name: "GPT-3.5 Turbo",
        provider: "OpenAI",
        version: "gpt-3.5-turbo",
        isActive: false,
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
