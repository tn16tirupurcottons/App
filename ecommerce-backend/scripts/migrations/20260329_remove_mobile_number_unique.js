import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../../models/index.js";

const up = async () => {
  console.log("🔧 Dropping Users.mobileNumber unique index (optional mobile uniqueness)");

  // Depending on how the constraint was created, Postgres may represent it as:
  // - a unique constraint (pg_constraint) and/or
  // - a backing unique index (pg_indexes)
  // We must drop the constraint first if it exists, otherwise dropping the index fails.
  await sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Users_mobileNumber_key'
      ) THEN
        ALTER TABLE "Users" DROP CONSTRAINT "Users_mobileNumber_key";
      END IF;

      IF EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'Users_mobileNumber_unique'
      ) THEN
        DROP INDEX IF EXISTS "Users_mobileNumber_unique";
      END IF;

      -- Some setups may still have the backing index name.
      IF EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'Users_mobileNumber_key'
      ) THEN
        DROP INDEX IF EXISTS "Users_mobileNumber_key";
      END IF;
    END$$;
  `);

  console.log("✅ Mobile unique constraint removed (if it existed)");
};

up()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed", err);
    process.exit(1);
  });

