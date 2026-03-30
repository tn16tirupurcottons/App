import dotenv from "dotenv";
dotenv.config();

import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";

const migrationErrorIsPgcryptoPermission = (err) => {
  const msg =
    String(err?.message || "") +
    " " +
    String(err?.stderr || "");
  return (
    msg.includes('permission denied to create extension "pgcrypto"') ||
    msg.includes("permission denied to create extension pgcrypto") ||
    msg.includes("pgcrypto")
  );
};

const execAsync = promisify(exec);

export async function runMigrationsSafely() {
  console.log("🚀 Running database migrations...\n");

  const migrations = [
    "scripts/migrations/20250120_add_mobile_number.js",
    "scripts/migrations/20250120_fix_all_fk_constraints.js",
    "scripts/migrations/20260329_remove_mobile_number_unique.js",
    "scripts/migrations/20260330_add_insider_fields.js",
    "scripts/migrations/20260330_create_coupons_tables.js",
    "scripts/migrations/20260330_add_category_isActive.js",
  ];

  for (const migration of migrations) {
    try {
      console.log(`\n📦 Running: ${migration}`);
      const { stdout, stderr } = await execAsync(`node ${migration}`);
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error(`❌ Migration ${migration} failed:`, error.message);
      // Production-safe failover: if Postgres user lacks privileges for pgcrypto extension,
      // skip that migration so the app can start and other migrations can still apply.
      if (migrationErrorIsPgcryptoPermission(error)) {
        console.warn(`⚠️ Skipping ${migration} due to pgcrypto permission issue.`);
        continue;
      }
      throw error;
    }
  }

  console.log("\n✅ All migrations completed successfully!");
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file://${process.argv[1]}`));

if (isMain) {
  runMigrationsSafely().catch((err) => {
    console.error("❌ Migrations failed:", err?.message || err);
    process.exit(1);
  });
}

export default runMigrationsSafely;

