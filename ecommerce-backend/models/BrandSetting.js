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
    primaryColor: DataTypes.STRING,
    secondaryColor: DataTypes.STRING,
    accentColor: DataTypes.STRING,
    backgroundColor: DataTypes.STRING,
    surfaceColor: DataTypes.STRING,
    textColor: DataTypes.STRING,
    headingFont: DataTypes.STRING,
    bodyFont: DataTypes.STRING,
    headerBackground: DataTypes.STRING,
    headerTextColor: DataTypes.STRING,
    headerPrimaryText: DataTypes.STRING,
    headerSecondaryText: DataTypes.STRING,
    footerBackground: DataTypes.STRING,
    footerTextColor: DataTypes.STRING,
    containerRadius: { type: DataTypes.STRING, defaultValue: "24px" },
    heroBoxBackground: DataTypes.TEXT,
    heroBoxBorder: DataTypes.STRING,
    heroTextColor: DataTypes.STRING,
    heroTitleShadow: DataTypes.STRING,
    heroSubtitleShadow: DataTypes.STRING,
    themeTokens: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    updatedBy: DataTypes.STRING,
  },
  { timestamps: true }
);

export default BrandSetting;

