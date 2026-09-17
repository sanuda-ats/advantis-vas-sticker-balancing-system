import mongoose from "mongoose";

const stickerSchema = new mongoose.Schema(
  {
    // Auto-generated sequential ID (via Counter/getNextSequence),
    // NOT typed by the user on the Add Sticker page.
    stickerId: {
      type: Number,
      required: true,
      unique: true,
    },
    stickerName: {
      type: String,
      required: true,
      trim: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    // e.g. '325g + 70g' — flagged 'check if mandatory' in spec, kept optional for now
    volumeWeight: {
      type: String,
      trim: true,
    },
    // No. of items in a box — used to compute Used & Productivity quantities
    itemsPerBox: {
      type: Number,
      required: true,
      min: 1,
    },
    // No. of stickers in a sheet — used to compute Issued quantity
    stickersPerSheet: {
      type: Number,
      required: true,
      min: 1,
    },
    // Flagged 'check if mandatory' in spec, kept optional for now
    price: {
      type: Number,
      min: 0,
    },
    // Flagged 'check if mandatory' in spec, kept optional for now
    mfdDate: {
      type: Date,
    },
    // URL/path to the uploaded or camera-captured product photo
    pictureUrl: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Text index for fast sticker search (Section 8.4) —
// GET /api/stickers/search?q= should query against this.
stickerSchema.index({ stickerName: "text", itemName: "text" });

const Sticker = mongoose.model("Sticker", stickerSchema);

export default Sticker;