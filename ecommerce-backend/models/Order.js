import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    subtotal: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    taxTotal: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    shippingFee: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    discountTotal: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    total: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled"
      ),
      defaultValue: "pending",
    },
    paymentStatus: {
      type: DataTypes.ENUM("requires_payment", "processing", "paid", "failed"),
      defaultValue: "requires_payment",
    },
    paymentIntentId: { type: DataTypes.STRING },
    paymentMethod: { 
      type: DataTypes.ENUM("cod", "razorpay", "stripe", "online"),
      defaultValue: "online" 
    },
    razorpayOrderId: { type: DataTypes.STRING, allowNull: true },
    razorpayPaymentId: { type: DataTypes.STRING, allowNull: true },
    shippingName: { type: DataTypes.STRING, allowNull: false, defaultValue: "" },
    shippingPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    shippingAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    shippingCity: { type: DataTypes.STRING, allowNull: false, defaultValue: "" },
    shippingState: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    shippingZip: { type: DataTypes.STRING, allowNull: false, defaultValue: "" },
    shippingCountry: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "India",
    },
  },
  { timestamps: true }
);

// Relations
User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId" });

export default Order;
