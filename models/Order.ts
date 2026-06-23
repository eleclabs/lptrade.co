import mongoose, { Schema, models } from "mongoose";

const OrderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "" },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    orderNo: { type: String, required: true, unique: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "CANCELLED"],
      default: "PENDING",
    },
    items: {
      type: [OrderItemSchema],
      default: [],
    },
    totalAmount: { type: Number, required: true, min: 0 },
    note: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

export default models.Order || mongoose.model("Order", OrderSchema);
