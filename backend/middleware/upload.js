import multer from "multer";
import path from "path";
import fs from "fs";

// Files land in backend/uploads (served statically by server.js at /uploads).
// Resolved from process.cwd() because npm scripts now run from INSIDE
// backend/ (package.json lives there), so cwd is already backend/.
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// Section 8.1: restrict image upload MIME types/size (jpg/png, max 5MB)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG and PNG images are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Field name must be 'image' — matches Section 7.3: POST /api/uploads/image
export const uploadSingleImage = upload.single("image");