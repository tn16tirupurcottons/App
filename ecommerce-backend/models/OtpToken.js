import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

const OtpToken = sequelize.define(
  "OtpToken",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // SECURITY: store ONLY hashed OTP (SHA256 hex, truncated to 6 chars to fit existing column size).
    // The DB column is still named `otp` for backward-compatibility.
    hashedOtp: {
      type: DataTypes.STRING(6),
      allowNull: false,
      field: "otp",
    },
    identifier: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Email or mobile number",
    },
    method: {
      type: DataTypes.ENUM("email", "mobile"),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    failedAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: true }
);

export default OtpToken;

