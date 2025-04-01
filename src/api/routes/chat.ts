import express from "express";
import {
  sendMessage,
  getConversations,
  saveConversation,
} from "../services/chatService";

const router = express.Router();

// Send a message to the AI
router.post("/message", async (req, res, next) => {
  try {
    const { message, conversationId, modelId, datasetId } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }

    const response = await sendMessage(
      message,
      conversationId,
      modelId,
      datasetId,
    );
    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
});

// Get all conversations
router.get("/conversations", async (req, res, next) => {
  try {
    const conversations = await getConversations();
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
});

// Save a conversation
router.post("/conversations", async (req, res, next) => {
  try {
    const { messages, title } = req.body;

    if (!messages || !messages.length) {
      return res
        .status(400)
        .json({ success: false, message: "Messages are required" });
    }

    const conversation = await saveConversation(messages, title);
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
});

export const chatRouter = router;
