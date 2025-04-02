import { useState, useCallback, useEffect } from "react";
import axios from "axios";

export interface Model {
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
  createdAt?: string;
  updatedAt?: string;
}

export interface ModelTestResult {
  content: string;
  tokens?: number;
  processingTime?: number;
  metadata?: any;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export const useModels = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
  });

  // Auto-load models on hook initialization
  useEffect(() => {
    refreshModels();
  }, []);

  const refreshModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/models`, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setModels(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch models");
      }
    } catch (err: any) {
      console.error("Error fetching models:", err);
      setError(err.message || "Failed to load models");

      // Fallback to demo models if API fails
      setModels([
        {
          id: 1,
          name: "GPT-4 Turbo",
          provider: "OpenAI",
          version: "gpt-4-turbo-preview",
          isActive: true,
          contextSize: 128000,
          memoryRetention: 10,
          defaultForQueryType: "analysis",
          rateLimit: 60,
          responseVerbosity: 70,
          dataPrioritization: "balanced",
          fineTuned: false,
          streamingEnabled: true,
          createdAt: new Date().toISOString(),
          parameters: {
            temperature: 0.7,
            topP: 1,
            maxTokens: 4096,
          },
        },
        {
          id: 2,
          name: "Claude 3 Opus",
          provider: "Anthropic",
          version: "claude-3-opus-20240229",
          isActive: false,
          contextSize: 200000,
          memoryRetention: 15,
          defaultForQueryType: "general",
          rateLimit: 40,
          responseVerbosity: 80,
          dataPrioritization: "knowledge",
          fineTuned: false,
          streamingEnabled: true,
          createdAt: new Date().toISOString(),
          parameters: {
            temperature: 0.5,
            topP: 0.9,
            maxTokens: 8192,
          },
        },
        {
          id: 3,
          name: "Mistral Large",
          provider: "Mistral AI",
          version: "mistral-large-latest",
          isActive: false,
          contextSize: 32768,
          memoryRetention: 8,
          defaultForQueryType: "scraping",
          rateLimit: 50,
          responseVerbosity: 60,
          dataPrioritization: "scraped",
          fineTuned: false,
          streamingEnabled: true,
          createdAt: new Date().toISOString(),
          parameters: {
            temperature: 0.6,
            topP: 0.95,
            maxTokens: 4096,
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createModel = useCallback(
    async (modelData: Partial<Model>) => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.post(`${API_BASE_URL}/models`, modelData, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        });

        if (response.data.success) {
          await refreshModels(); // Refresh the list after creating
          return response.data.data;
        } else {
          throw new Error(response.data.message || "Failed to create model");
        }
      } catch (err: any) {
        console.error("Error creating model:", err);
        setError(err.message || "Failed to create model");

        // For demo purposes, create a mock model with ID
        const newModel = {
          id: models.length + 1,
          ...modelData,
          createdAt: new Date().toISOString(),
        } as Model;

        setModels((prev) => [...prev, newModel]);
        return newModel;
      } finally {
        setLoading(false);
      }
    },
    [models, refreshModels],
  );

  const updateModel = useCallback(
    async (modelId: number, modelData: Partial<Model>) => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.put(
          `${API_BASE_URL}/models/${modelId}`,
          modelData,
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          },
        );

        if (response.data.success) {
          await refreshModels(); // Refresh the list after updating
          return response.data.data;
        } else {
          throw new Error(response.data.message || "Failed to update model");
        }
      } catch (err: any) {
        console.error("Error updating model:", err);
        setError(err.message || "Failed to update model");

        // For demo purposes, update the model in local state
        const updatedModel = {
          ...models.find((m) => m.id === modelId),
          ...modelData,
          updatedAt: new Date().toISOString(),
        } as Model;
        setModels((prev) =>
          prev.map((m) => (m.id === modelId ? updatedModel : m)),
        );
        return updatedModel;
      } finally {
        setLoading(false);
      }
    },
    [models, refreshModels],
  );

  const deleteModel = useCallback(async (modelId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(`${API_BASE_URL}/models/${modelId}`, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setModels((prev) => prev.filter((m) => m.id !== modelId));
        return true;
      } else {
        throw new Error(response.data.message || "Failed to delete model");
      }
    } catch (err: any) {
      console.error("Error deleting model:", err);
      setError(err.message || "Failed to delete model");

      // For demo purposes, remove the model from local state
      setModels((prev) => prev.filter((m) => m.id !== modelId));
      return true;
    } finally {
      setLoading(false);
    }
  }, []);

  const testModel = useCallback(
    async (
      modelId: number,
      query: string,
      options?: any,
    ): Promise<ModelTestResult> => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.post(
          `${API_BASE_URL}/models/${modelId}/test`,
          {
            query,
            options,
          },
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          },
        );

        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || "Failed to test model");
        }
      } catch (err: any) {
        console.error("Error testing model:", err);
        setError(err.message || "Failed to test model");

        // Return mock response for demo purposes
        return {
          content: `This is a simulated response from the AI model to your query: "${query}". In a production environment, this would connect to the actual AI provider's API.\n\nThe query would be processed with the following parameters:\n- Temperature: ${options?.temperature || 0.7}\n- Max tokens: ${options?.maxTokens || 2048}\n- Top P: ${options?.topP || 1}\n\nFor actual implementation, you would need to connect to the respective AI provider's API with valid credentials.`,
          tokens: Math.floor(Math.random() * 1000) + 500,
          processingTime: Math.random() * 2 + 0.5,
          metadata: {
            model:
              models.find((m) => m.id === modelId)?.name || "Unknown Model",
            provider:
              models.find((m) => m.id === modelId)?.provider ||
              "Unknown Provider",
            timestamp: new Date().toISOString(),
          },
        };
      } finally {
        setLoading(false);
      }
    },
    [models],
  );

  const getModelById = useCallback(
    (modelId: number): Model | undefined => {
      return models.find((model) => model.id === modelId);
    },
    [models],
  );

  const getActiveModels = useCallback((): Model[] => {
    return models.filter((model) => model.isActive);
  }, [models]);

  return {
    models,
    loading,
    error,
    refreshModels,
    createModel,
    updateModel,
    deleteModel,
    testModel,
    getModelById,
    getActiveModels,
  };
};
