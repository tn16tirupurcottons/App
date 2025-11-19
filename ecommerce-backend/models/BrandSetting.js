import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const BrandSetting = sequelize.define(
  "BrandSetting",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    settingKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    logo: DataTypes.TEXT,
    favicon: DataTypes.TEXT,
    footerLogo: DataTypes.TEXT,
    heroBackground: DataTypes.TEXT,
    updatedBy: DataTypes.STRING,
  },
  { timestamps: true }
);

export default BrandSetting;

