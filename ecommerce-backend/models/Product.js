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
    basePrice: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    dynamicPrice: { type: DataTypes.FLOAT, allowNull: true },
    viewsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    purchasesCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    demandScore: { type: DataTypes.FLOAT, defaultValue: 0 },
    lastUpdated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    discount: { type: DataTypes.FLOAT, defaultValue: 0 },
    currency: { type: DataTypes.STRING, defaultValue: "INR" },
    inventory: { type: DataTypes.INTEGER, defaultValue: 0 },
    brand: { type: DataTypes.STRING },
    sizes: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    colors: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    thumbnail: { type: DataTypes.STRING },
    gallery: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    spinImages: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    tryOnImages: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    videoUrl: { type: DataTypes.STRING },
    model3dUrl: { type: DataTypes.STRING },
    arModelUrl: { type: DataTypes.STRING },
    originalPrice: { type: DataTypes.FLOAT, defaultValue: 0 },
    discountPercentage: { type: DataTypes.FLOAT, defaultValue: 0 },
    isOnOffer: { type: DataTypes.BOOLEAN, defaultValue: false },
    offerTag: { type: DataTypes.STRING },
    isLightningDeal: { type: DataTypes.BOOLEAN, defaultValue: false },
    dealStartTime: { type: DataTypes.DATE },
    dealEndTime: { type: DataTypes.DATE },
    dealStock: { type: DataTypes.INTEGER, defaultValue: 0 },
    dealSold: { type: DataTypes.INTEGER, defaultValue: 0 },
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
