import { useState, useCallback } from "react";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
}

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fetchData: (url: string, options?: ApiOptions) => Promise<T | null>;
}

// Get the API base URL from environment variables or use a default
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export function useApi<T = any>(): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(
    async (url: string, options: ApiOptions = {}): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        const { method = "GET", headers = {}, body } = options;

        const requestOptions: RequestInit = {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          ...(body ? { body: JSON.stringify(body) } : {}),
        };

        // Ensure URL has the API base
        const fullUrl = url.startsWith("http")
          ? url
          : `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;

        const response = await fetch(fullUrl, requestOptions);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `API request failed with status ${response.status}`,
          );
        }

        const result = await response.json();
        setData(result.data || result);
        return result.data || result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("An unknown error occurred");
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { data, loading, error, fetchData };
}
