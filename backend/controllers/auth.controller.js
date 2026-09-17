import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

const signToken = (user) =>
  jwt.sign(
    { id: user._id, userId: user.userId, role: user.role, location: user.location },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );

// POST /api/auth/login — Section 7.1
export const login = async (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ message: "userId and password are required" });
  }

  // passwordHash has select: false on the schema, so it must be
  // explicitly requested here to compare it.
  const user = await User.findOne({ userId }).select("+passwordHash");

  if (!user || !user.isActive) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user);

  res.status(200).json({
    token,
    user: {
      userId: user.userId,
      userName: user.userName,
      role: user.role,
      location: user.location,
    },
  });
};

// POST /api/auth/logout — Section 7.1
// JWTs are stateless, so this is really just a client-side action
// (discard the token). Kept as a real endpoint so a token blocklist
// can be added later without changing the frontend contract.
export const logout = async (req, res) => {
  res.status(200).json({ message: "Logged out" });
};