import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../../models/index.js";

const up = async () => {
  console.log("🔧 Adding dynamic pricing and spin-wheel fields to Products");

  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'basePrice'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "basePrice" FLOAT NOT NULL DEFAULT 0;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'dynamicPrice'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "dynamicPrice" FLOAT;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'viewsCount'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "viewsCount" INTEGER NOT NULL DEFAULT 0;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'purchasesCount'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "purchasesCount" INTEGER NOT NULL DEFAULT 0;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'demandScore'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "demandScore" FLOAT NOT NULL DEFAULT 0;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'lastUpdated'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "lastUpdated" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'spinImages'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "spinImages" TEXT[] DEFAULT '{}';
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'videoUrl'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "videoUrl" TEXT;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'originalPrice'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "originalPrice" FLOAT NOT NULL DEFAULT 0;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'tryOnImages'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "tryOnImages" TEXT[] DEFAULT '{}';
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'model3dUrl'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "model3dUrl" TEXT;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'arModelUrl'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "arModelUrl" TEXT;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Products' AND table_schema = 'public' AND column_name = 'discountPercentage'
      ) THEN
        ALTER TABLE "Products" ADD COLUMN "discountPercentage" FLOAT NOT NULL DEFAULT 0;
      END IF;
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

  console.log("✅ Dynamic pricing & spin columns ready");
};

up()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed", err);
    process.exit(1);
  });
