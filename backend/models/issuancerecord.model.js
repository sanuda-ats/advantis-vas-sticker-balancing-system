import mongoose from "mongoose";

// One document = one hand-out of sticker sheets to one table for one
// sticker type. Created on the Sticker Issuing Page.
const issuanceRecordSchema = new mongoose.Schema(
  {
    stickerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sticker",
      required: true,
    },
    // The VAS table the sheets were handed to
    tableNo: {
      type: String,
      required: true,
      trim: true,
    },
    // Copied from the issuing user's location at write time
    location: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    time: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // 'Handover Sheets' column
    handoverSheetsFull: {
      type: Number,
      required: true,
      min: 0,
    },
    // 'Half' column
    handoverSheetsHalf: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    // computed server-side (services/calculation.js, Section 5.1):
    // stickersPerSheet * handoverSheetsFull + handoverSheetsHalf
    issuedQuantity: {
      type: Number,
      required: true,
    },
    // flips to 'balanced' once a linked balancingRecord is submitted
    status: {
      type: String,
      required: true,
      enum: ["pending", "balanced"],
      default: "pending",
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Section 8.4 required indexes
issuanceRecordSchema.index({ location: 1, status: 1 });
issuanceRecordSchema.index({ tableNo: 1, date: 1 });

const IssuanceRecord = mongoose.model("IssuanceRecord", issuanceRecordSchema);

export default IssuanceRecord;