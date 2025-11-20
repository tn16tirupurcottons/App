import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Banner = sequelize.define(
  "Banner",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ctaLabel: {
      type: DataTypes.STRING,
    },
    ctaLink: {
      type: DataTypes.STRING,
    },
    segment: {
      type: DataTypes.STRING,
      defaultValue: "default",
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    page: {
      type: DataTypes.STRING,
      defaultValue: "home",
      comment: "Page where banner appears: home, catalog, product, etc.",
    },
    position: {
      type: DataTypes.STRING,
      defaultValue: "hero",
      comment: "Position on page: hero, top, middle, bottom, sidebar",
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
      comment: "Multiple images for carousel (max 5)",
    },
  },
  { timestamps: true }
);

export default Banner;

