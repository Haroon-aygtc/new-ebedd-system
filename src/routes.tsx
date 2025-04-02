import React from "react";
import { Navigate, RouteObject } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ScrapingPage from "./pages/ScrapingPage";
import ChatPage from "./pages/ChatPage";
import DataPage from "./pages/DataPage";
import SettingsPage from "./pages/SettingsPage";
import UserManagementPage from "./pages/admin/UserManagementPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "scraping", element: <ScrapingPage /> },
      { path: "chat", element: <ChatPage /> },
      { path: "data", element: <DataPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="admin">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [{ path: "users", element: <UserManagementPage /> }],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
];

export default routes;
