import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart3,
  Users,
  Settings,
  MessageSquare,
  Database,
  Bot,
  LogOut,
} from "lucide-react";
import ModelManagement from "../ModelManagement";
import PromptManagement from "./PromptManagement";
import UserManagement from "./UserManagement";
import SystemSettings from "./SystemSettings";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border">
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("overview")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={activeTab === "users" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("users")}
            >
              <Users className="mr-2 h-4 w-4" />
              User Management
            </Button>
            <Button
              variant={activeTab === "models" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("models")}
            >
              <Bot className="mr-2 h-4 w-4" />
              Model Management
            </Button>
            <Button
              variant={activeTab === "prompts" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("prompts")}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Prompt Templates
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </Button>
          </nav>
          <div className="p-4 border-t border-border">
            <Button variant="outline" className="w-full" asChild>
              <a href="/">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </a>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-border flex items-center justify-between px-4">
            <div className="md:hidden">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                View Site
              </Button>
              <Avatar>
                <AvatarImage
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin123"
                  alt="Admin"
                />
                <AvatarFallback>AD</AvatarFallback>
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
                  <TabsTrigger value="overview" className="flex-1">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex-1">
                    <Users className="mr-2 h-4 w-4" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="models" className="flex-1">
                    <Bot className="mr-2 h-4 w-4" />
                    Models
                  </TabsTrigger>
                  <TabsTrigger value="prompts" className="flex-1">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Prompts
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex-1">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>

              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <TabsContent value="overview" className="mt-0">
                    <AdminOverview />
                  </TabsContent>
                  <TabsContent value="users" className="mt-0">
                    <UserManagement />
                  </TabsContent>
                  <TabsContent value="models" className="mt-0">
                    <ModelManagement />
                  </TabsContent>
                  <TabsContent value="prompts" className="mt-0">
                    <PromptManagement />
                  </TabsContent>
                  <TabsContent value="settings" className="mt-0">
                    <SystemSettings />
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

const AdminOverview = () => {
  // Mock data for demonstration
  const stats = [
    {
      title: "Total Users",
      value: "128",
      icon: <Users className="h-5 w-5" />,
      change: "+12%",
      positive: true,
    },
    {
      title: "Active Scraping Jobs",
      value: "24",
      icon: <Database className="h-5 w-5" />,
      change: "+5%",
      positive: true,
    },
    {
      title: "AI Chat Sessions",
      value: "1,842",
      icon: <MessageSquare className="h-5 w-5" />,
      change: "+18%",
      positive: true,
    },
    {
      title: "Active Models",
      value: "5",
      icon: <Bot className="h-5 w-5" />,
      change: "0%",
      positive: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your system's performance and usage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && (
                <p
                  className={`text-xs ${stat.positive ? "text-green-500" : stat.positive === false ? "text-red-500" : "text-muted-foreground"}`}
                >
                  {stat.change} from last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  user: "John Doe",
                  action: "Started a new scraping job",
                  time: "2 hours ago",
                },
                {
                  user: "Jane Smith",
                  action: "Updated AI model configuration",
                  time: "5 hours ago",
                },
                {
                  user: "Robert Johnson",
                  action: "Created a new prompt template",
                  time: "1 day ago",
                },
                {
                  user: "Emily Davis",
                  action: "Exported scraped data",
                  time: "2 days ago",
                },
                {
                  user: "Michael Wilson",
                  action: "Added a new user account",
                  time: "3 days ago",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.action}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "Database Connection",
                  status: "Operational",
                  statusColor: "text-green-500",
                },
                {
                  name: "API Services",
                  status: "Operational",
                  statusColor: "text-green-500",
                },
                {
                  name: "Web Scraping Engine",
                  status: "Operational",
                  statusColor: "text-green-500",
                },
                {
                  name: "AI Model Integration",
                  status: "Operational",
                  statusColor: "text-green-500",
                },
                {
                  name: "Storage System",
                  status: "Operational",
                  statusColor: "text-green-500",
                },
              ].map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0"
                >
                  <p className="font-medium">{service.name}</p>
                  <p className={`${service.statusColor} font-medium`}>
                    {service.status}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
