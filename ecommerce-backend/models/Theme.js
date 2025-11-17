import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Theme = sequelize.define(
  "Theme",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    segment: {
      type: DataTypes.ENUM("genz", "men", "women", "kids", "default"),
      allowNull: false,
      unique: true,
    },
    heroTitle: { type: DataTypes.STRING },
    heroSubtitle: { type: DataTypes.STRING },
    heroImage: { type: DataTypes.TEXT },
    bannerImage: { type: DataTypes.TEXT },
    offerBadge: { type: DataTypes.STRING },
    offerText: { type: DataTypes.STRING },
    primaryColor: { type: DataTypes.STRING },
    secondaryColor: { type: DataTypes.STRING },
    accentColor: { type: DataTypes.STRING },
    ctaText: { type: DataTypes.STRING },
    ctaLink: { type: DataTypes.STRING },
    promoCode: { type: DataTypes.STRING },
    promoDescription: { type: DataTypes.STRING },
  },
  { timestamps: true }
);

export default Theme;

