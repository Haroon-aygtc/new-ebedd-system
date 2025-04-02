import express from "express";
import cors from "cors";
import { scrapeRouter } from "./routes/scrape";
import { modelsRouter } from "./routes/models";
import { promptsRouter } from "./routes/prompts";
import { chatRouter } from "./routes/chat";
import { usersRouter } from "./routes/users";
import { settingsRouter } from "./routes/settings";
import { proxyRouter } from "./routes/proxy";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/scrape", scrapeRouter);
app.use("/api/models", modelsRouter);
app.use("/api/prompts", promptsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/users", usersRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/proxy", proxyRouter);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  },
);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
