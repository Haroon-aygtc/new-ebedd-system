import express from "express";
import {
  scrapeUrl,
  getScrapedData,
  saveScrapedData,
} from "../services/scrapeService";

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

export const scrapeRouter = router;
