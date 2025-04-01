import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

interface PromptAttributes {
  id: number;
  name: string;
  description?: string;
  template: string;
  isDefault?: boolean;
}

class Prompt extends Model<PromptAttributes> implements PromptAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public template!: string;
  public isDefault?: boolean;
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
      allowNull: false,
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

export default Prompt;
