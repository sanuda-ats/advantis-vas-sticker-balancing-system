import IssuanceRecord from "../models/issuancerecord.model.js";
import Sticker from "../models/sticker.model.js";
import { calcIssuedQuantity } from "../services/calculation.js";

// POST /api/issuance — Section 7.4
export const createIssuance = async (req, res) => {
  const { stickerId, tableNo, handoverSheetsFull, handoverSheetsHalf } = req.body;

  if (!stickerId || !tableNo || handoverSheetsFull == null || handoverSheetsHalf == null) {
    return res.status(400).json({
      message: "stickerId, tableNo, handoverSheetsFull and handoverSheetsHalf are required",
    });
  }

  // stickerId here is the sticker's Mongo _id (issuanceRecords.stickerId
  // is an ObjectId ref, per Section 4.3) — not the human-readable stickerId number.
  const sticker = await Sticker.findById(stickerId);
  if (!sticker) return res.status(404).json({ message: "Sticker not found" });

  // 5.1 — computed and stored server-side, never trusted from the client
  const issuedQuantity = calcIssuedQuantity(
    sticker.stickersPerSheet,
    Number(handoverSheetsFull),
    Number(handoverSheetsHalf)
  );

  const now = new Date();

  const issuance = await IssuanceRecord.create({
    stickerId: sticker._id,
    tableNo,
    location: req.user.location, // copied from the issuing user, per spec
    date: now,
    time: now,
    handoverSheetsFull,
    handoverSheetsHalf,
    issuedQuantity,
    status: "pending",
    issuedBy: req.user._id,
  });

  res.status(201).json(issuance);
};

// GET /api/issuance/pending?location= — Section 7.4, feeds the Balancing Page picker
export const getPendingIssuance = async (req, res) => {
  const location = req.query.location || req.user.location;

  const issuances = await IssuanceRecord.find({ status: "pending", location })
    .populate("stickerId")
    .sort({ createdAt: -1 });

  res.status(200).json(issuances);
};

// GET /api/issuance/:id — Section 7.4
export const getIssuanceById = async (req, res) => {
  const issuance = await IssuanceRecord.findById(req.params.id).populate("stickerId");
  if (!issuance) return res.status(404).json({ message: "Issuance record not found" });
  res.status(200).json(issuance);
};