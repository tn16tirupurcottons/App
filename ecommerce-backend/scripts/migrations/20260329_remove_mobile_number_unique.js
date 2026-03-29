import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../../models/index.js";

const up = async () => {
  console.log("🔧 Dropping Users.mobileNumber unique index (optional mobile uniqueness)");

  // The previous migration created this unique index.
  await sequelize.query(`DROP INDEX IF EXISTS "Users_mobileNumber_unique";`);

  // Also ensure there is no leftover unique constraint by index name variants.
  await sequelize.query(
    `DROP INDEX IF EXISTS "Users_mobileNumber_key";`
  );

  console.log("✅ Mobile unique constraint removed (if it existed)");
};

up()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed", err);
    process.exit(1);
  });

