import { Router } from "express";
import {
  listStickers,
  searchStickers,
  getStickerById,
  getNextStickerId,
  createSticker,
} from "../controllers/sticker.controller.js";
import { protect } from "../middleware/auth.js";
import { restrictTo } from "../middleware/role.js";

const router = Router();

// IMPORTANT: '/search' and '/next-id' must be declared BEFORE '/:id',
// otherwise Express would treat "search" or "next-id" as an :id value.
router.get("/search", protect, searchStickers);
router.get("/next-id", protect, restrictTo("Sticker Balancing Supervisor"), getNextStickerId);
router.get("/:id", protect, getStickerById);
router.get("/", protect, listStickers);
router.post("/", protect, restrictTo("Sticker Balancing Supervisor"), createSticker);

export default router;