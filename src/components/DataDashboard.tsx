import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  Filter,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Table as TableIcon,
  RefreshCw,
  Save,
  Search,
  Trash2,
  FileJson,
  FileSpreadsheet,
  Copy,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

interface DataDashboardProps {
  className?: string;
}

interface DataSet {
  id: string;
  name: string;
  description: string;
  date: string;
  source: string;
  records: number;
  data: any[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const DataDashboard: React.FC<DataDashboardProps> = ({ className = "" }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("datasets");
  const [selectedDataset, setSelectedDataset] = useState<DataSet | null>(null);
  const [datasets, setDatasets] = useState<DataSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState("bar");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [chartConfig, setChartConfig] = useState({
    xAxis: "",
    yAxis: "",
    groupBy: "",
  });

  // Load datasets on component mount
  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    setIsLoading(true);
    try {
      // In a production environment, this would fetch from your API
      // For demo purposes, we'll use mock data
      setTimeout(() => {
        setDatasets(generateMockDatasets());
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading datasets:", error);
      setIsLoading(false);
    }
  };

  const handleDatasetSelect = (dataset: DataSet) => {
    setSelectedDataset(dataset);
    setActiveTab("visualize");

    // Set default chart configuration based on the dataset
    if (dataset.data.length > 0) {
      const keys = Object.keys(dataset.data[0]);
      const numericKeys = keys.filter(
        (key) =>
          typeof dataset.data[0][key] === "number" ||
          !isNaN(parseFloat(dataset.data[0][key])),
      );
      const stringKeys = keys.filter(
        (key) =>
          typeof dataset.data[0][key] === "string" &&
          isNaN(parseFloat(dataset.data[0][key])),
      );

      setChartConfig({
        xAxis: stringKeys[0] || keys[0],
        yAxis: numericKeys[0] || keys[1],
        groupBy: stringKeys[1] || "",
      });
    }
  };

  const handleExport = (format: "json" | "csv") => {
    if (!selectedDataset) return;

    // In a production environment, this would use a proper export library
    // For demo purposes, we'll just show a toast
    toast({
      title: "Export successful",
      description: `Dataset "${selectedDataset.name}" exported as ${format.toUpperCase()}.`,
    });
  };

  const copyToClipboard = () => {
    if (!selectedDataset) return;

    // In a production environment, this would copy the actual data
    // For demo purposes, we'll just show a toast
    toast({
      title: "Copied to clipboard",
      description: "The dataset has been copied to your clipboard.",
    });
  };

  const filteredData = () => {
    if (!selectedDataset) return [];

    let data = selectedDataset.data;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(query),
        ),
      );
    }

    // Apply field filter
    if (filterField && filterValue) {
      data = data.filter((item) =>
        String(item[filterField])
          .toLowerCase()
          .includes(filterValue.toLowerCase()),
      );
    }

    return data;
  };

  const prepareChartData = () => {
    const data = filteredData();
    const { xAxis, yAxis, groupBy } = chartConfig;

    if (!xAxis || !yAxis) return data;

    if (groupBy) {
      // Group data for more complex charts
      const groupedData: Record<string, any> = {};

      data.forEach((item) => {
        const xValue = item[xAxis];
        const yValue = parseFloat(item[yAxis]) || 0;
        const groupValue = String(item[groupBy]);

        if (!groupedData[xValue]) {
          groupedData[xValue] = { [xAxis]: xValue };
        }

        groupedData[xValue][groupValue] =
          (groupedData[xValue][groupValue] || 0) + yValue;
      });

      return Object.values(groupedData);
    }

    // Simple aggregation for basic charts
    const aggregatedData: Record<string, any> = {};

    data.forEach((item) => {
      const xValue = item[xAxis];
      const yValue = parseFloat(item[yAxis]) || 0;

      if (!aggregatedData[xValue]) {
        aggregatedData[xValue] = { [xAxis]: xValue, [yAxis]: 0 };
      }

      aggregatedData[xValue][yAxis] += yValue;
    });

    return Object.values(aggregatedData);
  };

  const renderChart = () => {
    const data = prepareChartData();
    const { xAxis, yAxis, groupBy } = chartConfig;

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
          No data available for visualization
        </div>
      );
    }

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {groupBy ? (
                // Get unique group values
                [
                  ...new Set(
                    selectedDataset?.data.map((item) => item[groupBy]),
                  ),
                ].map((group, index) => (
                  <Bar
                    key={`${group}`}
                    dataKey={`${group}`}
                    fill={COLORS[index % COLORS.length]}
                    name={`${group}`}
                  />
                ))
              ) : (
                <Bar dataKey={yAxis} fill="#8884d8" name={yAxis} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {groupBy ? (
                // Get unique group values
                [
                  ...new Set(
                    selectedDataset?.data.map((item) => item[groupBy]),
                  ),
                ].map((group, index) => (
                  <Line
                    key={`${group}`}
                    type="monotone"
                    dataKey={`${group}`}
                    stroke={COLORS[index % COLORS.length]}
                    name={`${group}`}
                  />
                ))
              ) : (
                <Line
                  type="monotone"
                  dataKey={yAxis}
                  stroke="#8884d8"
                  name={yAxis}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey={yAxis}
                nameKey={xAxis}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Generate mock datasets for demo purposes
  const generateMockDatasets = (): DataSet[] => {
    return [
      {
        id: "1",
        name: "E-commerce Product Data",
        description: "Product information scraped from an e-commerce website",
        date: "2023-05-15",
        source: "example-ecommerce.com",
        records: 120,
        data: Array(120)
          .fill(0)
          .map((_, i) => ({
            id: i + 1,
            product: `Product ${i + 1}`,
            category: [
              "Electronics",
              "Clothing",
              "Home & Kitchen",
              "Books",
              "Toys",
            ][Math.floor(Math.random() * 5)],
            price: parseFloat((10 + Math.random() * 990).toFixed(2)),
            rating: parseFloat((1 + Math.random() * 4).toFixed(1)),
            inStock: Math.random() > 0.2,
            reviews: Math.floor(Math.random() * 500),
          })),
      },
      {
        id: "2",
        name: "News Article Headlines",
        description: "Headlines and metadata from news articles",
        date: "2023-06-22",
        source: "news-aggregator.com",
        records: 85,
        data: Array(85)
          .fill(0)
          .map((_, i) => ({
            id: i + 1,
            headline: `News Headline ${i + 1}`,
            category: [
              "Politics",
              "Technology",
              "Sports",
              "Entertainment",
              "Business",
            ][Math.floor(Math.random() * 5)],
            date: new Date(
              2023,
              Math.floor(Math.random() * 12),
              Math.floor(1 + Math.random() * 28),
            )
              .toISOString()
              .split("T")[0],
            author: `Author ${Math.floor(1 + Math.random() * 20)}`,
            wordCount: Math.floor(300 + Math.random() * 1700),
            comments: Math.floor(Math.random() * 200),
          })),
      },
      {
        id: "3",
        name: "Social Media Metrics",
        description: "Engagement metrics from social media posts",
        date: "2023-07-10",
        source: "social-tracker.com",
        records: 150,
        data: Array(150)
          .fill(0)
          .map((_, i) => ({
            id: i + 1,
            post: `Post ${i + 1}`,
            platform: [
              "Twitter",
              "Facebook",
              "Instagram",
              "LinkedIn",
              "TikTok",
            ][Math.floor(Math.random() * 5)],
            date: new Date(
              2023,
              Math.floor(Math.random() * 12),
              Math.floor(1 + Math.random() * 28),
            )
              .toISOString()
              .split("T")[0],
            likes: Math.floor(Math.random() * 10000),
            shares: Math.floor(Math.random() * 5000),
            comments: Math.floor(Math.random() * 2000),
            impressions: Math.floor(10000 + Math.random() * 990000),
          })),
      },
    ];
  };

  return (
    <div className={`w-full h-full bg-background ${className}`}>
      <div className="flex flex-col h-full">
        <div className="border-b">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="px-4">
              <TabsList>
                <TabsTrigger value="datasets">Datasets</TabsTrigger>
                <TabsTrigger value="visualize" disabled={!selectedDataset}>
                  Visualize
                </TabsTrigger>
                <TabsTrigger value="table" disabled={!selectedDataset}>
                  Data Table
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="datasets" className="h-full p-4 overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Data Dashboards</h2>
                <p className="text-muted-foreground">
                  Select a dataset to visualize and analyze
                </p>
              </div>
              <Button onClick={loadDatasets} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {datasets.map((dataset) => (
                <Card key={dataset.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle>{dataset.name}</CardTitle>
                    <CardDescription>{dataset.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Source:</span>
                        <span>{dataset.source}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{dataset.date}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Records:</span>
                        <Badge variant="outline">{dataset.records}</Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleDatasetSelect(dataset)}
                    >
                      Visualize Data
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="visualize" className="h-full p-4 overflow-auto">
            {selectedDataset && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedDataset.name}
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedDataset.description}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleExport("json")}
                    >
                      <FileJson className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleExport("csv")}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle>Chart Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Chart Type</Label>
                        <div className="flex border rounded-md overflow-hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`flex-1 rounded-none ${chartType === "bar" ? "bg-accent" : ""}`}
                            onClick={() => setChartType("bar")}
                          >
                            <BarChartIcon className="h-4 w-4 mr-1" />
                            Bar
                          </Button>
                          <Separator orientation="vertical" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`flex-1 rounded-none ${chartType === "line" ? "bg-accent" : ""}`}
                            onClick={() => setChartType("line")}
                          >
                            <LineChartIcon className="h-4 w-4 mr-1" />
                            Line
                          </Button>
                          <Separator orientation="vertical" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`flex-1 rounded-none ${chartType === "pie" ? "bg-accent" : ""}`}
                            onClick={() => setChartType("pie")}
                          >
                            <PieChartIcon className="h-4 w-4 mr-1" />
                            Pie
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="x-axis">X Axis</Label>
                        <Select
                          value={chartConfig.xAxis}
                          onValueChange={(value) =>
                            setChartConfig({ ...chartConfig, xAxis: value })
                          }
                        >
                          <SelectTrigger id="x-axis">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedDataset.data.length > 0 &&
                              Object.keys(selectedDataset.data[0]).map(
                                (key) => (
                                  <SelectItem key={key} value={key}>
                                    {key}
                                  </SelectItem>
                                ),
                              )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="y-axis">Y Axis</Label>
                        <Select
                          value={chartConfig.yAxis}
                          onValueChange={(value) =>
                            setChartConfig({ ...chartConfig, yAxis: value })
                          }
                        >
                          <SelectTrigger id="y-axis">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedDataset.data.length > 0 &&
                              Object.keys(selectedDataset.data[0])
                                .filter(
                                  (key) =>
                                    typeof selectedDataset.data[0][key] ===
                                      "number" ||
                                    !isNaN(
                                      parseFloat(selectedDataset.data[0][key]),
                                    ),
                                )
                                .map((key) => (
                                  <SelectItem key={key} value={key}>
                                    {key}
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="group-by">Group By (Optional)</Label>
                        <Select
                          value={chartConfig.groupBy}
                          onValueChange={(value) =>
                            setChartConfig({ ...chartConfig, groupBy: value })
                          }
                        >
                          <SelectTrigger id="group-by">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {selectedDataset.data.length > 0 &&
                              Object.keys(selectedDataset.data[0])
                                .filter(
                                  (key) =>
                                    typeof selectedDataset.data[0][key] ===
                                      "string" && key !== chartConfig.xAxis,
                                )
                                .map((key) => (
                                  <SelectItem key={key} value={key}>
                                    {key}
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label>Filter Data</Label>
                        <div className="flex space-x-2">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search all fields..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Select
                            value={filterField}
                            onValueChange={setFilterField}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Field" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedDataset.data.length > 0 &&
                                Object.keys(selectedDataset.data[0]).map(
                                  (key) => (
                                    <SelectItem key={key} value={key}>
                                      {key}
                                    </SelectItem>
                                  ),
                                )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Input
                            placeholder="Value"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            disabled={!filterField}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-3">
                    <CardHeader>
                      <CardTitle>Data Visualization</CardTitle>
                      <CardDescription>
                        {filteredData().length} records displayed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>{renderChart()}</CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="table" className="h-full p-4 overflow-auto">
            {selectedDataset && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedDataset.name}
                    </h2>
                    <p className="text-muted-foreground">
                      Viewing {filteredData().length} of{" "}
                      {selectedDataset.records} records
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex w-[300px] items-center space-x-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search all fields..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyToClipboard}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleExport("json")}
                      >
                        <FileJson className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleExport("csv")}
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {selectedDataset.data.length > 0 &&
                            Object.keys(selectedDataset.data[0]).map((key) => (
                              <TableHead key={key}>{key}</TableHead>
                            ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData().map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {Object.values(row).map((value, cellIndex) => (
                              <TableCell key={cellIndex}>
                                {typeof value === "boolean"
                                  ? value
                                    ? "Yes"
                                    : "No"
                                  : String(value)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </div>
      </div>
    </div>
  );
};

export default DataDashboard;
