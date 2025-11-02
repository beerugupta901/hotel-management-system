import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  checkIn: Date,
  checkOut: Date,
  status: {
    type: String,
    enum: ["booked", "cancelled", "checkedout","ended"], // ✅ added 'checkedout'
    default: "booked",
  },
});

export default mongoose.model("Booking", bookingSchema);
