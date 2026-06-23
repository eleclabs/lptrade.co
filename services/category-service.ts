import "server-only";

import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import type { Category } from "@/lib/types";
import CategoryModel from "@/models/Category";
import { requireRole } from "@/services/auth-service";

type DbCategory = {
  _id: { toString(): string };
  code: string;
  name: string;
  createdAt?: Date;
};

function dateText(date?: Date) {
  return (date ?? new Date()).toISOString().slice(0, 10);
}

function toCategoryDto(category: DbCategory): Category {
  return {
    id: category._id.toString(),
    code: category.code,
    name: category.name,
    createdAt: dateText(category.createdAt),
  };
}

export async function listCategories(options?: { query?: string }) {
  await requireRole(["admin"]);
  await connectDB();

  const query = options?.query?.trim() ?? "";
  const filter = query
    ? {
        $or: [
          { code: { $regex: query, $options: "i" } },
          { name: { $regex: query, $options: "i" } },
        ],
      }
    : {};

  const categories = await CategoryModel.find(filter)
    .sort({ code: 1 })
    .lean<DbCategory[]>();

  return categories.map(toCategoryDto);
}

export async function getCategory(id: string) {
  await requireRole(["admin"]);
  await connectDB();

  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  const category = await CategoryModel.findById(id).lean<DbCategory | null>();

  if (!category) {
    return null;
  }

  return toCategoryDto(category);
}

export async function createCategory(formData: FormData) {
  await requireRole(["admin"]);
  await connectDB();

  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!code || !name) {
    throw new Error("Category data is incomplete");
  }

  await CategoryModel.create({ code, name });
}

export async function updateCategory(formData: FormData) {
  await requireRole(["admin"]);
  await connectDB();

  const id = String(formData.get("id") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!mongoose.isValidObjectId(id) || !code || !name) {
    throw new Error("Category data is incomplete");
  }

  await CategoryModel.findByIdAndUpdate(
    id,
    { code, name },
    { runValidators: true },
  );
}

export async function deleteCategory(formData: FormData) {
  await requireRole(["admin"]);
  await connectDB();

  const id = String(formData.get("id") ?? "");

  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Category id is invalid");
  }

  await CategoryModel.findByIdAndDelete(id);
}
