import app from "./api";
import { testConnection, syncDatabase } from "./api/config/database";

// Test database connection
testConnection();

// Sync database models
syncDatabase();

// The app is already listening in api/index.ts
