import { useState, useEffect } from "react";
import { useApi } from "./useApi";

interface ScrapedDataItem {
  id: string;
  url: string;
  timestamp: string;
  data: any;
  selectors: any[];
}

export function useScrapedData() {
  const [scrapedData, setScrapedData] = useState<ScrapedDataItem[]>([]);
  const { data, loading, error, fetchData } = useApi<ScrapedDataItem[]>();

  useEffect(() => {
    fetchData("/scrape");
  }, [fetchData]);

  useEffect(() => {
    if (data) {
      setScrapedData(data);
    }
  }, [data]);

  const scrapeUrl = async (
    url: string,
    selectors: any[] = [],
    options: any = {},
  ) => {
    try {
      const result = await fetchData("/scrape", {
        method: "POST",
        body: { url, selectors, options },
      });

      if (result) {
        setScrapedData((prev) => [...prev, result]);
      }

      return result;
    } catch (error) {
      console.error("Error scraping URL:", error);
      throw error;
    }
  };

  const saveScrapedData = async (
    data: any,
    name?: string,
    format: "json" | "csv" = "json",
  ) => {
    try {
      return await fetchData("/scrape/save", {
        method: "POST",
        body: { data, name, format },
      });
    } catch (error) {
      console.error("Error saving scraped data:", error);
      throw error;
    }
  };

  return {
    scrapedData,
    loading,
    error,
    scrapeUrl,
    saveScrapedData,
    refreshData: () => fetchData("/scrape"),
  };
}
