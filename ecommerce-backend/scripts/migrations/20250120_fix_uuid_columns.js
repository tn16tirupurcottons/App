import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../../models/index.js";

const UUID_COLUMNS = [
  { table: '"Carts"', column: '"productId"' },
  { table: '"Carts"', column: '"userId"' },
  { table: '"Orders"', column: '"userId"' },
  { table: '"OrderItems"', column: '"orderId"' },
  { table: '"OrderItems"', column: '"productId"' },
  { table: '"Wishlists"', column: '"productId"' },
  { table: '"Wishlists"', column: '"userId"' },
];

const ensureUuidExtension = async () => {
  await sequelize.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
};

const ensureUuidColumn = async ({ table, column }) => {
  const tableName = table.replace(/"/g, "");
  const columnName = column.replace(/"/g, "");
  const [result] = await sequelize.query(
    `
    SELECT data_type
    FROM information_schema.columns
    WHERE lower(table_name) = lower(:table)
      AND lower(column_name) = lower(:column)
  `,
    {
      replacements: {
        table: tableName,
        column: columnName,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  if (!result) {
    console.warn(`⚠️  Column ${table}.${column} not found, skipping`);
    return;
  }

  if (result.data_type === "uuid") {
    console.log(`✅ ${table}.${column} already UUID`);
    return;
  }

  console.log(`🔄 Converting ${table}.${column} (${result.data_type}) to UUID`);
  await sequelize.query(
    `
    ALTER TABLE ${table}
    ALTER COLUMN ${column} DROP DEFAULT;
  `
  );
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
  console.log(`✅ Converted ${table}.${column} to UUID`);
};

const run = async () => {
  await ensureUuidExtension();
  for (const column of UUID_COLUMNS) {
    await ensureUuidColumn(column);
  }
  console.log("🎉 UUID column migration finished");
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ UUID migration failed", err);
    process.exit(1);
  });

