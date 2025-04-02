import express from "express";
import {
  scrapeUrl,
  getScrapedData,
  saveScrapedData,
  getPageContent,
} from "../services/scrapeService";
import axios from "axios";
import { getRandomUserAgent } from "../services/userAgentService";

const router = express.Router();

// Scrape a URL
router.post("/", async (req, res, next) => {
  try {
    const { url, selectors, options } = req.body;

    if (!url) {
      return res
        .status(400)
        .json({ success: false, message: "URL is required" });
    }

    const result = await scrapeUrl(url, selectors, options);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get all scraped data
router.get("/", async (req, res, next) => {
  try {
    const data = await getScrapedData();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// Save scraped data
router.post("/save", async (req, res, next) => {
  try {
    const { data, name, format } = req.body;

    if (!data) {
      return res
        .status(400)
        .json({ success: false, message: "Data is required" });
    }

    const result = await saveScrapedData(data, name, format);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Preview a URL (get HTML content)
router.post("/preview", async (req, res, next) => {
  try {
    const { url, options = {} } = req.body;

    if (!url) {
      return res
        .status(400)
        .json({ success: false, message: "URL is required" });
    }

    try {
      // Try to use the service function if it exists
      const content = await getPageContent(url, options);
      res.json({ success: true, contents: content });
    } catch (serviceError) {
      // Fallback to direct implementation if the service function doesn't exist or fails
      console.log("Fallback to direct implementation for preview", serviceError);

      const response = await axios.get(url, {
        headers: {
          'User-Agent': getRandomUserAgent().value,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        },
        timeout: 30000,
        maxRedirects: 5
      });

      res.json({ success: true, contents: response.data });
    }
  } catch (error) {
    console.error("Error in preview endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load URL",
      error: error.message
    });
  }
});

// Get scraping templates
router.get("/templates", async (req, res, next) => {
  try {
    const templates = getScrapingTemplates();
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error("Error getting templates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get templates",
      error: error.message
    });
  }
});

// Extract data from a URL
router.post("/extract", async (req, res, next) => {
  try {
    const { url, selectors, options } = req.body;

    if (!url) {
      return res
        .status(400)
        .json({ success: false, message: "URL is required" });
    }

    const result = await scrapeUrl(url, selectors, options);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export const scrapeRouter = router;
