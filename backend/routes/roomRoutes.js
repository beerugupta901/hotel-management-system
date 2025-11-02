import express from "express";
import Room from "../models/Room.js";
import { protect, staffOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get all rooms (public)
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Error fetching rooms", error: err.message });
  }
});

// ✅ Add room (staff only)
router.post("/", protect, staffOnly, async (req, res) => {
  try {
    const { name, price, description, status } = req.body;
    const existingRoom = await Room.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingRoom) {
      return res.status(400).json({ message: "Room already exists" });
    }

    const newRoom = await Room.create({
      name,
      price,
      description,
      status: status || "available",
    });

    res.status(201).json({ message: "Room added successfully", room: newRoom });
  } catch (err) {
    res.status(500).json({ message: "Error adding room", error: err.message });
  }
});

// ✅ Update room details (staff only)
router.put("/:id", protect, staffOnly, async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRoom) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room updated successfully", room: updatedRoom });
  } catch (err) {
    res.status(500).json({ message: "Error updating room", error: err.message });
  }
});

// ✅ Delete room (staff only)
router.delete("/:id", protect, staffOnly, async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting room", error: err.message });
  }
});

// ✅ Make room available again
// ✅ Make room available again (and mark related bookings as ended)
// ✅ Make room available again AND delete its active bookings
router.put("/:id/make-free", protect, staffOnly, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const { default: Booking } = await import("../models/Booking.js");

    // Delete all active bookings (booked or checkedin)
    const deletedBookings = await Booking.deleteMany({
      room: room._id,
      status: { $in: ["booked", "checkedin"] },
    });

    // Update room status to available
    room.status = "available";
    await room.save();

    res.json({
      message: `Room marked as available. ${deletedBookings.deletedCount} active booking(s) removed.`,
      room,
    });
  } catch (err) {
    console.error("Error in make-free route:", err);
    res.status(500).json({ message: "Error freeing room", error: err.message });
  }
});




// ✅ Mark room under service
router.put("/:id/under-service", protect, staffOnly, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status: "under service" },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room marked as under service", room });
  } catch (err) {
    res.status(500).json({ message: "Error updating room", error: err.message });
  }
});

export default router;
