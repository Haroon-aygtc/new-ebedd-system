import { useState, useEffect } from "react";
import { useApi } from "./useApi";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
  status: "active" | "inactive";
  createdAt: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const { data, loading, error, fetchData } = useApi<User[]>();

  useEffect(() => {
    fetchData("/users");
  }, [fetchData]);

  useEffect(() => {
    if (data) {
      setUsers(data as User[]);
    }
  }, [data]);

  const getUserById = async (id: string) => {
    try {
      return await fetchData(`/users/${id}`);
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  };

  const createUser = async (userData: Omit<User, "id" | "createdAt">) => {
    try {
      const result = await fetchData("/users", {
        method: "POST",
        body: userData,
      });

      if (result) {
        if (Array.isArray(result)) {
          console.error("Unexpected array response when creating a user.");
          return;
        }
        setUsers((prev) => [...prev, result as User]);
      }

      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const result = await fetchData(`/users/${id}`, {
        method: "PUT",
        body: userData,
      });

      if (result) {
        setUsers((prev) =>
          prev.map((user) => (user.id === id && !Array.isArray(result) ? result as User : user)),
        );
      }

      return result;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const result = await fetchData(`/users/${id}`, {
        method: "DELETE",
      });

      if (result) {
        setUsers((prev) => prev.filter((user) => user.id !== id));
      }

      return result;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  return {
    users,
    loading,
    error,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers: () => fetchData("/users"),
  };
}
