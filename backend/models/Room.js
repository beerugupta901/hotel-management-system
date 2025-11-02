import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  price: { type: Number, required: true },
  description: { type: String },
  bookedDates:{ type : Date },
  status: { 
    type: String, 
    enum: ["available", "occupied", "under_service", "booked"], 
    default: "available" 
  },
}, { timestamps: true });

// Optional but helps with case-insensitive duplicates
roomSchema.index({ name: 1 }, { unique: true });

export default mongoose.model("Room", roomSchema);
