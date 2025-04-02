import express from "express";
import { fetchAndProxyUrl, proxyResource } from "../services/webProxyService";

const router = express.Router();

/**
 * Proxy a URL and return the HTML content
 * This endpoint handles CORS issues and makes external websites
 * work properly in an iframe
 */
router.post("/url", async (req, res) => {
  try {
    const { url, options = {} } = req.body;

    if (!url) {
      return res.status(400).json({ 
        success: false, 
        message: "URL is required" 
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid URL format" 
      });
    }

    // Fetch and process the URL
    const result = await fetchAndProxyUrl(url, options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error proxying URL:", error);
    res.status(500).json({
      success: false,
      message: "Failed to proxy URL",
      error: error.message
    });
  }
});

/**
 * Proxy a resource (image, CSS, JS, etc.)
 */
router.get("/resource", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ 
        success: false, 
        message: "URL is required" 
      });
    }

    // Fetch the resource
    const result = await proxyResource(url);

    // Set appropriate content type
    if (result.contentType) {
      res.setHeader("Content-Type", result.contentType);
    }

    // Return the raw content
    res.send(result.content);
  } catch (error) {
    console.error("Error proxying resource:", error);
    res.status(500).json({
      success: false,
      message: "Failed to proxy resource",
      error: error.message
    });
  }
});

export const proxyRouter = router;
