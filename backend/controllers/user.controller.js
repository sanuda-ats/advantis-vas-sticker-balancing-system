import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { getNextSequence } from "../utils/getNextSequence.js";

// GET /api/users/me — any authenticated role
export const getMe = async (req, res) => {
  res.status(200).json({
    userId: req.user.userId,
    userName: req.user.userName,
    role: req.user.role,
    location: req.user.location,
  });
};

// POST /api/users — Admin only
export const createUser = async (req, res) => {
  const { userName, role, location, password } = req.body;

  if (!userName || !role || !location || !password) {
    return res
      .status(400)
      .json({ message: "userName, role, location and password are required" });
  }

  const userId = await getNextSequence("userId");
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({ userId, userName, role, location, passwordHash });

  res.status(201).json({
    _id: user._id,
    userId: user.userId,
    userName: user.userName,
    role: user.role,
    location: user.location,
    isActive: user.isActive,
  });
};

// GET /api/users — Admin only (feeds the Manage Users table)
export const getUsers = async (req, res) => {
  // passwordHash is excluded by default (select: false on the schema)
  const users = await User.find().sort({ userId: 1 });
  res.status(200).json(users);
};

// PUT /api/users/:id — Admin only. Editing details and/or resetting a
// password both go through here — password is optional; omit it to
// leave the current one untouched.
export const updateUser = async (req, res) => {
  const { userName, role, location, isActive, password } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (isActive === false && String(user._id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot deactivate your own account" });
  }

  if (userName !== undefined) user.userName = userName;
  if (role !== undefined) user.role = role;
  if (location !== undefined) user.location = location;
  if (isActive !== undefined) user.isActive = isActive;
  if (password) {
    user.passwordHash = await bcrypt.hash(password, 10);
  }

  await user.save();

  res.status(200).json({
    _id: user._id,
    userId: user.userId,
    userName: user.userName,
    role: user.role,
    location: user.location,
    isActive: user.isActive,
  });
};

// DELETE /api/users/:id — Admin only.
// Deactivates rather than hard-deletes: issuanceRecord.issuedBy,
// balancingRecord.verifiedBy, and sticker.createdBy all reference users,
// so a real delete would either orphan those references or require
// cascading through historical audit data. Setting isActive: false
// blocks login immediately while preserving history — functionally
// equivalent to "delete" from the Admin's point of view.
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (String(user._id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({ message: "User deactivated", userId: user.userId });
};