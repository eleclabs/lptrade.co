import "server-only";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { connectDB } from "@/lib/mongodb";
import type { Role, SessionUser } from "@/lib/types";
import User from "@/models/User";

const SESSION_COOKIE = "lptrade_session";

const menuItems = [
  { label: "หน้าหลัก", href: "/", roles: ["admin", "approver", "requester"] },
  { label: "ขอซื้อ", href: "/requester", roles: ["requester"] },
  { label: "Cart", href: "/cart", roles: ["requester"] },
  { label: "Order", href: "/order", roles: ["requester"] },
  { label: "อนุมัติ", href: "/approver", roles: ["approver"] },
] satisfies Array<{ label: string; href: string; roles: Role[] }>;

const adminMenuItems = [
  { label: "ภาพรวม", href: "/admin/dashboard" },
  { label: "ศูนย์ทุน", href: "/admin/costcenter" },
  { label: "ผู้ใช้", href: "/admin/user" },
  { label: "หมวดหมู่", href: "/admin/category" },
  { label: "สินค้า", href: "/admin/product" },
  { label: "Order", href: "/order" },
];

type DbUser = {
  _id: { toString(): string };
  name?: string;
  email: string;
  password?: string;
  phone?: string;
  role?: "Admin" | "Approver" | "Requester" | Role;
  active?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
};

function normalizeRole(role?: DbUser["role"]): Role {
  if (role === "Admin" || role === "admin") return "admin";
  if (role === "Approver" || role === "approver") return "approver";
  return "requester";
}

function toSessionUser(user: DbUser): SessionUser {
  return {
    id: user._id.toString(),
    name: user.name ?? user.email,
    email: user.email,
    role: normalizeRole(user.role),
  };
}

async function verifyPassword(inputPassword: string, storedPassword?: string) {
  if (!storedPassword) {
    return false;
  }

  if (storedPassword === inputPassword) {
    return true;
  }

  return bcrypt.compare(inputPassword, storedPassword);
}

function dbRole(role: Role) {
  if (role === "admin") return "Admin";
  if (role === "approver") return "Approver";
  return "Requester";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function passwordIsValid(password: string) {
  return password.length >= 6;
}

async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function login(email: string, password: string) {
  await connectDB();

  const user = await User.findOne({
    email: normalizeEmail(email),
    active: { $ne: false },
  }).lean<DbUser | null>();

  if (!user || !(await verifyPassword(password, user.password))) {
    return { ok: false, message: "Invalid email or password" };
  }

  await setSessionCookie(user._id.toString());

  return { ok: true, message: "Login success" };
}

export async function register(formData: FormData) {
  await connectDB();

  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || !email || !passwordIsValid(password) || password !== confirmPassword) {
    return { ok: false, message: "Register data is invalid" };
  }

  const existing = await User.findOne({ email }).lean<DbUser | null>();

  if (existing) {
    return { ok: false, message: "Email is already registered" };
  }

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    phone,
    role: dbRole("requester"),
    active: true,
  });

  await setSessionCookie(user._id.toString());

  return { ok: true, message: "Register success" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!userId) {
    return null;
  }

  if (!mongoose.isValidObjectId(userId)) {
    return null;
  }

  await connectDB();

  const user = await User.findById(userId).lean<DbUser | null>();

  if (!user || user.active === false) {
    return null;
  }

  return toSessionUser(user);
});

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(roles: Role[]) {
  const session = await requireSession();

  if (!roles.includes(session.role)) {
    redirect("/");
  }

  return session;
}

export async function getProfile() {
  const session = await requireSession();
  await connectDB();

  const user = await User.findById(session.id).lean<DbUser | null>();

  if (!user || user.active === false) {
    redirect("/login");
  }

  return {
    id: user._id.toString(),
    name: user.name ?? user.email,
    email: user.email,
    phone: user.phone ?? "",
    role: normalizeRole(user.role),
  };
}

export async function updateProfile(formData: FormData) {
  const session = await requireSession();
  await connectDB();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name) {
    return { ok: false, message: "Name is required" };
  }

  const user = await User.findById(session.id);

  if (!user || user.active === false) {
    return { ok: false, message: "User was not found" };
  }

  user.name = name;
  user.phone = phone;

  if (currentPassword || newPassword || confirmPassword) {
    if (
      !passwordIsValid(newPassword) ||
      newPassword !== confirmPassword ||
      !(await verifyPassword(currentPassword, user.password))
    ) {
      return { ok: false, message: "Password data is invalid" };
    }

    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();

  return { ok: true, message: "Profile updated" };
}

export async function createPasswordReset(emailInput: string) {
  await connectDB();

  const email = normalizeEmail(emailInput);
  const user = await User.findOne({
    email,
    active: { $ne: false },
  });

  if (!user) {
    return {
      ok: true,
      token: "",
      message: "If the email exists, a reset link was created",
    };
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();

  return {
    ok: true,
    token,
    message: "Password reset link was created",
  };
}

export async function resetPassword(formData: FormData) {
  await connectDB();

  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token || !passwordIsValid(password) || password !== confirmPassword) {
    return { ok: false, message: "Password reset data is invalid" };
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
    active: { $ne: false },
  });

  if (!user) {
    return { ok: false, message: "Reset link is invalid or expired" };
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  await setSessionCookie(user._id.toString());

  return { ok: true, message: "Password reset success" };
}

export function getMenuByRole(role?: Role) {
  if (!role) {
    return [];
  }

  return menuItems.filter((item) => item.roles.includes(role));
}

export function getAdminMenuByRole(role?: Role) {
  if (role !== "admin") {
    return [];
  }

  return adminMenuItems;
}

export function getRoleHomePath(role: Role) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "approver") return "/approver";
  return "/requester";
}
