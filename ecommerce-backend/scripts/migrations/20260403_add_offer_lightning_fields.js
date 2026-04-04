import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../models/index.js";

const up = async () => {
  console.log("🔧 Adding missing offer and lightning deal fields to Products");

  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'isOnOffer'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "isOnOffer" BOOLEAN NOT NULL DEFAULT false;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'offerTag'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "offerTag" TEXT;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'isLightningDeal'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "isLightningDeal" BOOLEAN NOT NULL DEFAULT false;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'dealStartTime'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "dealStartTime" TIMESTAMP WITH TIME ZONE;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'dealEndTime'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "dealEndTime" TIMESTAMP WITH TIME ZONE;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'dealStock'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "dealStock" INTEGER NOT NULL DEFAULT 0;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'dealSold'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "dealSold" INTEGER NOT NULL DEFAULT 0;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'isFeatured'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
      END IF;
    END$$;
  `);

  console.log("✅ Missing offer & lightning deal columns added");
};

up()
  .then(() => {
    console.log("✅ Migration completed successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });