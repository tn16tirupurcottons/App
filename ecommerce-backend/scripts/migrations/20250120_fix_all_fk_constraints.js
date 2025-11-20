import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../../models/index.js";

/**
 * Comprehensive migration to fix all FK constraint issues
 * Drops old constraints, converts columns to UUID, recreates constraints
 */
const run = async () => {
  try {
    console.log("🔄 Starting comprehensive FK constraint fix...");

    // Ensure UUID extension exists
    await sequelize.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // List of all FK columns that need UUID conversion
    const fkColumns = [
      { table: '"Carts"', column: '"productId"', refTable: '"Products"', refColumn: '"id"' },
      { table: '"Carts"', column: '"userId"', refTable: '"Users"', refColumn: '"id"' },
      { table: '"Orders"', column: '"userId"', refTable: '"Users"', refColumn: '"id"' },
      { table: '"OrderItems"', column: '"orderId"', refTable: '"Orders"', refColumn: '"id"' },
      { table: '"OrderItems"', column: '"productId"', refTable: '"Products"', refColumn: '"id"' },
      { table: '"Wishlists"', column: '"productId"', refTable: '"Products"', refColumn: '"id"' },
      { table: '"Wishlists"', column: '"userId"', refTable: '"Users"', refColumn: '"id"' },
      { table: '"Products"', column: '"categoryId"', refTable: '"Categories"', refColumn: '"id"' },
    ];

    for (const { table, column, refTable, refColumn } of fkColumns) {
      const tableName = table.replace(/"/g, "");
      const columnName = column.replace(/"/g, "");
      
      // Check current column type
      const [result] = await sequelize.query(
        `
        SELECT data_type, column_default
        FROM information_schema.columns
        WHERE lower(table_name) = lower(:table)
          AND lower(column_name) = lower(:column)
        `,
        {
          replacements: { table: tableName, column: columnName },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!result) {
        console.warn(`⚠️  Column ${table}.${column} not found, skipping`);
        continue;
      }

      if (result.data_type === "uuid") {
        console.log(`✅ ${table}.${column} already UUID`);
        continue;
      }

      console.log(`🔄 Converting ${table}.${column} (${result.data_type}) to UUID`);

      // Find and drop existing FK constraints (including old naming patterns)
      const [constraints] = await sequelize.query(
        `
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = :table
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = :column
        `,
        {
          replacements: { table: tableName, column: columnName },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      for (const constraint of constraints || []) {
        try {
          await sequelize.query(
            `ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS "${constraint.constraint_name}" CASCADE;`
          );
          console.log(`  Dropped constraint: ${constraint.constraint_name}`);
        } catch (err) {
          console.warn(`  Could not drop constraint ${constraint.constraint_name}:`, err.message);
        }
      }

      // Drop default if exists
      try {
        await sequelize.query(`ALTER TABLE ${table} ALTER COLUMN ${column} DROP DEFAULT;`);
      } catch (err) {
        // Ignore if no default
      }

      // Convert column to UUID
      await sequelize.query(
        `
        ALTER TABLE ${table}
        ALTER COLUMN ${column}
        TYPE uuid USING (
          CASE
            WHEN ${column} IS NULL THEN gen_random_uuid()
            WHEN ${column}::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
              THEN ${column}::text::uuid
            ELSE gen_random_uuid()
          END
        );
        `
      );

      // Recreate FK constraint
      const constraintName = `${tableName}_${columnName}_fkey`;
      await sequelize.query(
        `
        ALTER TABLE ${table}
        ADD CONSTRAINT "${constraintName}"
        FOREIGN KEY (${column})
        REFERENCES ${refTable}(${refColumn})
        ON DELETE CASCADE;
        `
      );

      console.log(`✅ Converted ${table}.${column} to UUID and recreated FK`);
    }

    console.log("🎉 All FK constraints fixed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

run();

