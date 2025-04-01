import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
  status: "active" | "inactive";
  createdAt: string;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public role!: "admin" | "user" | "guest";
  public status!: "active" | "inactive";
  public createdAt!: string;
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

export default User;
