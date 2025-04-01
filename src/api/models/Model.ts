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
}

class Model extends SequelizeModel<ModelAttributes> implements ModelAttributes {
  public id!: number;
  public name!: string;
  public provider!: string;
  public apiKey?: string;
  public version?: string;
  public parameters?: any;
  public isActive?: boolean;
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
  },
  {
    sequelize,
    modelName: "Model",
    tableName: "models",
    timestamps: true,
  },
);

export default Model;
