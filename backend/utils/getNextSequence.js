import Counter from "../models/counter.model.js";

/**
 * Atomically increments and returns the next value for a named counter
 * (e.g. 'stickerId', 'userId'). Uses findByIdAndUpdate with $inc + upsert,
 * so concurrent requests can never receive the same number (Section 8.2).
 */
export const getNextSequence = async (name) => {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

/**
 * Read-only preview of what the NEXT id would be, without incrementing
 * the counter. Used by GET /api/stickers/next-id — purely informational,
 * the real id is still generated atomically by getNextSequence() on save.
 */
export const peekNextSequence = async (name) => {
  const counter = await Counter.findById(name);
  return (counter?.seq || 0) + 1;
};