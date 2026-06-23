import "server-only";

import bcrypt from "bcryptjs";
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
  role?: "Admin" | "Approver" | "Requester" | Role;
  active?: boolean;
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

export async function login(email: string, password: string) {
  await connectDB();

  const user = await User.findOne({
    email: email.trim(),
    active: { $ne: false },
  }).lean<DbUser | null>();

  if (!user || !(await verifyPassword(password, user.password))) {
    return { ok: false, message: "Invalid email or password" };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, user._id.toString(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return { ok: true, message: "Login success" };
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
