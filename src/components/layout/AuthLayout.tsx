import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Database } from "lucide-react";

interface AuthLayoutProps {
  children?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-2">
          <Database className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Intelligent Scraping Studio</h1>
        <p className="text-muted-foreground mt-2">
          AI-Powered Web Scraping & Chat System
        </p>
      </div>
      {children || <Outlet />}
    </div>
  );
};

export default AuthLayout;
