import React, { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Save,
  RefreshCw,
  Database,
  Shield,
  Globe,
  Bot,
  Cpu,
} from "lucide-react";

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Configure global system settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="scraping">Scraping</TabsTrigger>
          <TabsTrigger value="ai">AI & Chat</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic system settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    defaultValue="Intelligent Scraping Studio"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Textarea
                    id="site-description"
                    defaultValue="A comprehensive platform combining intelligent web scraping with an AI chat interface, featuring real-time data visualization and customizable AI responses."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    defaultValue="admin@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select defaultValue="yyyy-mm-dd">
                      <SelectTrigger id="date-format">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                        <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time-format">Time Format</Label>
                    <Select defaultValue="24h">
                      <SelectTrigger id="time-format">
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24-hour</SelectItem>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="dark-mode" defaultChecked />
                  <Label htmlFor="dark-mode">Enable Dark Mode by Default</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="analytics" defaultChecked />
                  <Label htmlFor="analytics">Enable Usage Analytics</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="ml-auto"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Configuration</CardTitle>
                <CardDescription>
                  Configure database connection settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="db-host">Database Host</Label>
                    <Input id="db-host" defaultValue="localhost" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="db-port">Database Port</Label>
                    <Input id="db-port" defaultValue="3306" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="db-name">Database Name</Label>
                    <Input id="db-name" defaultValue="scraping_ai" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="db-user">Database User</Label>
                    <Input id="db-user" defaultValue="root" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="db-password">Database Password</Label>
                    <Input
                      id="db-password"
                      type="password"
                      defaultValue="password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="db-type">Database Type</Label>
                    <Select defaultValue="mysql">
                      <SelectTrigger id="db-type">
                        <SelectValue placeholder="Select database type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="postgres">PostgreSQL</SelectItem>
                        <SelectItem value="sqlite">SQLite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" className="flex items-center">
                    <Database className="mr-2 h-4 w-4" />
                    Test Connection
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="ml-auto"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="scraping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scraping Engine Settings</CardTitle>
                <CardDescription>
                  Configure web scraping engine parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Default Request Timeout (ms)</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">5000</span>
                    <Slider
                      defaultValue={[30000]}
                      min={5000}
                      max={60000}
                      step={1000}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">60000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Default Request Delay (ms)</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">0</span>
                    <Slider
                      defaultValue={[2000]}
                      min={0}
                      max={10000}
                      step={500}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">10000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-agent">Default User Agent</Label>
                  <Input
                    id="user-agent"
                    defaultValue="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proxy-config">Proxy Configuration</Label>
                  <Select defaultValue="none">
                    <SelectTrigger id="proxy-config">
                      <SelectValue placeholder="Select proxy configuration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Proxy</SelectItem>
                      <SelectItem value="auto">Auto-Rotate</SelectItem>
                      <SelectItem value="custom">Custom Proxy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-proxy">Custom Proxy URL</Label>
                  <Input id="custom-proxy" placeholder="http://proxy:port" />
                </div>

                <Separator />

                <div className="flex items-center space-x-2">
                  <Switch id="stealth-mode" defaultChecked />
                  <Label htmlFor="stealth-mode">Enable Stealth Mode</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="js-rendering" defaultChecked />
                  <Label htmlFor="js-rendering">
                    Enable JavaScript Rendering
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="auto-pagination" />
                  <Label htmlFor="auto-pagination">
                    Enable Auto-Pagination
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="rate-limiting" defaultChecked />
                  <Label htmlFor="rate-limiting">Enable Rate Limiting</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="ml-auto"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Storage Settings</CardTitle>
                <CardDescription>
                  Configure how scraped data is stored and processed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="default-format">Default Export Format</Label>
                  <Select defaultValue="json">
                    <SelectTrigger id="default-format">
                      <SelectValue placeholder="Select default format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storage-path">Storage Path</Label>
                  <Input id="storage-path" defaultValue="./data" />
                </div>

                <div className="space-y-2">
                  <Label>Data Retention Period (days)</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">7</span>
                    <Slider
                      defaultValue={[30]}
                      min={7}
                      max={365}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">365</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="auto-clean" defaultChecked />
                  <Label htmlFor="auto-clean">
                    Automatically Clean Old Data
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="compress-data" defaultChecked />
                  <Label htmlFor="compress-data">Compress Stored Data</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="vectorize-data" />
                  <Label htmlFor="vectorize-data">
                    Automatically Vectorize Text Data
                  </Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="ml-auto"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Configuration</CardTitle>
                <CardDescription>
                  Configure AI models and response settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="default-model">Default AI Model</Label>
                  <Select defaultValue="gpt-4">
                    <SelectTrigger id="default-model">
                      <SelectValue placeholder="Select default model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="claude-3">Claude 3 Opus</SelectItem>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                      <SelectItem value="mistral-large">
                        Mistral Large
                      </SelectItem>
                      <SelectItem value="llama-3">Llama 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Temperature</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">0.0</span>
                    <Slider
                      defaultValue={[0.7]}
                      min={0}
                      max={1}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">1.0</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Default Max Tokens</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">256</span>
                    <Slider
                      defaultValue={[2048]}
                      min={256}
                      max={4096}
                      step={256}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">4096</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-prompt">
                    Default Prompt Template
                  </Label>
                  <Select defaultValue="data-analysis">
                    <SelectTrigger id="default-prompt">
                      <SelectValue placeholder="Select default prompt" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data-analysis">
                        Data Analysis Assistant
                      </SelectItem>
                      <SelectItem value="ecommerce">
                        E-commerce Product Analyzer
                      </SelectItem>
                      <SelectItem value="news">News Summarizer</SelectItem>
                      <SelectItem value="seo">SEO Content Analyzer</SelectItem>
                      <SelectItem value="competitive">
                        Competitive Research
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center space-x-2">
                  <Switch id="streaming" defaultChecked />
                  <Label htmlFor="streaming">Enable Streaming Responses</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="follow-up" defaultChecked />
                  <Label htmlFor="follow-up">Enable Follow-up Questions</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="context-retention" defaultChecked />
                  <Label htmlFor="context-retention">
                    Enable Context Retention
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label>Context Window Size</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">1</span>
                    <Slider
                      defaultValue={[5]}
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">10</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="ml-auto"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Formatting</CardTitle>
                <CardDescription>
                  Configure how AI responses are formatted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="intro-message">Introductory Message</Label>
                  <Textarea
                    id="intro-message"
                    placeholder="Optional message to display at the beginning of AI responses"
                    defaultValue="Based on the data you've provided, here's what I found:"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conclusion-message">Concluding Message</Label>
                  <Textarea
                    id="conclusion-message"
                    placeholder="Optional message to display at the end of AI responses"
                    defaultValue="Is there anything specific you'd like me to explain further?"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Response Length</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      Concise
                    </span>
                    <Slider defaultValue={[50]} className="flex-1" />
                    <span className="text-sm text-muted-foreground">
                      Detailed
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formatting-style">Formatting Style</Label>
                  <Select defaultValue="structured">
                    <SelectTrigger id="formatting-style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="structured">
                        Structured (Headings & Lists)
                      </SelectItem>
                      <SelectItem value="paragraph">Paragraph Style</SelectItem>
                      <SelectItem value="conversational">
                        Conversational
                      </SelectItem>
                      <SelectItem value="technical">
                        Technical Documentation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select defaultValue="professional">
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center space-x-2">
                  <Switch id="include-sources" defaultChecked />
                  <Label htmlFor="include-sources">Include Data Sources</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="include-timestamps" defaultChecked />
                  <Label htmlFor="include-timestamps">Include Timestamps</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="include-followup" defaultChecked />
                  <Label htmlFor="include-followup">
                    Suggest Follow-up Questions
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="include-confidence" />
                  <Label htmlFor="include-confidence">
                    Show Confidence Scores
                  </Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="ml-auto"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="auth-method">Authentication Method</Label>
                  <Select defaultValue="jwt">
                    <SelectTrigger id="auth-method">
                      <SelectValue placeholder="Select authentication method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jwt">JWT</SelectItem>
                      <SelectItem value="session">Session-based</SelectItem>
                      <SelectItem value="oauth">OAuth 2.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jwt-secret">JWT Secret</Label>
                  <Input
                    id="jwt-secret"
                    type="password"
                    defaultValue="your-jwt-secret-key"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Token Expiration (hours)</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">1</span>
                    <Slider
                      defaultValue={[24]}
                      min={1}
                      max={168}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">168</span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center space-x-2">
                  <Switch id="rate-limit" defaultChecked />
                  <Label htmlFor="rate-limit">Enable API Rate Limiting</Label>
                </div>

                <div className="space-y-2">
                  <Label>Rate Limit (requests per minute)</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">10</span>
                    <Slider
                      defaultValue={[60]}
                      min={10}
                      max={1000}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">1000</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="cors" defaultChecked />
                  <Label htmlFor="cors">Enable CORS</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cors-origins">Allowed Origins</Label>
                  <Input
                    id="cors-origins"
                    defaultValue="*"
                    placeholder="Comma-separated list of allowed origins"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="csrf" defaultChecked />
                  <Label htmlFor="csrf">Enable CSRF Protection</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="xss" defaultChecked />
                  <Label htmlFor="xss">Enable XSS Protection</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="ml-auto"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage API keys for external services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    defaultValue="sk-..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                  <Input
                    id="anthropic-key"
                    type="password"
                    defaultValue="sk-ant-..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google-key">Google AI API Key</Label>
                  <Input id="google-key" type="password" defaultValue="..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mistral-key">Mistral AI API Key</Label>
                  <Input id="mistral-key" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="huggingface-key">Hugging Face API Key</Label>
                  <Input id="huggingface-key" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="ml-auto"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
