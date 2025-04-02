import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import NewScrapingStudio from "./ScrapingStudio/NewScrapingStudio";
import ChatInterface from "./ChatInterface";
import DataDashboard from "./DataDashboard";
import ModelManagement from "./ModelManagement";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface DataItem {
  id: string;
  url: string;
  timestamp: string;
  status: "completed" | "in-progress" | "failed";
  dataPoints: number;
  dataSize: string;
}

interface Dataset {
  id: string;
  name: string;
  items: DataItem[];
  createdAt: string;
  updatedAt: string;
}

const InterfaceController: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("scraping");
  const [isLoading, setIsLoading] = useState(false);

  // State for datasets and conversations
  const [datasets, setDatasets] = useState<Dataset[]>([
    {
      id: "1",
      name: "E-commerce Product Data",
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "News Articles",
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Social Media Posts",
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);
  const [conversations, setConversations] = useState<
    { id: string; title: string; messages: Message[] }[]
  >([]);
  const [currentDatasetId, setCurrentDatasetId] = useState<string>("1");

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, these would be API calls
        // For now, we'll use the mock data already in state

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({
          title: "Error",
          description: "Failed to load initial data. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [toast]);

  // Handle scraping completion
  const handleScrapingComplete = (newData: any, datasetId?: string) => {
    // Update the appropriate dataset with the new data
    setDatasets((prevDatasets) => {
      return prevDatasets.map((dataset) => {
        if (dataset.id === (datasetId || currentDatasetId)) {
          // Add the new data to the dataset
          const newItems = Array.isArray(newData) ? newData : [newData];
          const updatedItems = [
            ...dataset.items,
            ...newItems.map((item) => ({
              id: item.id || Date.now().toString(),
              url: item.url || "Unknown URL",
              timestamp: item.timestamp || new Date().toISOString(),
              status: item.status || "completed",
              dataPoints: item.dataPoints || Object.keys(item).length,
              dataSize: item.dataSize || "1 KB",
            })),
          ];

          return {
            ...dataset,
            items: updatedItems,
            updatedAt: new Date().toISOString(),
          };
        }
        return dataset;
      });
    });

    // Show success toast
    toast({
      title: "Scraping Complete",
      description: `Successfully scraped data and added to ${datasets.find((d) => d.id === (datasetId || currentDatasetId))?.name}`,
    });

    // Switch to the data dashboard tab
    setActiveTab("data");
  };

  // Handle saving a conversation
  const handleSaveConversation = (messages: Message[]) => {
    const newConversation = {
      id: Date.now().toString(),
      title: `Conversation ${conversations.length + 1}`,
      messages,
    };

    setConversations((prev) => [...prev, newConversation]);

    toast({
      title: "Conversation Saved",
      description: "Your conversation has been saved successfully.",
    });
  };

  // Handle dataset selection
  const handleDatasetSelect = (datasetId: string) => {
    setCurrentDatasetId(datasetId);
  };

  // Handle export data
  const handleExportData = (data: any, format: string) => {
    toast({
      title: "Data Exported",
      description: `Data has been exported in ${format.toUpperCase()} format.`,
    });
  };

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Intelligent Scraping Studio</h1>
          <p className="text-muted-foreground">
            AI-Powered Web Scraping & Chat System
          </p>
        </div>
        <Link to="/browser-demo">
          <Button variant="outline" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Browser Demo
          </Button>
        </Link>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid grid-cols-4 w-full mb-6">
          <TabsTrigger value="scraping">Scraping Studio</TabsTrigger>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="data">Data Dashboard</TabsTrigger>
          <TabsTrigger value="models">Model Management</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : (
            <>
              <TabsContent value="scraping" className="h-full">
                <NewScrapingStudio />
              </TabsContent>

              <TabsContent value="chat" className="h-full">
                <ChatInterface
                  datasets={datasets.map((d) => ({ id: d.id, name: d.name }))}
                  onSaveConversation={handleSaveConversation}
                />
              </TabsContent>

              <TabsContent value="data" className="h-full">
                <DataDashboard />
              </TabsContent>

              <TabsContent value="models" className="h-full">
                <ModelManagement />
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default InterfaceController;
