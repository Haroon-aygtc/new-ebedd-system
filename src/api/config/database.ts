import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Get database configuration from environment variables
const DB_NAME = process.env.DB_NAME || "scraping_ai";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = parseInt(process.env.DB_PORT || "3306", 10);
const DB_DIALECT = (process.env.DB_DIALECT || "mysql") as
  | "mysql"
  | "postgres"
  | "sqlite"
  | "mariadb"
  | "mssql";

// Initialize Sequelize with the configured database
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

// Sync database models
const syncDatabase = async () => {
  try {
    // Import models dynamically to avoid circular dependencies
    const { syncDatabase } = await import("../models");
    await syncDatabase();
  } catch (error) {
    console.error("Error synchronizing database models:", error);
  }
};

export { sequelize, testConnection, syncDatabase };
