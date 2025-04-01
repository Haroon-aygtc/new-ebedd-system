import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

interface SettingAttributes {
  id: number;
  category: string;
  key: string;
  value: string;
  description?: string;
}

class Setting extends Model<SettingAttributes> implements SettingAttributes {
  public id!: number;
  public category!: string;
  public key!: string;
  public value!: string;
  public description?: string;
}

Setting.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Setting",
    tableName: "settings",
    timestamps: true,
  },
);

export default Setting;
