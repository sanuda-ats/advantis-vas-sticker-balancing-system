import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Human-readable auto-incrementing ID (see utils/getNextSequence.js,
    // backed by the Counter model) — NOT the Mongo _id.
    userId: {
      type: Number,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["Sticker Balancing Supervisor", "Executive", "Admin"],
    },
    // Used to filter data per site, e.g. 'KDC VAS'
    location: {
      type: String,
      required: true,
      trim: true,
    },
    // bcrypt hash — never store or return plaintext passwords
    passwordHash: {
      type: String,
      required: true,
      select: false, // excluded from queries by default; opt in with .select('+passwordHash')
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true } // adds createdAt / updatedAt
);

const User = mongoose.model("User", userSchema);

export default User;