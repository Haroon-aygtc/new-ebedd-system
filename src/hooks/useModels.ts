import { useState, useEffect, useCallback } from "react";
import axios from "axios";

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

interface ModelResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: any;
}

export function useModels() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshModels = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("/api/models");
      if (response.data.success) {
        setModels(response.data.data);
      } else {
        setError(response.data.message || "Failed to load models");
      }
    } catch (err: any) {
      console.error("Error fetching models:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load models. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshModels();
  }, [refreshModels]);

  const getModelById = async (id: number): Promise<Model | null> => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`/api/models/${id}`);
      if (response.data.success) {
        return response.data.data;
      } else {
        setError(response.data.message || "Failed to get model");
        return null;
      }
    } catch (err: any) {
      console.error("Error getting model:", err);
      setError(
        err.response?.data?.message ||
          "Failed to get model. Please try again later.",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createModel = async (
    modelData: Omit<Model, "id">,
  ): Promise<Model | null> => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post("/api/models", modelData);
      if (response.data.success) {
        setModels([...models, response.data.data]);
        return response.data.data;
      } else {
        setError(response.data.message || "Failed to create model");
        return null;
      }
    } catch (err: any) {
      console.error("Error creating model:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create model. Please try again later.",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateModel = async (
    id: number,
    modelData: Partial<Model>,
  ): Promise<Model | null> => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.put(`/api/models/${id}`, modelData);
      if (response.data.success) {
        setModels(models.map((m) => (m.id === id ? response.data.data : m)));
        return response.data.data;
      } else {
        setError(response.data.message || "Failed to update model");
        return null;
      }
    } catch (err: any) {
      console.error("Error updating model:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update model. Please try again later.",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteModel = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.delete(`/api/models/${id}`);
      if (response.data.success) {
        setModels(models.filter((m) => m.id !== id));
        return true;
      } else {
        setError(response.data.message || "Failed to delete model");
        return false;
      }
    } catch (err: any) {
      console.error("Error deleting model:", err);
      setError(
        err.response?.data?.message ||
          "Failed to delete model. Please try again later.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getModelsByQueryType = async (queryType: string): Promise<Model[]> => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`/api/models/query-type/${queryType}`);
      if (response.data.success) {
        return response.data.data;
      } else {
        setError(
          response.data.message ||
            `Failed to get models for query type ${queryType}`,
        );
        return [];
      }
    } catch (err: any) {
      console.error(`Error getting models for query type ${queryType}:`, err);
      setError(
        err.response?.data?.message ||
          `Failed to get models for query type ${queryType}. Please try again later.`,
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getDefaultModelForQueryType = async (
    queryType: string,
  ): Promise<Model | null> => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`/api/models/default/${queryType}`);
      if (response.data.success) {
        return response.data.data;
      } else {
        setError(
          response.data.message ||
            `Failed to get default model for query type ${queryType}`,
        );
        return null;
      }
    } catch (err: any) {
      console.error(
        `Error getting default model for query type ${queryType}:`,
        err,
      );
      setError(
        err.response?.data?.message ||
          `Failed to get default model for query type ${queryType}. Please try again later.`,
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultModelForQueryType = async (
    modelId: number,
    queryType: string,
  ): Promise<Model | null> => {
    try {
      return await updateModel(modelId, { defaultForQueryType: queryType });
    } catch (err) {
      console.error(
        `Error setting default model for query type ${queryType}:`,
        err,
      );
      throw err;
    }
  };

  const testModel = async (
    modelId: number,
    prompt: string,
    options: any = {},
  ): Promise<ModelResponse> => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post(`/api/models/${modelId}/test`, {
        prompt,
        options,
      });
      if (response.data.success) {
        return response.data.data;
      } else {
        setError(response.data.message || "Failed to test model");
        throw new Error(response.data.message || "Failed to test model");
      }
    } catch (err: any) {
      console.error("Error testing model:", err);
      setError(
        err.response?.data?.message ||
          "Failed to test model. Please try again later.",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateModelVectorization = async (
    modelId: number,
    data: any,
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post(
        `/api/models/${modelId}/vectorization`,
        { data },
      );
      if (response.data.success) {
        return true;
      } else {
        setError(response.data.message || "Failed to update vectorization");
        return false;
      }
    } catch (err: any) {
      console.error(`Error updating vectorization for model ${modelId}:`, err);
      setError(
        err.response?.data?.message ||
          "Failed to update vectorization. Please try again later.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const retrainModel = async (
    modelId: number,
    trainingData: any,
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post(`/api/models/${modelId}/retrain`, {
        trainingData,
      });
      if (response.data.success) {
        return true;
      } else {
        setError(response.data.message || "Failed to retrain model");
        return false;
      }
    } catch (err: any) {
      console.error(`Error retraining model ${modelId}:`, err);
      setError(
        err.response?.data?.message ||
          "Failed to retrain model. Please try again later.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    models,
    loading,
    error,
    getModelById,
    createModel,
    updateModel,
    deleteModel,
    refreshModels,
    getModelsByQueryType,
    getDefaultModelForQueryType,
    setDefaultModelForQueryType,
    testModel,
    updateModelVectorization,
    retrainModel,
  };
}
