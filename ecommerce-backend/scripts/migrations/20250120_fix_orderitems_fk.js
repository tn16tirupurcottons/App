import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../../models/index.js";

/**
 * Fix specific FK constraint name issue for OrderItems
 */
const run = async () => {
  try {
    console.log("🔄 Fixing OrderItems FK constraints...");

    // Drop old constraint if it exists
    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'OrderItems_productId_fkey1'
        ) THEN
          ALTER TABLE "OrderItems" DROP CONSTRAINT "OrderItems_productId_fkey1" CASCADE;
          RAISE NOTICE 'Dropped old constraint: OrderItems_productId_fkey1';
        END IF;
      END
      $$;
    `);

    // Ensure column is UUID
    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'OrderItems' AND column_name = 'productId'
        ) THEN
          -- Check if already UUID
          IF (SELECT data_type FROM information_schema.columns 
              WHERE table_name = 'OrderItems' AND column_name = 'productId') != 'uuid' THEN
            ALTER TABLE "OrderItems" 
            ALTER COLUMN "productId" TYPE uuid USING (
              CASE
                WHEN "productId" IS NULL THEN gen_random_uuid()
                WHEN "productId"::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                  THEN "productId"::text::uuid
                ELSE gen_random_uuid()
              END
            );
            RAISE NOTICE 'Converted OrderItems.productId to UUID';
          ELSE
            RAISE NOTICE 'OrderItems.productId already UUID';
          END IF;
        END IF;
      END
      $$;
    `);

    // Recreate FK constraint with correct name
    await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'OrderItems_productId_fkey'
        ) THEN
          ALTER TABLE "OrderItems"
          ADD CONSTRAINT "OrderItems_productId_fkey"
          FOREIGN KEY ("productId")
          REFERENCES "Products"("id")
          ON DELETE CASCADE;
          RAISE NOTICE 'Created FK constraint: OrderItems_productId_fkey';
        ELSE
          RAISE NOTICE 'FK constraint OrderItems_productId_fkey already exists';
        END IF;
      END
      $$;
    `);

    // Same for orderId
    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'OrderItems_orderId_fkey1'
        ) THEN
          ALTER TABLE "OrderItems" DROP CONSTRAINT "OrderItems_orderId_fkey1" CASCADE;
          RAISE NOTICE 'Dropped old constraint: OrderItems_orderId_fkey1';
        END IF;
      END
      $$;
    `);

    await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'OrderItems_orderId_fkey'
        ) THEN
          ALTER TABLE "OrderItems"
          ADD CONSTRAINT "OrderItems_orderId_fkey"
          FOREIGN KEY ("orderId")
          REFERENCES "Orders"("id")
          ON DELETE CASCADE;
          RAISE NOTICE 'Created FK constraint: OrderItems_orderId_fkey';
        END IF;
      END
      $$;
    `);

    console.log("✅ OrderItems FK constraints fixed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

run();

