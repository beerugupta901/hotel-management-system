// Create a booking (Customer only)
import express from "express";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import { protect, staffOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a booking (Customer only)
// (inside bookingRoute.js) — replace your POST "/" route with this:

// bookingRoute.js (inside POST /)
// ✅ Create a booking (Customer only)
router.post("/", protect, async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;

    // Validate input
    if (!roomId || !checkIn || !checkOut)
      return res.status(400).json({ message: "Missing required fields" });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // ✅ Prevent overlapping bookings (use Booking collection)
    const overlapping = await Booking.findOne({
      room: roomId,
      status: { $in: ["booked", "checkedin"] },
      $or: [
        { checkIn: { $lte: new Date(checkOut) }, checkOut: { $gte: new Date(checkIn) } },
      ],
    });

    if (overlapping) {
      return res.status(400).json({ message: "Room already booked for these dates" });
    }

    // ✅ Create booking
    const booking = new Booking({
      customer: req.user._id,
      room: roomId,
      checkIn,
      checkOut,
      status: "booked",
    });

    await booking.save();
    res.status(201).json({ message: "Room booked successfully", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create booking", error: error.message });
  }
});




// Get bookings of logged-in user
// Get bookings of logged-in user (only active)
// ✅ Get bookings of logged-in user (only active)
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({
      customer: req.user._id,
      status: { $in: ["booked", "checkedin"] }, // ✅ show only active
    }).populate("room");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
});



// Get all bookings (Staff only)
router.get("/", protect, staffOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("room")
      .populate("customer", "name email");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch all bookings",
      error: error.message,
    });
  }
});

// GET /api/bookings/room/:id  -> returns active bookings for that room
router.get("/room/:id", async (req, res) => {
  try {
    const bookings = await Booking.find({
      room: req.params.id,
      status: { $in: ["booked", "checkedin"] },
    }).populate("room customer", "name email"); // populate room + customer minimally

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings for room:", err);
    res.status(500).json({ message: "Failed to fetch bookings for room", error: err.message });
  }
});



// ✅ NEW: Checkout route
router.put("/:id/checkout", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only customer who booked it or staff can check out
    if (booking.customer.toString() !== req.user._id.toString() && req.user.role !== "staff") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    booking.status = "checkedout";
    booking.checkOut = new Date();
    await booking.save();

    if (booking.room) {
      booking.room.status = "available";
      await booking.room.save();
    }

    res.json({ message: "Checked out successfully" });
  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ message: "Checkout failed", error: error.message });
  }
});

// ✅ Delete a booking (staff only)
router.delete("/:id", protect, staffOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const room = await Room.findById(booking.room);
    if (room) {
      room.status = "available";
      await room.save();
    }

    await booking.deleteOne();
    res.json({ message: "Booking deleted and room made available" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Failed to delete booking" });
  }
});


export default router;
