import mongoose, { Schema, models } from "mongoose";

const ProductImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const ProductSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, default: "ชิ้น", trim: true },
    brand: { type: String, default: "", trim: true },
    weight: { type: Number, min: 0 },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    minOrderQty: { type: Number, min: 1, default: 1 },
    soldCount: { type: Number, min: 0, default: 0 },
    images: {
      type: [ProductImageSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export default models.Product || mongoose.model("Product", ProductSchema);
