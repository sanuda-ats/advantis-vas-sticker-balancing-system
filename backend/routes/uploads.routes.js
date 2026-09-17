import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { protect } from "../middleware/auth.js";
import { restrictTo } from "../middleware/role.js";
import { uploadSingleImage } from "../middleware/upload.js";

const router = Router();

router.post(
  "/image",
  protect,
  restrictTo("Sticker Balancing Supervisor"),
  uploadSingleImage,
  uploadImage
);

export default router;