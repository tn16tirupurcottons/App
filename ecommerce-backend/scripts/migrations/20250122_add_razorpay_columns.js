import dotenv from "dotenv";
dotenv.config();

import sequelize from "../../config/db.js";

async function addRazorpayColumns() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const queryInterface = sequelize.getQueryInterface();

    // Check if columns exist and add them if they don't
    const tableName = "Orders";
    const columnsToAdd = [
      { name: "razorpayOrderId", type: "STRING", allowNull: true },
      { name: "razorpayPaymentId", type: "STRING", allowNull: true },
    ];

    for (const column of columnsToAdd) {
      try {
        // Check if column exists
        const tableDescription = await queryInterface.describeTable(tableName);
        if (!tableDescription[column.name]) {
          await queryInterface.addColumn(tableName, column.name, {
            type: sequelize.Sequelize[column.type],
            allowNull: column.allowNull !== undefined ? column.allowNull : true,
          });
          console.log(`✅ Added column: ${column.name}`);
        } else {
          console.log(`ℹ️  Column ${column.name} already exists`);
        }
      } catch (err) {
        if (err.message.includes("does not exist") || err.message.includes("column") && err.message.includes("does not exist")) {
          // Column doesn't exist, add it
          await queryInterface.addColumn(tableName, column.name, {
            type: sequelize.Sequelize[column.type],
            allowNull: column.allowNull !== undefined ? column.allowNull : true,
          });
          console.log(`✅ Added column: ${column.name}`);
        } else {
          console.error(`❌ Error adding ${column.name}:`, err.message);
        }
      }
    }

    // Also check if paymentMethod enum needs updating
    try {
      const tableDescription = await queryInterface.describeTable(tableName);
      if (tableDescription.paymentMethod) {
        // Check if enum includes all values
        const paymentMethodType = tableDescription.paymentMethod.type;
        console.log(`ℹ️  paymentMethod type: ${JSON.stringify(paymentMethodType)}`);
        // Note: Altering ENUM in PostgreSQL requires special handling
        // For now, we'll just ensure the columns exist
      }
    } catch (err) {
      console.log(`ℹ️  Could not check paymentMethod enum: ${err.message}`);
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

addRazorpayColumns();

