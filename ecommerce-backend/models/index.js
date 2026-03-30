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
import PasswordResetToken from "./PasswordResetToken.js";
import OtpToken from "./OtpToken.js";
import Banner from "./Banner.js";
import BrandSetting from "./BrandSetting.js";
import AppImage from "./AppImage.js";
import Coupon from "./Coupon.js";
import CouponUsage from "./CouponUsage.js";

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
User.hasMany(PasswordResetToken, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
PasswordResetToken.belongsTo(User, { foreignKey: "userId" });

// Coupon usage logging associations
Coupon.hasMany(CouponUsage, { foreignKey: "couponId", onDelete: "CASCADE" });
CouponUsage.belongsTo(Coupon, { foreignKey: "couponId" });
CouponUsage.belongsTo(User, { foreignKey: "userId" });
User.hasMany(CouponUsage, { foreignKey: "userId", onDelete: "CASCADE" });

// =============================
//      SYNC DB
// =============================
export const syncDB = async () => {
  try {
    await migrateLegacyProductSlugs();
    await migrateLegacyProductCategories();
    // Use plain sync to avoid dropping/recreating constraints in production.
    // All structural changes should be handled via explicit migration scripts.
    await sequelize.sync();
    const { seedAppImages } = await import("../scripts/seedAppImages.js");
    await seedAppImages();
    const { seedCoupons } = await import("../scripts/seedCoupons.js");
    await seedCoupons();
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
  Banner,
  BrandSetting,
  PasswordResetToken,
  OtpToken,
  AppImage,
  Coupon,
  CouponUsage,
};
