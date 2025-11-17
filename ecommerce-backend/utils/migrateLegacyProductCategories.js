import { QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import sequelize from "../config/db.js";

const DEFAULT_CATEGORY_SLUG = "tn16-legacy";

export const migrateLegacyProductCategories = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const tableInfo = await queryInterface
    .describeTable("Products")
    .catch(() => null);

  if (!tableInfo) return;

  if (!tableInfo.categoryId) {
    await sequelize
      .query('ALTER TABLE "Products" ADD COLUMN "categoryId" UUID;')
      .catch(() => {});
  }

  const defaultCategoryId = await ensureDefaultCategory();

  await sequelize.query(
    'UPDATE "Products" SET "categoryId" = :categoryId WHERE "categoryId" IS NULL',
    {
      replacements: { categoryId: defaultCategoryId },
      type: QueryTypes.UPDATE,
    }
  );

  await sequelize
    .query('ALTER TABLE "Products" ALTER COLUMN "categoryId" SET NOT NULL;')
    .catch(() => {});

  await sequelize
    .query(
      'ALTER TABLE "Products" ADD CONSTRAINT "Products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;'
    )
    .catch(() => {});
};

const ensureDefaultCategory = async () => {
  const existing = await sequelize.query(
    'SELECT "id" FROM "Categories" WHERE "slug" = :slug LIMIT 1',
    {
      replacements: { slug: DEFAULT_CATEGORY_SLUG },
      type: QueryTypes.SELECT,
    }
  );

  if (existing.length) return existing[0].id;

  const id = uuidv4();
  const now = new Date().toISOString();
  await sequelize.query(
    'INSERT INTO "Categories" ("id","name","slug","description","createdAt","updatedAt") VALUES (:id,:name,:slug,:description,:createdAt,:updatedAt)',
    {
      replacements: {
        id,
        name: "TN16 Legacy",
        slug: DEFAULT_CATEGORY_SLUG,
        description: "Migrated category for legacy TN16 products",
        createdAt: now,
        updatedAt: now,
      },
      type: QueryTypes.INSERT,
    }
  );

  return id;
};

