import "server-only";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import type { Role } from "@/lib/types";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireRole, requireSession } from "@/services/auth-service";

type DbUser = {
  _id: { toString(): string };
  name?: string;
  email: string;
  role?: "Admin" | "Approver" | "Requester" | Role;
};

function normalizeRole(role?: DbUser["role"]): Role {
  if (role === "Admin" || role === "admin") return "admin";
  if (role === "Approver" || role === "approver") return "approver";
  return "requester";
}

function dbRole(role: Role) {
  if (role === "admin") return "Admin";
  if (role === "approver") return "Approver";
  return "Requester";
}

function formRole(value: FormDataEntryValue | null): Role {
  if (value === "admin" || value === "approver" || value === "requester") {
    return value;
  }

  return "requester";
}

export async function listUsers() {
  await requireRole(["admin"]);
  await connectDB();

  const users = await User.find({}).sort({ name: 1 }).lean<DbUser[]>();

  return users.map((user) => ({
    id: user._id.toString(),
    name: user.name ?? user.email,
    email: user.email,
    role: normalizeRole(user.role),
  }));
}

export async function listUsersForAdmin(options?: {
  role?: Role | "all";
  query?: string;
}) {
  await requireRole(["admin"]);
  await connectDB();

  const role = options?.role ?? "all";
  const query = options?.query?.trim() ?? "";
  const filter: Record<string, unknown> = {};

  if (role !== "all") {
    filter.role = dbRole(role);
  }

  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ];
  }

  const users = await User.find(filter).sort({ name: 1 }).lean<DbUser[]>();

  return users.map((user) => ({
    id: user._id.toString(),
    name: user.name ?? user.email,
    email: user.email,
    role: normalizeRole(user.role),
  }));
}

export async function listUsersByRole(role: Role) {
  await requireRole(["admin"]);
  await connectDB();

  const users = await User.find({ role: dbRole(role) })
    .sort({ name: 1 })
    .lean<DbUser[]>();

  return users.map((user) => ({
    id: user._id.toString(),
    name: user.name ?? user.email,
    email: user.email,
    role: normalizeRole(user.role),
  }));
}

export async function createUser(formData: FormData) {
  await requireRole(["admin"]);
  await connectDB();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = formRole(formData.get("role"));

  if (!name || !email || !password) {
    throw new Error("User data is incomplete");
  }

  await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: dbRole(role),
    active: true,
  });
}

export async function updateUser(formData: FormData) {
  await requireRole(["admin"]);
  await connectDB();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = formRole(formData.get("role"));

  if (!mongoose.isValidObjectId(id) || !name || !email) {
    throw new Error("User data is incomplete");
  }

  const update: {
    name: string;
    email: string;
    role: string;
    password?: string;
  } = {
    name,
    email,
    role: dbRole(role),
  };

  if (password) {
    update.password = await bcrypt.hash(password, 10);
  }

  await User.findByIdAndUpdate(id, update, { runValidators: true });
}

export async function deleteUser(formData: FormData) {
  const session = await requireSession();
  await requireRole(["admin"]);
  await connectDB();

  const id = String(formData.get("id") ?? "");

  if (!mongoose.isValidObjectId(id)) {
    throw new Error("User id is invalid");
  }

  if (id === session.id) {
    throw new Error("Cannot delete your own user");
  }

  await User.findByIdAndDelete(id);
}
