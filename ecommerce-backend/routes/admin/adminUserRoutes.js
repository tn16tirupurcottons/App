import express from "express";
import {
  listUsers,
  updateUserRole,
  deleteUser,
} from "../../controllers/admin/userController.js";
import { adminOnly } from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", adminOnly, listUsers);
router.patch("/:id/role", adminOnly, updateUserRole);
router.delete("/:id", adminOnly, deleteUser);

export default router;

