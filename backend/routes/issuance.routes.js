import { Router } from "express";
import {
  createIssuance,
  getPendingIssuance,
  getIssuanceById,
} from "../controllers/issuance.controller.js";
import { protect } from "../middleware/auth.js";
import { restrictTo } from "../middleware/role.js";

const router = Router();

// Every route on this resource is Supervisor-only, so it's applied once here.
router.use(protect, restrictTo("Sticker Balancing Supervisor"));

router.post("/", createIssuance);
router.get("/pending", getPendingIssuance);
router.get("/:id", getIssuanceById);

export default router;