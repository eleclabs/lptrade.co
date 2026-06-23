import mongoose, { Schema, models } from "mongoose";

const CategorySchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    level: { type: Number, min: 1, max: 2, default: 1 },
  },
  { timestamps: true },
);

export default models.Category || mongoose.model("Category", CategorySchema);
