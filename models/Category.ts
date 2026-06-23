import mongoose, { Schema, models } from "mongoose";

const CategorySchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export default models.Category || mongoose.model("Category", CategorySchema);
