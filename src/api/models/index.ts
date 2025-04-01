import { sequelize } from "../config/database";
import { DataTypes, Model } from "sequelize";

// Define models

// Scrape Job Model
class ScrapeJob extends Model {
  declare id: string;
  declare url: string;
  declare status: "pending" | "in-progress" | "completed" | "failed";
  declare selectors: any;
  declare options: any;
  declare startTime: Date;
  declare endTime: Date;
  declare error: string;
}

ScrapeJob.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "in-progress", "completed", "failed"),
      defaultValue: "pending",
    },
    selectors: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "scrape_job",
    timestamps: true,
  },
);

// Scraped Data Model
class ScrapedData extends Model {
  declare id: string;
  declare url: string;
  declare timestamp: string;
  declare data: any;
  declare selectors: any;
}

ScrapedData.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    selectors: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ScrapedData",
    tableName: "scraped_data",
    timestamps: true,
  },
);

// AI Model Configuration
class AIModel extends Model {
  declare id: number;
  declare name: string;
  declare provider: string;
  declare apiKey?: string;
  declare version?: string;
  declare parameters?: any;
  declare isActive?: boolean;
}

AIModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apiKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parameters: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Model",
    tableName: "models",
    timestamps: true,
  },
);

// Prompt Template
class Prompt extends Model {
  declare id: number;
  declare name: string;
  declare description?: string;
  declare template: string;
  declare isDefault?: boolean;
}

Prompt.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    template: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Prompt",
    tableName: "prompts",
    timestamps: true,
  },
);

// Conversation
class Conversation extends Model {
  declare id: string;
  declare title: string;
  declare messages: any[];
  declare createdAt: Date;
  declare updatedAt: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    messages: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Conversation",
    tableName: "conversations",
    timestamps: true,
  },
);

// User
class User extends Model {
  declare id: string;
  declare name: string;
  declare email: string;
  declare role: "admin" | "user" | "guest";
  declare status: "active" | "inactive";
  declare createdAt: string;
}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "user", "guest"),
      allowNull: false,
      defaultValue: "user",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    createdAt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  },
);

// Define relationships
ScrapeJob.hasMany(ScrapedData, { foreignKey: "scrapeJobId" });
ScrapedData.belongsTo(ScrapeJob, { foreignKey: "scrapeJobId" });

// Export models
export { ScrapeJob, ScrapedData, AIModel, Prompt, Conversation, User };

// Sync models with database
export const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Error synchronizing database:", error);
  }
};
