import { Router } from "express";
import {
  createBalancing,
  previewBalancing,
  getBalancingById,
} from "../controllers/balancing.controller.js";
import { protect } from "../middleware/auth.js";
import { restrictTo } from "../middleware/role.js";

const router = Router();

router.use(protect, restrictTo("Sticker Balancing Supervisor"));

router.post("/", createBalancing);
router.put("/preview", previewBalancing);
router.get("/:id", getBalancingById);

export default router;