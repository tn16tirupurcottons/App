import dotenv from "dotenv";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import "./config/db.js";

dotenv.config();

const createAdmin = async () => {
  try {
    const email = "admin@example.com";
    const password = "Ajith@123!";
    
    // Check if admin already exists
    let admin = await User.findOne({ where: { email, role: "admin" } });
    
    if (admin) {
      // Manually hash and update password using raw query to bypass hooks
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Use sequelize.query to bypass hooks
      await User.sequelize.query(
        `UPDATE "Users" SET password = :password, "updatedAt" = NOW() WHERE id = :id`,
        {
          replacements: { password: hashedPassword, id: admin.id },
          type: User.sequelize.QueryTypes.UPDATE
        }
      );
      
      // Refresh the admin object
      await admin.reload();
      console.log("✅ Admin password updated:", email);
      console.log("   Password: Ajith@123!");
    } else {
      // Check if user exists with this email but wrong role
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        // Hash password and update using raw query
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        await User.sequelize.query(
          `UPDATE "Users" SET password = :password, role = :role, "updatedAt" = NOW() WHERE id = :id`,
          {
            replacements: { 
              password: hashedPassword, 
              role: "admin",
              id: existingUser.id 
            },
            type: User.sequelize.QueryTypes.UPDATE
          }
        );
        
        console.log("✅ Existing user updated to admin:", email);
        console.log("   Password: Ajith@123!");
      } else {
        // Create new admin (will be hashed by beforeCreate hook)
        admin = await User.create({
          name: "Admin",
          email: email,
          password: password,
          role: "admin",
        });
        console.log("✅ Admin created:", email);
        console.log("   Password: Ajith@123!");
      }
    }
    
    // Verify the admin exists and can be found
    const verifyAdmin = await User.findOne({ where: { email, role: "admin" } });
    if (verifyAdmin) {
      // Test password hash
      const testMatch = await bcrypt.compare(password, verifyAdmin.password);
      if (testMatch) {
        console.log("\n🔐 Password verification: ✅ Valid");
      } else {
        console.log("\n🔐 Password verification: ❌ Invalid");
        console.log("   ⚠️  Password hash mismatch. This might be due to double hashing.");
        console.log("   💡 Try running the script again, or manually reset the password in the database.");
      }
    } else {
      console.log("\n⚠️  Could not find admin user after creation/update!");
    }
    
    console.log("\n📧 Login credentials:");
    console.log("   Email: admin@example.com");
    console.log("   Password: Ajith@123!");
    console.log("\n💡 Use the 'Admin' toggle on the login page to access admin panel.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error("Full error:", err);
    if (err.name === "SequelizeUniqueConstraintError") {
      console.log("\n💡 Admin already exists. Trying to update password...");
    }
    process.exit(1);
  }
};

createAdmin();
