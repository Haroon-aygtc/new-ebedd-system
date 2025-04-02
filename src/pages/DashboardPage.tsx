import React from "react";
import { useAuth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Database,
  MessageSquare,
  BarChart,
  Settings,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      title: "Scraping Studio",
      description: "Configure and run web scraping tasks",
      icon: Database,
      href: "/scraping",
      color: "bg-blue-500",
    },
    {
      title: "AI Chat",
      description: "Interact with your data using AI",
      icon: MessageSquare,
      href: "/chat",
      color: "bg-purple-500",
    },
    {
      title: "Data Dashboard",
      description: "Visualize and analyze your scraped data",
      icon: BarChart,
      href: "/data",
      color: "bg-green-500",
    },
    {
      title: "Settings",
      description: "Configure your account and preferences",
      icon: Settings,
      href: "/settings",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Get started with the Intelligent Scraping Studio
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="overflow-hidden">
            <div className={`h-1.5 ${feature.color}`} />
            <CardHeader>
              <feature.icon className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(feature.href)}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent scraping and AI chat activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              No recent activities yet. Start by creating a new scraping task.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>
              Overview of your usage and data collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Scraped URLs</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Data Points</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">AI Chats</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Saved Templates</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
