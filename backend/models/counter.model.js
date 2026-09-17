import mongoose from "mongoose";

// Tiny utility collection used to atomically generate sequential
// human-readable IDs (stickerId, userId) without race conditions.
// One document per counter, e.g. { _id: 'stickerId', seq: 275 }
const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;