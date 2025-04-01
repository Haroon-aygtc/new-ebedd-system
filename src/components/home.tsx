import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MoonIcon,
  SunIcon,
  LayoutDashboardIcon,
  CodeIcon,
  MessageSquareIcon,
  BarChart3Icon,
  Settings2Icon,
} from "lucide-react";
import ScrapingStudio from "./ScrapingStudio";
import ChatInterface from "./ChatInterface";
import DataDashboard from "./DataDashboard";
import ModelManagement from "./ModelManagement";

const Home = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("scraping");

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real implementation, this would toggle a class on the body or use a theme context
  };

  return (
    <div className={`min-h-screen bg-background ${isDarkMode ? "dark" : ""}`}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border">
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold">Scraping Studio</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Button
              variant={activeTab === "scraping" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("scraping")}
            >
              <LayoutDashboardIcon className="mr-2 h-4 w-4" />
              Scraping Studio
            </Button>
            <Button
              variant={activeTab === "chat" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("chat")}
            >
              <MessageSquareIcon className="mr-2 h-4 w-4" />
              Chat Interface
            </Button>
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("dashboard")}
            >
              <BarChart3Icon className="mr-2 h-4 w-4" />
              Data Dashboard
            </Button>
            <Button
              variant={activeTab === "models" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("models")}
            >
              <Settings2Icon className="mr-2 h-4 w-4" />
              Model Management
            </Button>
          </nav>
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? (
                <>
                  <SunIcon className="mr-2 h-4 w-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <MoonIcon className="mr-2 h-4 w-4" />
                  Dark Mode
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-border flex items-center justify-between px-4">
            <div className="md:hidden">
              <Button variant="ghost" size="icon">
                <CodeIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Export
              </Button>
              <Avatar>
                <AvatarImage
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=user123"
                  alt="User"
                />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="md:hidden mb-4">
                <TabsList className="w-full">
                  <TabsTrigger value="scraping" className="flex-1">
                    <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                    Scraping
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex-1">
                    <MessageSquareIcon className="mr-2 h-4 w-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="dashboard" className="flex-1">
                    <BarChart3Icon className="mr-2 h-4 w-4" />
                    Data
                  </TabsTrigger>
                  <TabsTrigger value="models" className="flex-1">
                    <Settings2Icon className="mr-2 h-4 w-4" />
                    Models
                  </TabsTrigger>
                </TabsList>
              </div>

              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <TabsContent value="scraping" className="mt-0">
                    <ScrapingStudio />
                  </TabsContent>
                  <TabsContent value="chat" className="mt-0">
                    <ChatInterface />
                  </TabsContent>
                  <TabsContent value="dashboard" className="mt-0">
                    <DataDashboard />
                  </TabsContent>
                  <TabsContent value="models" className="mt-0">
                    <ModelManagement />
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
