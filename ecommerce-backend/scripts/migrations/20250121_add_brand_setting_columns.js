import dotenv from "dotenv";
dotenv.config();

import sequelize from "../../config/db.js";

async function addBrandSettingColumns() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const queryInterface = sequelize.getQueryInterface();

    // Check if columns exist and add them if they don't
    const tableName = "BrandSettings";
    const columnsToAdd = [
      { name: "headerTextColor", type: "TEXT" },
      { name: "headerPrimaryText", type: "TEXT" },
      { name: "headerSecondaryText", type: "TEXT" },
      { name: "footerBackground", type: "TEXT" },
      { name: "footerTextColor", type: "TEXT" },
    ];

    for (const column of columnsToAdd) {
      try {
        // Check if column exists
        const tableDescription = await queryInterface.describeTable(tableName);
        if (!tableDescription[column.name]) {
          await queryInterface.addColumn(tableName, column.name, {
            type: sequelize.Sequelize[column.type],
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
            type: sequelize.Sequelize[column.type],
            allowNull: true,
          });
          console.log(`✅ Added column: ${column.name}`);
        } else {
          console.error(`❌ Error adding ${column.name}:`, err.message);
        }
      }
    }

    console.log("\n✅ Migration completed successfully!");
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    await sequelize.close();
    process.exit(1);
  }
}

addBrandSettingColumns();

