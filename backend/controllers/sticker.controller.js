import Sticker from "../models/sticker.model.js";
import { getNextSequence, peekNextSequence } from "../utils/getNextSequence.js";

// GET /api/stickers — Section 7.3 (paginated) — powers "Browse All Stickers"
export const listStickers = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const [stickers, total] = await Promise.all([
    Sticker.find()
      .sort({ stickerId: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Sticker.countDocuments(),
  ]);

  res.status(200).json({ data: stickers, page, limit, total });
};

// GET /api/stickers/search?q=&by=name|id — Section 7.3, powers the Issuing Page type-ahead
// `by` defaults to 'name' for backwards compatibility with existing callers.
export const searchStickers = async (req, res) => {
  const q = (req.query.q || "").trim();
  const by = req.query.by === "id" ? "id" : "name";

  if (!q) return res.status(200).json([]);

  if (by === "id") {
    // Numeric prefix match on stickerId, e.g. "12" matches 12, 120, 125...
    const digitsOnly = q.replace(/\D/g, "");
    if (!digitsOnly) return res.status(200).json([]);

    const stickers = await Sticker.aggregate([
      { $addFields: { stickerIdStr: { $toString: "$stickerId" } } },
      { $match: { stickerIdStr: { $regex: `^${digitsOnly}` } } },
      { $sort: { stickerId: 1 } },
      { $limit: 20 },
    ]);
    return res.status(200).json(stickers);
  }

  // by === 'name' — relies on the text index defined on sticker.model.js
  // ({ stickerName: 'text', itemName: 'text' })
  const stickers = await Sticker.find(
    { $text: { $search: q } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(20);

  res.status(200).json(stickers);
};

// GET /api/stickers/:id — Section 7.3
export const getStickerById = async (req, res) => {
  const sticker = await Sticker.findById(req.params.id);
  if (!sticker) return res.status(404).json({ message: "Sticker not found" });
  res.status(200).json(sticker);
};

// GET /api/stickers/next-id — Section 7.3 (informational preview only)
export const getNextStickerId = async (req, res) => {
  const nextStickerId = await peekNextSequence("stickerId");
  res.status(200).json({ nextStickerId });
};

// POST /api/stickers — Section 7.3
export const createSticker = async (req, res) => {
  const {
    stickerName,
    itemName,
    volumeWeight,
    itemsPerBox,
    stickersPerSheet,
    price,
    mfdDate,
    pictureUrl,
  } = req.body;

  if (!stickerName || !itemName || !itemsPerBox || !stickersPerSheet || !pictureUrl) {
    return res.status(400).json({
      message:
        "stickerName, itemName, itemsPerBox, stickersPerSheet and pictureUrl are required",
    });
  }

  const stickerId = await getNextSequence("stickerId");

  const sticker = await Sticker.create({
    stickerId,
    stickerName,
    itemName,
    volumeWeight,
    itemsPerBox,
    stickersPerSheet,
    price,
    mfdDate,
    pictureUrl,
    createdBy: req.user._id,
  });

  res.status(201).json(sticker);
};