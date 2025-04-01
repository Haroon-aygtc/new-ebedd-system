import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

interface ConversationAttributes {
  id: string;
  title: string;
  messages: any[];
  createdAt: Date;
  updatedAt: Date;
}

class Conversation
  extends Model<ConversationAttributes>
  implements ConversationAttributes
{
  public id!: string;
  public title!: string;
  public messages!: any[];
  public createdAt!: Date;
  public updatedAt!: Date;
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

export default Conversation;
