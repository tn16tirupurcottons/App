import dotenv from "dotenv";
dotenv.config();

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function runMigrations() {
  console.log("🚀 Running database migrations...\n");

  const migrations = [
    "scripts/migrations/20250120_add_mobile_number.js",
    "scripts/migrations/20250120_fix_all_fk_constraints.js",
    "scripts/migrations/20260329_remove_mobile_number_unique.js",
    "scripts/migrations/20260330_add_insider_fields.js",
    "scripts/migrations/20260330_create_coupons_tables.js",
  ];

  for (const migration of migrations) {
    try {
      console.log(`\n📦 Running: ${migration}`);
      const { stdout, stderr } = await execAsync(`node ${migration}`);
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error(`❌ Migration ${migration} failed:`, error.message);
      process.exit(1);
    }
  }

  console.log("\n✅ All migrations completed successfully!");
}

runMigrations();

