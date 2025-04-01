import { useState, useEffect } from "react";
import { useApi } from "./useApi";

interface Model {
  id: number;
  name: string;
  provider: string;
  apiKey?: string;
  version?: string;
  parameters?: any;
  isActive?: boolean;
}

export function useModels() {
  const [models, setModels] = useState<Model[]>([]);
  const { data, loading, error, fetchData } = useApi<Model[]>();

  useEffect(() => {
    fetchData("/models");
  }, [fetchData]);

  useEffect(() => {
    if (data) {
      setModels(data);
    }
  }, [data]);

  const getModelById = async (id: number) => {
    try {
      return await fetchData(`/models/${id}`);
    } catch (error) {
      console.error("Error getting model:", error);
      throw error;
    }
  };

  const createModel = async (modelData: Omit<Model, "id">) => {
    try {
      const result = await fetchData("/models", {
        method: "POST",
        body: modelData,
      });

      if (result) {
        setModels((prev) => [...prev, result]);
      }

      return result;
    } catch (error) {
      console.error("Error creating model:", error);
      throw error;
    }
  };

  const updateModel = async (id: number, modelData: Partial<Model>) => {
    try {
      const result = await fetchData(`/models/${id}`, {
        method: "PUT",
        body: modelData,
      });

      if (result) {
        setModels((prev) =>
          prev.map((model) => (model.id === id ? result : model)),
        );
      }

      return result;
    } catch (error) {
      console.error("Error updating model:", error);
      throw error;
    }
  };

  const deleteModel = async (id: number) => {
    try {
      const result = await fetchData(`/models/${id}`, {
        method: "DELETE",
      });

      if (result) {
        setModels((prev) => prev.filter((model) => model.id !== id));
      }

      return result;
    } catch (error) {
      console.error("Error deleting model:", error);
      throw error;
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
    refreshModels: () => fetchData("/models"),
  };
}
