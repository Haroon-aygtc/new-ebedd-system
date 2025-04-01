import express from "express";
import {
  getModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
} from "../services/modelService";

const router = express.Router();

// Get all models
router.get("/", async (req, res, next) => {
  try {
    const models = await getModels();
    res.json({ success: true, data: models });
  } catch (error) {
    next(error);
  }
});

// Get model by ID
router.get("/:id", async (req, res, next) => {
  try {
    const model = await getModelById(parseInt(req.params.id));
    if (!model) {
      return res
        .status(404)
        .json({ success: false, message: "Model not found" });
    }
    res.json({ success: true, data: model });
  } catch (error) {
    next(error);
  }
});

// Create a new model
router.post("/", async (req, res, next) => {
  try {
    const { name, provider, apiKey, version, parameters } = req.body;

    if (!name || !provider) {
      return res
        .status(400)
        .json({ success: false, message: "Name and provider are required" });
    }

    const model = await createModel({
      name,
      provider,
      apiKey,
      version,
      parameters,
    });
    res.status(201).json({ success: true, data: model });
  } catch (error) {
    next(error);
  }
});

// Update a model
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { name, provider, apiKey, version, parameters, isActive } = req.body;

    const model = await updateModel(id, {
      name,
      provider,
      apiKey,
      version,
      parameters,
      isActive,
    });
    if (!model) {
      return res
        .status(404)
        .json({ success: false, message: "Model not found" });
    }

    res.json({ success: true, data: model });
  } catch (error) {
    next(error);
  }
});

// Delete a model
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deleteModel(id);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Model not found" });
    }

    res.json({ success: true, message: "Model deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export const modelsRouter = router;
