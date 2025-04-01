import React from "react";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useApi } from "./useApi";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
  status: "active" | "inactive";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { fetchData } = useApi<User>();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("auth_token");

        if (token) {
          // In a real implementation, this would validate the token with the server
          // For now, we'll just check if there's a token and assume it's valid
          const userData = await fetchData("/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (userData) {
            setUser(userData);
          } else {
            // Token is invalid or expired
            localStorage.removeItem("auth_token");
          }
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
        localStorage.removeItem("auth_token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [fetchData]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would call the login API
      // For now, we'll simulate a successful login for admin@example.com
      if (email === "admin@example.com" && password === "password") {
        const userData: User = {
          id: "1",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
          status: "active",
        };

        // Store the user data and token
        setUser(userData);
        localStorage.setItem("auth_token", "simulated_jwt_token");
        return true;
      } else {
        setError(new Error("Invalid email or password"));
        return false;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Login failed");
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_token");
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
