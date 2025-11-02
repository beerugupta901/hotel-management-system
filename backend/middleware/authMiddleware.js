import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Check if logged in
export const protect = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

// Restrict to staff only
export const staffOnly = (req, res, next) => {
  if (req.user.role !== "staff") {
    return res.status(403).json({ message: "Staff login required" });
  }
  next();
};
