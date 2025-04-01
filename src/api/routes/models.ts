import express from "express";
import {
  getModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
  getModelsByQueryType,
  getDefaultModelForQueryType,
} from "../services/modelService";
import {
  callModel,
  updateModelVectorization,
  retrainModel,
} from "../services/aiProviders";

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
    const {
      name,
      provider,
      apiKey,
      version,
      parameters,
      isActive,
      contextSize,
      memoryRetention,
      defaultForQueryType,
      rateLimit,
      responseVerbosity,
      dataPrioritization,
      fineTuned,
      streamingEnabled,
    } = req.body;

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
      isActive,
      contextSize,
      memoryRetention,
      defaultForQueryType,
      rateLimit,
      responseVerbosity,
      dataPrioritization,
      fineTuned,
      streamingEnabled,
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
    const {
      name,
      provider,
      apiKey,
      version,
      parameters,
      isActive,
      contextSize,
      memoryRetention,
      defaultForQueryType,
      rateLimit,
      responseVerbosity,
      dataPrioritization,
      fineTuned,
      streamingEnabled,
    } = req.body;

    const model = await updateModel(id, {
      name,
      provider,
      apiKey,
      version,
      parameters,
      isActive,
      contextSize,
      memoryRetention,
      defaultForQueryType,
      rateLimit,
      responseVerbosity,
      dataPrioritization,
      fineTuned,
      streamingEnabled,
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

// Test a model
router.post("/:id/test", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { prompt, options } = req.body;

    if (!prompt) {
      return res
        .status(400)
        .json({ success: false, message: "Prompt is required" });
    }

    const response = await callModel(id, prompt, options);
    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
});

// Get models by query type
router.get("/query-type/:type", async (req, res, next) => {
  try {
    const models = await getModelsByQueryType(req.params.type);
    res.json({ success: true, data: models });
  } catch (error) {
    next(error);
  }
});

// Get default model for query type
router.get("/default/:type", async (req, res, next) => {
  try {
    const model = await getDefaultModelForQueryType(req.params.type);
    if (!model) {
      return res.status(404).json({
        success: false,
        message: "No default model found for this query type",
      });
    }
    res.json({ success: true, data: model });
  } catch (error) {
    next(error);
  }
});

// Update model vectorization
router.post("/:id/vectorization", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { data } = req.body;

    if (!data) {
      return res
        .status(400)
        .json({ success: false, message: "Data is required" });
    }

    const result = await updateModelVectorization(id, data);
    res.json({ success: result });
  } catch (error) {
    next(error);
  }
});

// Retrain model
router.post("/:id/retrain", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { trainingData } = req.body;

    if (!trainingData) {
      return res
        .status(400)
        .json({ success: false, message: "Training data is required" });
    }

    const result = await retrainModel(id, trainingData);
    res.json({ success: result });
  } catch (error) {
    next(error);
  }
});

export { router as modelsRouter };
