import { useState, useEffect } from "react";
import { useApi } from "./useApi";

interface Prompt {
  id: number;
  name: string;
  description?: string;
  template: string;
  isDefault?: boolean;
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const { data, loading, error, fetchData } = useApi<Prompt[]>();

  useEffect(() => {
    fetchData("/prompts");
  }, [fetchData]);

  useEffect(() => {
    if (data) {
      setPrompts(data);
    }
  }, [data]);

  const getPromptById = async (id: number) => {
    try {
      return await fetchData(`/prompts/${id}`);
    } catch (error) {
      console.error("Error getting prompt:", error);
      throw error;
    }
  };

  const createPrompt = async (promptData: Omit<Prompt, "id">) => {
    try {
      const result = await fetchData("/prompts", {
        method: "POST",
        body: promptData,
      });

      if (result) {
        setPrompts((prev) => [...prev, result]);
      }

      return result;
    } catch (error) {
      console.error("Error creating prompt:", error);
      throw error;
    }
  };

  const updatePrompt = async (id: number, promptData: Partial<Prompt>) => {
    try {
      const result = await fetchData(`/prompts/${id}`, {
        method: "PUT",
        body: promptData,
      });

      if (result) {
        setPrompts((prev) =>
          prev.map((prompt) => (prompt.id === id ? result : prompt)),
        );
      }

      return result;
    } catch (error) {
      console.error("Error updating prompt:", error);
      throw error;
    }
  };

  const deletePrompt = async (id: number) => {
    try {
      const result = await fetchData(`/prompts/${id}`, {
        method: "DELETE",
      });

      if (result) {
        setPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
      }

      return result;
    } catch (error) {
      console.error("Error deleting prompt:", error);
      throw error;
    }
  };

  return {
    prompts,
    loading,
    error,
    getPromptById,
    createPrompt,
    updatePrompt,
    deletePrompt,
    refreshPrompts: () => fetchData("/prompts"),
  };
}
