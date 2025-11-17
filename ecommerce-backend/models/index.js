import sequelize from "../config/db.js";
import { migrateLegacyProductSlugs } from "../utils/migrateLegacyProductSlugs.js";
import { migrateLegacyProductCategories } from "../utils/migrateLegacyProductCategories.js";

// Import models after sequelize is initialized
import User from "./User.js";
import Product from "./Product.js";
import Cart from "./Cart.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";
import Wishlist from "./Wishlist.js";
import Category from "./Category.js";
import RefreshToken from "./RefreshToken.js";

// =============================
//      MODEL ASSOCIATIONS
// =============================
User.hasMany(Cart, { foreignKey: "userId", onDelete: "CASCADE" });
Cart.belongsTo(User, { foreignKey: "userId" });

Product.hasMany(Cart, { foreignKey: "productId", onDelete: "CASCADE" });
Cart.belongsTo(Product, { foreignKey: "productId" });

Category.hasMany(Product, { foreignKey: "categoryId", onDelete: "RESTRICT" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId" });

Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId", onDelete: "RESTRICT" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

User.hasMany(Wishlist, { foreignKey: "userId", onDelete: "CASCADE" });
Wishlist.belongsTo(User, { foreignKey: "userId" });

Product.hasMany(Wishlist, { foreignKey: "productId", onDelete: "CASCADE" });
Wishlist.belongsTo(Product, { foreignKey: "productId" });

User.hasMany(RefreshToken, { foreignKey: "userId", onDelete: "CASCADE" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

// =============================
//      SYNC DB
// =============================
export const syncDB = async () => {
  try {
    await migrateLegacyProductSlugs();
    await migrateLegacyProductCategories();
    await sequelize.sync({ alter: true });
    console.log("✅ Database & tables synced!");
  } catch (err) {
    console.error("❌ DB Sync Error:", err);
    throw err;
  }
};

// =============================
//       EXPORT MODELS
// =============================
export {
  sequelize,
  User,
  Product,
  Cart,
  Order,
  OrderItem,
  Wishlist,
  Category,
  RefreshToken,
};
