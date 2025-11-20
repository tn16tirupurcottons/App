import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

const PasswordResetToken = sequelize.define(
  "PasswordResetToken",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
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
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    consumedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deliveryChannel: {
      type: DataTypes.ENUM("email", "sms", "whatsapp"),
      defaultValue: "email",
    },
  },
  { timestamps: true }
);

export default PasswordResetToken;

