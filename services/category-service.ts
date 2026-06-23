import "server-only";

import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import type { Category } from "@/lib/types";
import CategoryModel from "@/models/Category";
import ProductModel from "@/models/Product";
import { requireRole } from "@/services/auth-service";

type DbCategoryRef = {
  _id: { toString(): string };
  code: string;
  name: string;
  level?: number;
};

type DbCategory = DbCategoryRef & {
  parent?: DbCategoryRef | string | null;
  childCount?: number;
  createdAt?: Date;
};

function dateText(date?: Date) {
  return (date ?? new Date()).toISOString().slice(0, 10);
}

function parentRef(parent?: DbCategory["parent"]) {
  if (!parent || typeof parent === "string") {
    return null;
  }

  return parent;
}

function categoryLevel(category: DbCategory) {
  return category.level ?? (category.parent ? 2 : 1);
}

function toCategoryDto(category: DbCategory): Category {
  const parent = parentRef(category.parent);
  const level = categoryLevel(category);

  return {
    id: category._id.toString(),
    code: category.code,
    name: category.name,
    parentId: parent?._id.toString(),
    parentCode: parent?.code,
    parentName: parent?.name,
    level,
    childCount: category.childCount ?? 0,
    displayName: parent ? `${parent.name} / ${category.name}` : category.name,
    createdAt: dateText(category.createdAt),
  };
}

function categoryFilter(query: string) {
  return query
    ? {
        $or: [
          { code: { $regex: query, $options: "i" } },
          { name: { $regex: query, $options: "i" } },
        ],
      }
    : {};
}

async function generateCategoryCode(parent?: DbCategory | null) {
  const prefix = parent ? `${parent.code}-` : "CAT-";
  const count = await CategoryModel.countDocuments(
    parent ? { parent: parent._id } : { $or: [{ parent: null }, { parent: { $exists: false } }, { level: 1 }] },
  );
  const nextNumber = count + 1;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = `${prefix}${String(nextNumber + attempt).padStart(3, "0")}`;
    const existing = await CategoryModel.exists({ code });

    if (!existing) {
      return code;
    }
  }

  return `${prefix}${Date.now()}`;
}

export async function listCategories(options?: { query?: string }) {
  await requireRole(["admin"]);
  await connectDB();

  const query = options?.query?.trim() ?? "";
  const categories = await CategoryModel.find(categoryFilter(query))
    .populate("parent", "code name level")
    .sort({ level: 1, code: 1 })
    .lean<DbCategory[]>();

  const childCounts = await CategoryModel.aggregate<{
    _id: { toString(): string };
    count: number;
  }>([
    { $match: { parent: { $ne: null } } },
    { $group: { _id: "$parent", count: { $sum: 1 } } },
  ]);
  const countByParentId = new Map(
    childCounts.map((item) => [item._id.toString(), item.count]),
  );

  return categories.map((category) =>
    toCategoryDto({
      ...category,
      childCount: countByParentId.get(category._id.toString()) ?? 0,
    }),
  );
}

export async function listParentCategories() {
  await requireRole(["admin"]);
  await connectDB();

  const categories = await CategoryModel.find({
    $or: [{ parent: null }, { parent: { $exists: false } }, { level: 1 }],
  })
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

  const category = await CategoryModel.findById(id)
    .populate("parent", "code name level")
    .lean<DbCategory | null>();

  if (!category) {
    return null;
  }

  return toCategoryDto(category);
}

async function readParent(parentId: string, currentId?: string) {
  if (!parentId) {
    return null;
  }

  if (!mongoose.isValidObjectId(parentId) || parentId === currentId) {
    throw new Error("Parent category is invalid");
  }

  const parent = await CategoryModel.findById(parentId).lean<DbCategory | null>();

  if (!parent || categoryLevel(parent) !== 1) {
    throw new Error("Parent category must be a first-level category");
  }

  return parent;
}

export async function createCategory(formData: FormData) {
  await requireRole(["admin"]);
  await connectDB();

  const name = String(formData.get("name") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "").trim();
  const parent = await readParent(parentId);

  if (!name) {
    throw new Error("Category data is incomplete");
  }

  await CategoryModel.create({
    code: await generateCategoryCode(parent),
    name,
    parent: parent?._id,
    level: parent ? 2 : 1,
  });
}

export async function updateCategory(formData: FormData) {
  await requireRole(["admin"]);
  await connectDB();

  const id = String(formData.get("id") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "").trim();

  if (!mongoose.isValidObjectId(id) || !code || !name) {
    throw new Error("Category data is incomplete");
  }

  const parent = await readParent(parentId, id);
  const childCount = await CategoryModel.countDocuments({ parent: id });

  if (parent && childCount > 0) {
    throw new Error("Category with child categories cannot become a child");
  }

  await CategoryModel.findByIdAndUpdate(
    id,
    {
      code,
      name,
      parent: parent?._id ?? null,
      level: parent ? 2 : 1,
    },
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

  const [childCount, productCount] = await Promise.all([
    CategoryModel.countDocuments({ parent: id }),
    ProductModel.countDocuments({ category: id }),
  ]);

  if (childCount > 0 || productCount > 0) {
    throw new Error("Category is in use");
  }

  await CategoryModel.findByIdAndDelete(id);
}
