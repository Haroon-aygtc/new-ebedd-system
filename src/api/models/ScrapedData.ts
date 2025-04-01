import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

interface ScrapedDataAttributes {
  id: string;
  url: string;
  timestamp: string;
  data: any;
  selectors: any;
}

class ScrapedData
  extends Model<ScrapedDataAttributes>
  implements ScrapedDataAttributes
{
  public id!: string;
  public url!: string;
  public timestamp!: string;
  public data!: any;
  public selectors!: any;
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

export default ScrapedData;
