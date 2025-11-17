import { QueryTypes } from "sequelize";
import sequelize from "../config/db.js";
import slugify from "./slugify.js";

const normalizeSlug = (value, fallback) => {
  const base = slugify(value || "") || fallback;
  return base;
};

export const migrateLegacyProductSlugs = async () => {
  const queryInterface = sequelize.getQueryInterface();

  const tableInfo = await queryInterface
    .describeTable("Products")
    .catch(() => null);

  if (!tableInfo) return;

  if (!tableInfo.slug) {
    // Add column as nullable first
    await sequelize.query(
      'ALTER TABLE "Products" ADD COLUMN "slug" VARCHAR(255);'
    );
  }

  const rows = await sequelize.query(
    'SELECT "id", "name" FROM "Products" WHERE "slug" IS NULL OR "slug" = \'\'',
    { type: QueryTypes.SELECT }
  );

  if (rows.length === 0) {
    // ensure column is not null/unique if empty but column missing prior
    await ensureConstraints();
    return;
  }

  const usedSlugs = new Set(
    (
      await sequelize.query('SELECT "slug" FROM "Products" WHERE "slug" IS NOT NULL', {
        type: QueryTypes.SELECT,
      })
    )
      .map((row) => row.slug)
      .filter(Boolean)
  );

  for (const row of rows) {
    const fallback = `product-${row.id}`;
    const base = normalizeSlug(row.name, fallback);
    let candidate = base;
    let counter = 1;

    while (usedSlugs.has(candidate)) {
      candidate = `${base}-${counter++}`;
    }
    usedSlugs.add(candidate);

    await sequelize.query(
      'UPDATE "Products" SET "slug" = :slug WHERE "id" = :id',
      {
        replacements: { slug: candidate, id: row.id },
        type: QueryTypes.UPDATE,
      }
    );
  }

  console.log(`🔧 Migrated ${rows.length} legacy product slugs`);

  await ensureConstraints();
};

const ensureConstraints = async () => {
  await sequelize
    .query('ALTER TABLE "Products" ALTER COLUMN "slug" SET NOT NULL;')
    .catch(() => {});
  await sequelize
    .query(
      'ALTER TABLE "Products" ADD CONSTRAINT "Products_slug_key" UNIQUE ("slug");'
    )
    .catch(() => {});
};

