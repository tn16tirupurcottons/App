import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import { issueTokensForUser, toPublicUser } from "../authController.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ where: { email, role: "admin" } });
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const tokens = await issueTokensForUser(admin, res);

    res.json({
      success: true,
      user: toPublicUser(admin),
      ...tokens,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findByPk(req.user?.id);
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json({ success: true, user: toPublicUser(admin) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
