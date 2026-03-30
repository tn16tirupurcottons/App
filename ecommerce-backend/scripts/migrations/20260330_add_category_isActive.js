import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../../models/index.js";

const up = async () => {
  console.log("🔧 Adding Categories.isActive (soft-delete)");

  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Categories' AND table_schema = 'public' AND column_name = 'isActive'
      ) THEN
        ALTER TABLE "Categories"
        ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT TRUE;
      END IF;
    END$$;
  `);

  console.log("✅ Categories.isActive ready");
};

up()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed", err);
    process.exit(1);
  });

