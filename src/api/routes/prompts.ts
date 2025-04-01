import express from "express";
import {
  getPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
} from "../services/promptService";

const router = express.Router();

// Get all prompts
router.get("/", async (req, res, next) => {
  try {
    const prompts = await getPrompts();
    res.json({ success: true, data: prompts });
  } catch (error) {
    next(error);
  }
});

// Get prompt by ID
router.get("/:id", async (req, res, next) => {
  try {
    const prompt = await getPromptById(parseInt(req.params.id));
    if (!prompt) {
      return res
        .status(404)
        .json({ success: false, message: "Prompt not found" });
    }
    res.json({ success: true, data: prompt });
  } catch (error) {
    next(error);
  }
});

// Create a new prompt
router.post("/", async (req, res, next) => {
  try {
    const { name, description, template, isDefault } = req.body;

    if (!name || !template) {
      return res
        .status(400)
        .json({ success: false, message: "Name and template are required" });
    }

    const prompt = await createPrompt({
      name,
      description,
      template,
      isDefault,
    });
    res.status(201).json({ success: true, data: prompt });
  } catch (error) {
    next(error);
  }
});

// Update a prompt
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, template, isDefault } = req.body;

    const prompt = await updatePrompt(id, {
      name,
      description,
      template,
      isDefault,
    });
    if (!prompt) {
      return res
        .status(404)
        .json({ success: false, message: "Prompt not found" });
    }

    res.json({ success: true, data: prompt });
  } catch (error) {
    next(error);
  }
});

// Delete a prompt
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deletePrompt(id);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Prompt not found" });
    }

    res.json({ success: true, message: "Prompt deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export const promptsRouter = router;
