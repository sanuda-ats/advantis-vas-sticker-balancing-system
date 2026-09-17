// POST /api/uploads/image — Section 7.3
// By the time this runs, middleware/upload.js (uploadSingleImage) has
// already validated the file and saved it to backend/uploads/.
export const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file uploaded" });
  }

  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  res.status(201).json({ url });
};