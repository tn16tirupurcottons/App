import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../../models/index.js";

const up = async () => {
  console.log("🔧 Creating Coupons & CouponUsages tables (if missing)");

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "Coupons" (
      "id" UUID PRIMARY KEY,
      "code" VARCHAR(50) UNIQUE NOT NULL,
      "discount_type" VARCHAR(20) NOT NULL,
      "discount_value" DECIMAL(10,2) NOT NULL,
      "max_discount" DECIMAL(10,2),
      "min_order_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
      "is_insider_only" BOOLEAN NOT NULL DEFAULT FALSE,
      "usage_limit" INTEGER,
      "used_count" INTEGER NOT NULL DEFAULT 0,
      "expires_at" TIMESTAMP,
      "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "CouponUsages" (
      "id" UUID PRIMARY KEY,
      "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
      "couponId" UUID NOT NULL REFERENCES "Coupons"("id") ON DELETE CASCADE,
      "cart_total" DECIMAL(10,2) NOT NULL,
      "discount_amount" DECIMAL(10,2) NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT "CouponUsages_userId_couponId_unique" UNIQUE ("userId", "couponId")
    );
  `);

  console.log("✅ Coupon tables ready");
};

up()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed", err);
    process.exit(1);
  });

