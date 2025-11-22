import dotenv from "dotenv";
dotenv.config();

import sequelize from "../../config/db.js";
import { DataTypes } from "sequelize";

async function addHeroBannerColumns() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    console.log("🔄 Adding hero banner columns to BrandSettings table...");

    const queryInterface = sequelize.getQueryInterface();
    const tableName = "BrandSettings";
    const columnsToAdd = [
      { name: "heroBoxBackground", type: "TEXT" },
      { name: "heroBoxBorder", type: "TEXT" },
      { name: "heroTextColor", type: "TEXT" },
      { name: "heroTitleShadow", type: "TEXT" },
      { name: "heroSubtitleShadow", type: "TEXT" },
    ];

    for (const column of columnsToAdd) {
      try {
        // Check if column exists
        const tableDescription = await queryInterface.describeTable(tableName);
        if (!tableDescription[column.name]) {
          await queryInterface.addColumn(tableName, column.name, {
            type: DataTypes[column.type],
            allowNull: true,
          });
          console.log(`✅ Added column: ${column.name}`);
        } else {
          console.log(`ℹ️  Column ${column.name} already exists`);
        }
      } catch (err) {
        if (err.message.includes("does not exist")) {
          // Column doesn't exist, add it
          await queryInterface.addColumn(tableName, column.name, {
            type: DataTypes[column.type],
            allowNull: true,
          });
          console.log(`✅ Added column: ${column.name}`);
        } else {
          console.error(`❌ Error adding ${column.name}:`, err.message);
        }
      }
    }

    console.log("\n✅ All hero banner columns added successfully!");
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding hero banner columns:", error);
    await sequelize.close();
    process.exit(1);
  }
}

addHeroBannerColumns();

