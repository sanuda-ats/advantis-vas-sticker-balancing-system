import { Router } from "express";
import { getProductivity, exportProductivity } from "../controllers/productivity.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Authenticated (both roles) per Section 7.6 — not Supervisor-restricted,
// since Executives are the primary users of this page.
router.get("/", protect, getProductivity);
router.get("/export", protect, exportProductivity);

export default router;