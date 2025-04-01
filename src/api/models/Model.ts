import { DataTypes, Model as SequelizeModel } from "sequelize";
import { sequelize } from "../config/database";

interface ModelAttributes {
  id: number;
  name: string;
  provider: string;
  apiKey?: string;
  version?: string;
  parameters?: any;
  isActive?: boolean;
  contextSize?: number;
  memoryRetention?: number;
  defaultForQueryType?: string;
  rateLimit?: number;
  responseVerbosity?: number;
  dataPrioritization?: string;
  fineTuned?: boolean;
  streamingEnabled?: boolean;
}

class Model extends SequelizeModel<ModelAttributes> implements ModelAttributes {
  public id!: number;
  public name!: string;
  public provider!: string;
  public apiKey?: string;
  public version?: string;
  public parameters?: any;
  public isActive?: boolean;
  public contextSize?: number;
  public memoryRetention?: number;
  public defaultForQueryType?: string;
  public rateLimit?: number;
  public responseVerbosity?: number;
  public dataPrioritization?: string;
  public fineTuned?: boolean;
  public streamingEnabled?: boolean;
}

Model.init(
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
      allowNull: false,
      defaultValue: false,
    },
    contextSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 4096,
    },
    memoryRetention: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 5,
    },
    defaultForQueryType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rateLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 60,
    },
    responseVerbosity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 50,
    },
    dataPrioritization: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "balanced",
    },
    fineTuned: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    streamingEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Model",
    tableName: "models",
    timestamps: true,
  },
);

export default Model;
