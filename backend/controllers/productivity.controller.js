import mongoose from "mongoose";
import BalancingRecord from "../models/balancingrecord.model.js";
import Sticker from "../models/sticker.model.js";
import { streamProductivityExcel } from "../utils/excelExport.js";

const buildDateMatch = (date) => {
  if (!date) return {};
  // Built from y-m-d parts directly (not `new Date(date)`) to avoid the
  // UTC-vs-local-midnight boundary shift.
  const [year, month, day] = date.split("-").map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);
  return { balancedAt: { $gte: start, $lte: end } };
};

// Shared first half of both pipelines: match by date, join to the
// issuance for tableNo/location/stickerId, then optionally filter by
// location and/or a specific sticker type.
const baseStages = ({ date, location, stickerId }) => {
  const stages = [
    { $match: buildDateMatch(date) },
    {
      $lookup: {
        from: "issuancerecords",
        localField: "issuanceId",
        foreignField: "_id",
        as: "issuance",
      },
    },
    { $unwind: "$issuance" },
  ];

  if (location) {
    stages.push({ $match: { "issuance.location": location } });
  }

  if (stickerId && mongoose.isValidObjectId(stickerId)) {
    stages.push({ $match: { "issuance.stickerId": new mongoose.Types.ObjectId(stickerId) } });
  }

  return stages;
};

// Screen view (table + chart): grouped by Table No only. If a specific
// sticker is selected, the filter above narrows it to that sticker's
// contribution; "All Stickers" (no filter) sums across every type.
const buildScreenPipeline = (filters) => [
  ...baseStages(filters),
  {
    $group: {
      _id: "$issuance.tableNo",
      quantity: { $sum: "$usedQuantity" },
    },
  },
  { $project: { _id: 0, tableNo: "$_id", quantity: 1 } },
  { $sort: { tableNo: 1 } },
];

// Excel export: grouped by Table No AND Sticker Type, per Section 4 of
// the latest requirements — always shows the product-wise breakdown,
// even when "All Stickers" is selected on screen.
const buildBreakdownPipeline = (filters) => [
  ...baseStages(filters),
  {
    $lookup: {
      from: "stickers",
      localField: "issuance.stickerId",
      foreignField: "_id",
      as: "sticker",
    },
  },
  { $unwind: "$sticker" },
  {
    $group: {
      _id: { tableNo: "$issuance.tableNo", stickerName: "$sticker.stickerName" },
      quantity: { $sum: "$usedQuantity" },
    },
  },
  { $project: { _id: 0, tableNo: "$_id.tableNo", stickerName: "$_id.stickerName", quantity: 1 } },
  { $sort: { tableNo: 1, stickerName: 1 } },
];

// GET /api/productivity?date=&location=&stickerId= — Section 7.6
export const getProductivity = async (req, res) => {
  const { date, location, stickerId } = req.query;
  const results = await BalancingRecord.aggregate(buildScreenPipeline({ date, location, stickerId }));
  res.status(200).json(results);
};

// GET /api/productivity/export?date=&location=&stickerId= — Section 7.6
export const exportProductivity = async (req, res) => {
  const { date, location, stickerId } = req.query;
  const rows = await BalancingRecord.aggregate(buildBreakdownPipeline({ date, location, stickerId }));

  let stickerLabel;
  if (stickerId && mongoose.isValidObjectId(stickerId)) {
    const sticker = await Sticker.findById(stickerId).select("stickerName");
    stickerLabel = sticker?.stickerName;
  }

  await streamProductivityExcel(res, rows, { date, location, stickerLabel });
};