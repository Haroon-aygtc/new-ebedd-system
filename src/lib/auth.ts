import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserRole = "admin" | "user";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuth = create<AuthState>(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate a successful login
        const mockUsers = [
          {
            id: "1",
            email: "admin@example.com",
            name: "Admin User",
            role: "admin" as UserRole,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
          },
          {
            id: "2",
            email: "user@example.com",
            name: "Regular User",
            role: "user" as UserRole,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
          },
        ];

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const user = mockUsers.find((u) => u.email === email);

        if (!user) {
          throw new Error("Invalid credentials");
        }

        // In a real app, you would validate the password here
        // For demo, we'll accept any password

        const token = `mock-jwt-token-${Math.random()}`;

        set({ user, token, isAuthenticated: true });
        return user;
      },
      register: async (name, email, password) => {
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate a successful registration

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newUser = {
          id: `user-${Date.now()}`,
          email,
          name,
          role: "user" as UserRole,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        };

        const token = `mock-jwt-token-${Math.random()}`;

        set({ user: newUser, token, isAuthenticated: true });
        return newUser;
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
