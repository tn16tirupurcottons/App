import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../../models/index.js";

const runMigration = async () => {
  try {
    await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'Banners'
            AND table_schema = 'public'
            AND column_name = 'categoryId'
        ) THEN
          ALTER TABLE "Banners" ADD COLUMN "categoryId" UUID;
        END IF;

        BEGIN
          ALTER TABLE "Banners"
            ADD CONSTRAINT "Banners_categoryId_fkey"
            FOREIGN KEY ("categoryId")
            REFERENCES "Categories"("id")
            ON DELETE SET NULL;
        EXCEPTION WHEN duplicate_object THEN
          -- Constraint already exists
          NULL;
        END;
      END$$;
    ");

    console.log("✅ Migration applied: add categoryId to Banners");
  } catch (err) {
    console.error("❌ Migration failed:", err.message || err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

if (import.meta.url === process.argv[1] || import.meta.url.endsWith(process.argv[1])) {
  runMigration();
}

export default runMigration;
