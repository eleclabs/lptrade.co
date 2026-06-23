import mongoose, { Schema, models } from "mongoose";

const CostCenterSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    requesterEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    approverEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export default models.CostCenter ||
  mongoose.model("CostCenter", CostCenterSchema);
