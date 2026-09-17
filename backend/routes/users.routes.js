import { Router } from "express";
import {
  getMe,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";
import { restrictTo } from "../middleware/role.js";

const router = Router();

// Any authenticated role can read their own profile (Navbar identity, etc.)
router.get("/me", protect, getMe);

// Everything else is Admin-only: creating, listing, editing, deactivating users.
router.get("/", protect, restrictTo("Admin"), getUsers);
router.post("/", protect, restrictTo("Admin"), createUser);
router.put("/:id", protect, restrictTo("Admin"), updateUser);
router.delete("/:id", protect, restrictTo("Admin"), deleteUser);

export default router;