import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";
import Coupon from "./Coupon.js";

const CouponUsage = sequelize.define(
  "CouponUsage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    couponId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Coupon,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    cart_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "couponId"],
      },
    ],
  }
);

export default CouponUsage;

