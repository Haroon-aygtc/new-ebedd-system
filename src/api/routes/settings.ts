import express from "express";
import {
  getSettings,
  getSettingsByCategory,
  getSettingByKey,
  upsertSetting,
  deleteSetting,
} from "../services/settingService";

const router = express.Router();

// Get all settings
router.get("/", async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

// Get settings by category
router.get("/category/:category", async (req, res, next) => {
  try {
    const settings = await getSettingsByCategory(req.params.category);
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

// Get a setting by key
router.get("/:key", async (req, res, next) => {
  try {
    const setting = await getSettingByKey(req.params.key);
    if (!setting) {
      return res
        .status(404)
        .json({ success: false, message: "Setting not found" });
    }
    res.json({ success: true, data: setting });
  } catch (error) {
    next(error);
  }
});

// Create or update a setting
router.post("/", async (req, res, next) => {
  try {
    const { category, key, value, description } = req.body;

    if (!category || !key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Category, key, and value are required",
      });
    }

    const setting = await upsertSetting(category, key, value, description);
    res.json({ success: true, data: setting });
  } catch (error) {
    next(error);
  }
});

// Delete a setting
router.delete("/:key", async (req, res, next) => {
  try {
    const result = await deleteSetting(req.params.key);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Setting not found" });
    }
    res.json({ success: true, message: "Setting deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export const settingsRouter = router;
