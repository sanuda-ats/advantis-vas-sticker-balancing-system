import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Verifies the Bearer token on every route that needs a logged-in user,
// and attaches the full user document (minus passwordHash) to req.user.
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Re-fetch from DB (not just trust the token payload) so a
    // deactivated user (isActive: false) is rejected immediately,
    // even if their token hasn't expired yet.
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};