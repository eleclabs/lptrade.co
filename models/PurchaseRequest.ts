// src/models/PurchaseRequest.ts
import mongoose, { Schema, models } from "mongoose";

const ItemSchema = new Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, default: 0 },
  imageUrl: String,
  imagePublicId: String,
});

const PurchaseRequestSchema = new Schema(
  {
    requestNo: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    department: String,
    reason: String,

    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    approver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "PURCHASED", "CANCELLED"],
      default: "DRAFT",
    },

    items: [ItemSchema],

    totalAmount: { type: Number, default: 0 },

    approvedAt: Date,
    rejectedReason: String,
  },
  { timestamps: true }
);

export default models.PurchaseRequest ||
  mongoose.model("PurchaseRequest", PurchaseRequestSchema);
