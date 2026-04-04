import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../../models/index.js";

const up = async () => {
  console.log("🔧 Adding Categories.parentId for category hierarchy");

  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Categories' AND table_schema = 'public' AND column_name = 'parentId'
      ) THEN
        ALTER TABLE "Categories"
        ADD COLUMN "parentId" UUID;
      END IF;
    END$$;
  `);

  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'Categories'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'parentId'
      ) THEN
        ALTER TABLE "Categories"
        ADD CONSTRAINT "Categories_parentId_fkey"
        FOREIGN KEY ("parentId") REFERENCES "Categories" ("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
      END IF;
    END$$;
  `);

  console.log("✅ Categories.parentId ready");
};

up()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed", err);
    process.exit(1);
  });
