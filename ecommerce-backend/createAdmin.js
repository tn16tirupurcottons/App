import dotenv from "dotenv";
import User from "./models/User.js";
import "./config/db.js";

dotenv.config();

const createAdmin = async () => {
  try {
    const user = await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: "Ajith123!",   // PLAIN PASSWORD ✔
      role: "admin",
    });

    console.log("Admin created:", user.email);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
