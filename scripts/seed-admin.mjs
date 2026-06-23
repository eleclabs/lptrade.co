import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const envPath = resolve(process.cwd(), ".env");

if (existsSync(envPath)) {
  const envText = readFileSync(envPath, "utf8");

  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const [key, ...valueParts] = trimmed.split("=");

    if (key && !process.env[key]) {
      process.env[key] = valueParts.join("=");
    }
  }
}

const mongoUri = process.env.MONGODB_URI;
const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@lptrade.co";
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";

if (!mongoUri) {
  throw new Error("Missing MONGODB_URI");
}

const userSchema = new mongoose.Schema(
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
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

await mongoose.connect(mongoUri);

const password = await bcrypt.hash(adminPassword, 10);
const user = await User.findOneAndUpdate(
  { email: adminEmail },
  {
    $set: {
      name: "Admin User",
      email: adminEmail,
      password,
      role: "Admin",
      active: true,
    },
  },
  { returnDocument: "after", upsert: true },
);

await mongoose.disconnect();

console.log(`Seeded admin user: ${user.email}`);
