import React from "react";
import { BrowserRouter } from "react-router-dom";
import ScrapingStudio from "./components/ScrapingStudio";
import ChatInterface from "./components/ChatInterface";
import DataDashboard from "./components/DataDashboard";
import ModelManagement from "./components/ModelManagement";

export const ScrapingStudioStoryboard = () => (
  <div className="bg-background p-4">
    <div className="mb-4 p-4 border border-yellow-400 bg-yellow-50 rounded-md">
      <h3 className="text-lg font-bold mb-2">How to Use Element Selection:</h3>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Enter a URL in the input field and click "Load URL"</li>
        <li>
          Click the{" "}
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
            </svg>{" "}
            Select Elements
          </span>{" "}
          button in the top right
        </li>
        <li>Hover over elements in the preview to see them highlighted</li>
        <li>Click on an element to select it for scraping</li>
        <li>Selected elements will appear in the Selectors tab</li>
      </ol>
    </div>
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
