import mongoose from "mongoose";
import BalancingRecord from "../models/balancingrecord.model.js";
import IssuanceRecord from "../models/issuancerecord.model.js";
import { computeBalancing } from "../services/calculation.js";

// POST /api/balancing — Section 7.5
// Creates the balancingRecord AND flips the linked issuanceRecord's status
// to 'balanced' inside a transaction, so the two can never go out of sync
// (Section 8.2).
export const createBalancing = async (req, res) => {
  const { issuanceId, boxQtyDone, balanceQuantityFinal, damagedQuantity = 0, remark = "" } =
    req.body;

  if (!issuanceId || boxQtyDone == null) {
    return res.status(400).json({ message: "issuanceId and boxQtyDone are required" });
  }

  const issuance = await IssuanceRecord.findById(issuanceId).populate("stickerId");
  if (!issuance) return res.status(404).json({ message: "Issuance record not found" });
  if (issuance.status === "balanced") {
    return res.status(409).json({ message: "This issuance has already been balanced" });
  }

  // Server recomputes everything authoritatively — never trust client math (Section 8.2).
  const computed = computeBalancing({
    issuedQuantity: issuance.issuedQuantity,
    itemsPerBox: issuance.stickerId.itemsPerBox,
    boxQtyDone,
    balanceQuantityFinal,
    damagedQuantity,
  });

  // NOTE: transactions require MongoDB to be running as a replica set
  // (MongoDB Atlas gives you this automatically; a plain local
  // `mongod --dbpath ...` single instance does NOT support transactions
  // unless started with --replSet).
  const session = await mongoose.startSession();
  let balancingRecord;

  try {
    await session.withTransaction(async () => {
      const created = await BalancingRecord.create(
        [
          {
            issuanceId: issuance._id,
            boxQtyDone,
            ...computed,
            remark,
            verifiedBy: req.user._id,
          },
        ],
        { session }
      );
      balancingRecord = created[0];

      issuance.status = "balanced";
      await issuance.save({ session });
    });
  } finally {
    session.endSession();
  }

  res.status(201).json(balancingRecord);
};

// PUT /api/balancing/preview — Section 7.5
// Stateless — computes but never persists, so the frontend can show
// green/red live as the supervisor types.
export const previewBalancing = async (req, res) => {
  const { issuanceId, boxQtyDone, balanceQuantityFinal, damagedQuantity = 0 } = req.body;

  if (!issuanceId || boxQtyDone == null) {
    return res.status(400).json({ message: "issuanceId and boxQtyDone are required" });
  }

  const issuance = await IssuanceRecord.findById(issuanceId).populate("stickerId");
  if (!issuance) return res.status(404).json({ message: "Issuance record not found" });

  const computed = computeBalancing({
    issuedQuantity: issuance.issuedQuantity,
    itemsPerBox: issuance.stickerId.itemsPerBox,
    boxQtyDone,
    balanceQuantityFinal,
    damagedQuantity,
  });

  res.status(200).json(computed);
};

// GET /api/balancing/:id — Section 7.5
export const getBalancingById = async (req, res) => {
  const record = await BalancingRecord.findById(req.params.id).populate({
    path: "issuanceId",
    populate: { path: "stickerId" },
  });
  if (!record) return res.status(404).json({ message: "Balancing record not found" });
  res.status(200).json(record);
};