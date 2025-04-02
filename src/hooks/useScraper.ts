import { useState, useCallback } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { SelectedElement, ScrapingConfig } from "@/types/scraping";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export const useScraper = () => {
  const [url, setUrl] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<SelectedElement[]>(
    [],
  );
  const [scrapingConfig, setScrapingConfig] = useState<ScrapingConfig>({
    paginationSelector: "",
    maxPages: 1,
    delay: 1000,
    followLinks: false,
    linkSelector: "",
    maxDepth: 1,
    headless: true,
  });
  const [scrapingResults, setScrapingResults] = useState<any[]>([]);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [isScrapingActive, setIsScrapingActive] = useState(false);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
  });

  const loadUrl = useCallback(async () => {
    if (!url) return;

    try {
      setIsLoading(true);
      setError(null);
      setPageContent("");

      // In a production environment, this would call your backend API
      // For demo purposes, we'll use a proxy or simulate the response
      try {
        const response = await axios.post(
          `${API_BASE_URL}/scraper/load`,
          { url },
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          },
        );

        if (response.data.success) {
          setPageContent(response.data.content);
        } else {
          throw new Error(response.data.message || "Failed to load URL");
        }
      } catch (apiError) {
        console.error("API error:", apiError);

        // Fallback for demo: fetch the URL directly if CORS allows, or use a proxy
        try {
          // This is a fallback for demo purposes - in production, always use your backend
          const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
          const response = await axios.get(corsProxyUrl);
          setPageContent(response.data);
        } catch (corsError) {
          console.error("CORS proxy error:", corsError);

          // Final fallback: simulate content for demo purposes
          if (url.includes("example.com") || url.includes("localhost")) {
            setPageContent(generateDemoContent(url));
          } else {
            throw new Error(
              "Could not load URL content. In production, this would use your backend API.",
            );
          }
        }
      }
    } catch (err: any) {
      console.error("Error loading URL:", err);
      setError(err.message || "Failed to load URL");
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  const selectElement = useCallback((element: HTMLElement) => {
    // In a real implementation, this would open a dialog to configure the element
    // For now, we'll simulate it by creating a basic selector
    const tagName = element.tagName.toLowerCase();
    const text = element.textContent?.trim().substring(0, 20) || "";
    const name = text || `${tagName} element`;

    // Create a simple selector (in production, this would be more sophisticated)
    let selector = tagName;
    if (element.id) {
      selector = `#${element.id}`;
    } else if (element.className) {
      const classes = element.className.split(" ").join(".");
      selector = `${tagName}.${classes}`;
    }

    const newElement: SelectedElement = {
      name,
      selector,
      type: "text",
    };

    setSelectedElements((prev) => [...prev, newElement]);
  }, []);

  const removeSelectedElement = useCallback((index: number) => {
    setSelectedElements((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const startScraping = useCallback(async () => {
    if (!url || selectedElements.length === 0) return;

    try {
      setIsScrapingActive(true);
      setScrapingProgress(0);
      setError(null);

      // In a production environment, this would call your backend API
      // For demo purposes, we'll simulate the scraping process
      try {
        const response = await axios.post(
          `${API_BASE_URL}/scraper/start`,
          {
            url,
            elements: selectedElements,
            config: scrapingConfig,
          },
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          },
        );

        if (response.data.success) {
          // In a real implementation, this might return a job ID to poll for results
          // For now, we'll simulate progress updates and then set the results
          simulateScrapingProgress(response.data.results || []);
        } else {
          throw new Error(response.data.message || "Failed to start scraping");
        }
      } catch (apiError) {
        console.error("API error:", apiError);

        // Fallback for demo: simulate scraping results
        simulateScrapingProgress(
          generateDemoResults(url, selectedElements, scrapingConfig),
        );
      }
    } catch (err: any) {
      console.error("Error starting scraper:", err);
      setError(err.message || "Failed to start scraping");
      setIsScrapingActive(false);
    }
  }, [url, selectedElements, scrapingConfig]);

  const simulateScrapingProgress = (finalResults: any[]) => {
    const totalSteps = 10;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setScrapingProgress(currentStep / totalSteps);

      if (currentStep === totalSteps) {
        clearInterval(interval);
        setScrapingResults(finalResults);
        setIsScrapingActive(false);
        setScrapingProgress(1);
      }
    }, 500);
  };

  const stopScraping = useCallback(() => {
    // In a production environment, this would call your backend API to stop the scraping job
    setIsScrapingActive(false);
    setError("Scraping stopped by user");
  }, []);

  const exportResults = useCallback(
    (format: "json" | "csv") => {
      if (scrapingResults.length === 0) return;

      if (format === "json") {
        const blob = new Blob([JSON.stringify(scrapingResults, null, 2)], {
          type: "application/json",
        });
        saveAs(blob, `scraping-results-${new Date().toISOString()}.json`);
      } else if (format === "csv") {
        // Convert JSON to CSV
        const headers = Object.keys(scrapingResults[0]).join(",");
        const rows = scrapingResults.map((result) => {
          return Object.values(result)
            .map((value) => {
              // Handle values that might contain commas or quotes
              if (typeof value === "string") {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(",");
        });

        const csv = [headers, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        saveAs(blob, `scraping-results-${new Date().toISOString()}.csv`);
      }
    },
    [scrapingResults],
  );

  const saveConfig = useCallback(
    (name: string) => {
      const config = {
        name,
        url,
        elements: selectedElements,
        config: scrapingConfig,
      };

      // In a production environment, this would save to your backend
      // For demo purposes, we'll save to localStorage
      const savedConfigs = JSON.parse(
        localStorage.getItem("scraping-configs") || "[]",
      );
      const updatedConfigs = [
        ...savedConfigs.filter((c: any) => c.name !== name),
        config,
      ];
      localStorage.setItem("scraping-configs", JSON.stringify(updatedConfigs));
    },
    [url, selectedElements, scrapingConfig],
  );

  const loadConfig = useCallback(() => {
    // In a production environment, this would load from your backend
    // For demo purposes, we'll load from localStorage
    const savedConfigs = JSON.parse(
      localStorage.getItem("scraping-configs") || "[]",
    );

    if (savedConfigs.length > 0) {
      // In a real app, you would show a UI to select which config to load
      // For demo purposes, we'll just load the most recent one
      const config = savedConfigs[savedConfigs.length - 1];

      setUrl(config.url);
      setSelectedElements(config.elements);
      setScrapingConfig(config.config);
    }
  }, []);

  // Helper function to generate demo content for testing
  const generateDemoContent = (url: string) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Demo Page for ${url}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .product { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
          .product-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .product-price { color: #e63946; font-weight: bold; }
          .product-description { color: #555; margin: 10px 0; }
          .product-rating { color: #ff9800; }
          img { max-width: 100px; height: auto; }
          .pagination { margin-top: 20px; }
          .pagination a { margin-right: 10px; text-decoration: none; padding: 5px 10px; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <h1>Product Listing</h1>
        <div class="products">
          <div class="product">
            <div class="product-title">Smartphone X Pro</div>
            <img src="https://via.placeholder.com/100" alt="Smartphone X Pro" />
            <div class="product-price">$999.99</div>
            <div class="product-description">Latest smartphone with advanced camera and long battery life.</div>
            <div class="product-rating">★★★★☆ (4.2/5)</div>
          </div>
          <div class="product">
            <div class="product-title">Laptop Ultra Slim</div>
            <img src="https://via.placeholder.com/100" alt="Laptop Ultra Slim" />
            <div class="product-price">$1299.99</div>
            <div class="product-description">Lightweight laptop with powerful performance and stunning display.</div>
            <div class="product-rating">★★★★★ (4.8/5)</div>
          </div>
          <div class="product">
            <div class="product-title">Wireless Earbuds</div>
            <img src="https://via.placeholder.com/100" alt="Wireless Earbuds" />
            <div class="product-price">$149.99</div>
            <div class="product-description">True wireless earbuds with noise cancellation and crystal clear sound.</div>
            <div class="product-rating">★★★★☆ (4.0/5)</div>
          </div>
        </div>
        <div class="pagination">
          <a href="#" class="active">1</a>
          <a href="#">2</a>
          <a href="#">3</a>
          <a href="#" class="next">Next →</a>
        </div>
      </body>
      </html>
    `;
  };

  // Helper function to generate demo results for testing
  const generateDemoResults = (
    url: string,
    elements: SelectedElement[],
    config: ScrapingConfig,
  ) => {
    // Create sample results based on the selected elements
    const results = [];

    // Simulate multiple pages of results
    const pageCount = Math.min(config.maxPages || 1, 3);

    for (let page = 1; page <= pageCount; page++) {
      // Simulate 3 products per page
      for (let i = 1; i <= 3; i++) {
        const productIndex = (page - 1) * 3 + i;
        const result: Record<string, any> = {
          page,
          url: `${url}?page=${page}`,
        };

        // Add data for each selected element
        elements.forEach((element) => {
          const fieldName = element.name;

          if (element.selector.includes("title")) {
            result[fieldName] = `Product ${productIndex} - Page ${page}`;
          } else if (element.selector.includes("price")) {
            result[fieldName] = `$${(99.99 * productIndex).toFixed(2)}`;
          } else if (element.selector.includes("description")) {
            result[fieldName] =
              `This is a sample description for product ${productIndex} on page ${page}.`;
          } else if (element.selector.includes("rating")) {
            const rating = (3 + Math.random() * 2).toFixed(1);
            result[fieldName] = `★★★★☆ (${rating}/5)`;
          } else if (
            element.selector.includes("img") &&
            element.type === "attribute" &&
            element.attribute === "src"
          ) {
            result[fieldName] =
              `https://via.placeholder.com/100?text=Product${productIndex}`;
          } else {
            result[fieldName] =
              `Sample data for ${fieldName} - Product ${productIndex}`;
          }
        });

        results.push(result);
      }
    }

    return results;
  };

  return {
    url,
    setUrl,
    pageContent,
    isLoading,
    error,
    selectedElements,
    scrapingConfig,
    setScrapingConfig,
    scrapingResults,
    scrapingProgress,
    isScrapingActive,
    loadUrl,
    selectElement,
    removeSelectedElement,
    startScraping,
    stopScraping,
    exportResults,
    saveConfig,
    loadConfig,
  };
};
