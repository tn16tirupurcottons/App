import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Category from "./Category.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    sku: { type: DataTypes.STRING },
    shortDescription: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    discount: { type: DataTypes.FLOAT, defaultValue: 0 },
    currency: { type: DataTypes.STRING, defaultValue: "INR" },
    inventory: { type: DataTypes.INTEGER, defaultValue: 0 },
    brand: { type: DataTypes.STRING },
    sizes: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    colors: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    thumbnail: { type: DataTypes.STRING },
    gallery: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: {
      type: DataTypes.ENUM("draft", "active", "archived"),
      defaultValue: "active",
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Category,
        key: "id",
      },
    },
  },
  { timestamps: true }
);

export default Product;
