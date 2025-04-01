import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DownloadIcon,
  FilterIcon,
  BarChart3Icon,
  PieChartIcon,
  LineChartIcon,
  TableIcon,
  RefreshCwIcon,
} from "lucide-react";

interface DataItem {
  id: string;
  url: string;
  timestamp: string;
  status: "completed" | "in-progress" | "failed";
  dataPoints: number;
  dataSize: string;
}

const DataDashboard = () => {
  const [activeTab, setActiveTab] = useState("charts");
  const [selectedDataset, setSelectedDataset] = useState("recent-scrape");
  const [filterValue, setFilterValue] = useState("");

  // Mock data for demonstration
  const datasets = [
    { id: "recent-scrape", name: "Recent Scrape (e-commerce)" },
    { id: "news-articles", name: "News Articles (May 2023)" },
    { id: "product-catalog", name: "Product Catalog" },
    { id: "competitor-analysis", name: "Competitor Analysis" },
  ];

  const tableData: DataItem[] = [
    {
      id: "1",
      url: "https://example.com/products",
      timestamp: "2023-05-15 14:30:22",
      status: "completed",
      dataPoints: 1245,
      dataSize: "3.2 MB",
    },
    {
      id: "2",
      url: "https://example.com/categories/electronics",
      timestamp: "2023-05-15 14:35:10",
      status: "completed",
      dataPoints: 876,
      dataSize: "1.8 MB",
    },
    {
      id: "3",
      url: "https://example.com/categories/clothing",
      timestamp: "2023-05-15 14:40:05",
      status: "in-progress",
      dataPoints: 432,
      dataSize: "0.9 MB",
    },
    {
      id: "4",
      url: "https://example.com/categories/home",
      timestamp: "2023-05-15 14:45:30",
      status: "failed",
      dataPoints: 0,
      dataSize: "0 KB",
    },
    {
      id: "5",
      url: "https://example.com/categories/beauty",
      timestamp: "2023-05-15 14:50:15",
      status: "completed",
      dataPoints: 654,
      dataSize: "1.4 MB",
    },
  ];

  const filteredData = tableData.filter(
    (item) =>
      item.url.toLowerCase().includes(filterValue.toLowerCase()) ||
      item.status.toLowerCase().includes(filterValue.toLowerCase()),
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Data Dashboard</h1>
          <p className="text-muted-foreground">
            Visualize and analyze your scraped data
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedDataset} onValueChange={setSelectedDataset}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select dataset" />
            </SelectTrigger>
            <SelectContent>
              {datasets.map((dataset) => (
                <SelectItem key={dataset.id} value={dataset.id}>
                  {dataset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px] mb-6">
          <TabsTrigger value="charts" className="flex items-center">
            <BarChart3Icon className="mr-2 h-4 w-4" />
            Charts & Visualizations
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center">
            <TableIcon className="mr-2 h-4 w-4" />
            Data Tables
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Distribution</CardTitle>
                <CardDescription>
                  Distribution of scraped data by category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center">
                  <PieChartIcon className="h-24 w-24 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Pie chart visualization would appear here
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scraping Progress</CardTitle>
                <CardDescription>
                  Real-time scraping progress over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center">
                  <LineChartIcon className="h-24 w-24 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Line chart visualization would appear here
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Data Points by URL</CardTitle>
                <CardDescription>
                  Number of data points extracted from each URL
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center">
                  <BarChart3Icon className="h-24 w-24 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Bar chart visualization would appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" className="flex items-center">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export Visualizations
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="tables" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Scraped Data</CardTitle>
                  <CardDescription>
                    Detailed view of all scraped data
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <FilterIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Filter data..."
                      className="pl-8 w-[250px]"
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Data Points</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.url}
                        </TableCell>
                        <TableCell>{item.timestamp}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-right">
                          {item.dataPoints.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.dataSize}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-4 text-muted-foreground"
                      >
                        No data found matching your filter criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataDashboard;
