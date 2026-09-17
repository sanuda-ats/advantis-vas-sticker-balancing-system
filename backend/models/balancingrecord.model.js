import mongoose from "mongoose";

// Created on the Sticker Balancing Page, one-to-one with an
// issuanceRecord, once the supervisor reconciles what came back.
const balancingRecordSchema = new mongoose.Schema(
  {
    issuanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IssuanceRecord",
      required: true,
      unique: true, // enforces the one-to-one relationship with an issuance
    },
    // Boxes completed by the table
    boxQtyDone: {
      type: Number,
      required: true,
      min: 0,
    },
    // computed (Section 5.2): boxQtyDone * sticker.itemsPerBox
    usedQuantity: {
      type: Number,
      required: true,
    },
    // computed (Section 5.3): issuedQuantity - usedQuantity
    balanceQuantitySystem: {
      type: Number,
      required: true,
    },
    // Pre-filled with balanceQuantitySystem; supervisor may override
    // with the physically counted remaining stickers
    balanceQuantityFinal: {
      type: Number,
      required: true,
    },
    // Damaged stickers counted, default 0
    damagedQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    // computed (Section 5.4):
    // issuedQuantity - (usedQuantity + balanceQuantityFinal + damagedQuantity)
    excessShort: {
      type: Number,
      required: true,
    },
    // computed: 'OK' (green) if excessShort === 0, else 'Re-check' (red)
    reconciliationStatus: {
      type: String,
      required: true,
      enum: ["OK", "Re-check"],
    },
    // Free-text action/remark
    remark: {
      type: String,
      trim: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    balancedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false } // uses balancedAt instead of createdAt/updatedAt, per spec
);

const BalancingRecord = mongoose.model("BalancingRecord", balancingRecordSchema);

export default BalancingRecord;