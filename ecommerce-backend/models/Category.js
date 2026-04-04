import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    heroImage: {
      type: DataTypes.STRING,
    },
    accentColor: {
      type: DataTypes.STRING,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    // Category is shown/hidden from the storefront using soft-deletes.
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  { timestamps: true }
);

export default Category;

