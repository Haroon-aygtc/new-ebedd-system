import { useState, useEffect } from "react";
import { useApi } from "./useApi";

interface Setting {
  id: number;
  category: string;
  key: string;
  value: string;
  description?: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const { data, loading, error, fetchData } = useApi<Setting[]>();

  useEffect(() => {
    fetchData("/settings");
  }, [fetchData]);

  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);

  const getSettingsByCategory = async (category: string) => {
    try {
      return await fetchData(`/settings/category/${category}`);
    } catch (error) {
      console.error("Error getting settings by category:", error);
      throw error;
    }
  };

  const getSettingByKey = async (key: string) => {
    try {
      return await fetchData(`/settings/${key}`);
    } catch (error) {
      console.error("Error getting setting by key:", error);
      throw error;
    }
  };

  const upsertSetting = async (
    category: string,
    key: string,
    value: string,
    description?: string,
  ) => {
    try {
      const result = await fetchData("/settings", {
        method: "POST",
        body: { category, key, value, description },
      });

      if (result) {
        setSettings((prev) => {
          const index = prev.findIndex((s) => s.key === key);
          if (index >= 0) {
            return [...prev.slice(0, index), result, ...prev.slice(index + 1)];
          } else {
            return [...prev, result];
          }
        });
      }

      return result;
    } catch (error) {
      console.error("Error upserting setting:", error);
      throw error;
    }
  };

  const deleteSetting = async (key: string) => {
    try {
      const result = await fetchData(`/settings/${key}`, {
        method: "DELETE",
      });

      if (result) {
        setSettings((prev) => prev.filter((setting) => setting.key !== key));
      }

      return result;
    } catch (error) {
      console.error("Error deleting setting:", error);
      throw error;
    }
  };

  return {
    settings,
    loading,
    error,
    getSettingsByCategory,
    getSettingByKey,
    upsertSetting,
    deleteSetting,
    refreshSettings: () => fetchData("/settings"),
  };
}
