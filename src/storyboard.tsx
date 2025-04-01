import React from "react";
import { BrowserRouter } from "react-router-dom";
import ScrapingStudio from "./components/ScrapingStudio";
import ChatInterface from "./components/ChatInterface";
import DataDashboard from "./components/DataDashboard";
import ModelManagement from "./components/ModelManagement";

export const ScrapingStudioStoryboard = () => (
  <div className="bg-background p-4">
    <ScrapingStudio />
  </div>
);

export const ChatInterfaceStoryboard = () => (
  <div className="bg-background p-4">
    <ChatInterface />
  </div>
);

export const DataDashboardStoryboard = () => (
  <div className="bg-background p-4">
    <DataDashboard />
  </div>
);

export const ModelManagementStoryboard = () => (
  <div className="bg-background p-4">
    <ModelManagement />
  </div>
);
