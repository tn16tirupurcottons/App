import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../../models/index.js";

const up = async () => {
  console.log("🔧 Ensuring Users.insider fields exist");

  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Users' AND column_name = 'is_insider'
      ) THEN
        ALTER TABLE "Users"
        ADD COLUMN "is_insider" BOOLEAN NOT NULL DEFAULT FALSE;
      END IF;
    END$$;
  `);

  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Users' AND column_name = 'insider_since'
      ) THEN
        ALTER TABLE "Users"
        ADD COLUMN "insider_since" TIMESTAMP;
      END IF;
    END$$;
  `);

  console.log("✅ Insider fields ready");
};

up()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed", err);
    process.exit(1);
  });

