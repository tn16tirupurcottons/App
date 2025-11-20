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
    otp: {
      type: DataTypes.STRING(6),
      allowNull: false,
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
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: true }
);

export default OtpToken;

