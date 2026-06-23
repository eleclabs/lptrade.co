// src/models/User.ts
import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["Admin", "Approver", "Requester"],
      default: "Requester",
    },
    department: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);