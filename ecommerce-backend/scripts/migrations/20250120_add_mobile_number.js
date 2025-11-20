import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../../models/index.js";

const up = async () => {
  console.log("🔧 Ensuring Users.mobileNumber column exists");
  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Users' AND column_name = 'mobileNumber'
      ) THEN
        ALTER TABLE "Users"
        ADD COLUMN "mobileNumber" VARCHAR(20);
      END IF;
    END$$;
  `);

  await sequelize.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Users_mobileNumber_unique"
    ON "Users" ("mobileNumber")
    WHERE "mobileNumber" IS NOT NULL;
  `);
  console.log("✅ Users.mobileNumber column ready");
};

up()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed", err);
    process.exit(1);
  });

