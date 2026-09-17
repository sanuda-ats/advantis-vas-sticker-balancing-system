// One-off script to create the very first user directly in the database.
// Needed because every /api/users endpoint now requires an existing Admin
// to already be logged in — this breaks that chicken-and-egg problem.
//
// Run from the project root:
//   node backend/scripts/seed.js
//
// Safe to re-run — it skips creation if the user already exists.
// Once you can log in as this Admin, create your Supervisor and
// Executive accounts through the Manage Users page — there's no need
// to seed those directly.

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";
import { getNextSequence } from "../utils/getNextSequence.js";

dotenv.config();

const SEED_USERNAME = "System Admin";
const SEED_ROLE = "Admin";
const SEED_LOCATION = "KDC VAS";
const SEED_PASSWORD = "Password123"; // change this via Manage Users after first login

const run = async () => {
  await connectDB();

  const existing = await User.findOne({ userName: SEED_USERNAME });
  if (existing) {
    console.log(`Seed admin already exists (userId: ${existing.userId}). Nothing to do.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const userId = await getNextSequence("userId");
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const user = await User.create({
    userId,
    userName: SEED_USERNAME,
    role: SEED_ROLE,
    location: SEED_LOCATION,
    passwordHash,
    isActive: true,
  });

  console.log("Seed admin created — use these to log in via POST /api/auth/login:");
  console.log({ userId: user.userId, password: SEED_PASSWORD });

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});