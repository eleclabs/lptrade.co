import "server-only";

import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import {
  deleteCloudinaryImages,
  imageFilesFromFormData,
  MAX_PRODUCT_IMAGES,
  uploadProductImages,
} from "@/lib/image-upload";
import type { Product, ProductStatus } from "@/lib/types";
import ProductModel from "@/models/Product";
import CategoryModel from "@/models/Category";
import { requireRole } from "@/services/auth-service";

type DbCategoryRef = {
  _id: { toString(): string };
  name: string;
};

type DbProductImage = {
  url: string;
  publicId: string;
  order?: number;
};

type DbProduct = {
  _id: { toString(): string };
  sku: string;
  name: string;
  description?: string;
  category: DbCategoryRef | string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  unit?: string;
  brand?: string;
  weight?: number;
  tags?: string[];
  status?: ProductStatus;
  minOrderQty?: number;
  soldCount?: number;
  images?: DbProductImage[];
  createdAt?: Date;
  updatedAt?: Date;
};

function dateText(date?: Date) {
  return (date ?? new Date()).toISOString().slice(0, 10);
}

function categoryName(category: DbProduct["category"]) {
  if (typeof category === "string") {
    return "";
  }

  return category.name ?? "";
}

function categoryId(category: DbProduct["category"]) {
  if (typeof category === "string") {
    return category;
  }

  return category._id.toString();
}

function toProductDto(product: DbProduct): Product {
  const images = (product.images ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((image, index) => ({
      url: image.url,
      publicId: image.publicId,
      order: image.order ?? index,
    }));

  return {
    id: product._id.toString(),
    sku: product.sku,
    name: product.name,
    description: product.description ?? "",
    categoryId: categoryId(product.category),
    categoryName: categoryName(product.category),
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    unit: product.unit ?? "ชิ้น",
    brand: product.brand ?? "",
    weight: product.weight,
    tags: product.tags ?? [],
    status: product.status ?? "active",
    minOrderQty: product.minOrderQty ?? 1,
    soldCount: product.soldCount ?? 0,
    images,
    createdAt: dateText(product.createdAt),
    updatedAt: dateText(product.updatedAt),
  };
}

function parseTags(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseStatus(value: FormDataEntryValue | null): ProductStatus {
  if (value === "inactive" || value === "draft" || value === "active") {
    return value;
  }

  return "active";
}

function parseNumber(value: FormDataEntryValue | null, fallback?: number) {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return parsed;
}

function parseExistingImages(formData: FormData) {
  const raw = String(formData.get("existingImages") ?? "").trim();

  if (!raw) {
    return [] as DbProductImage[];
  }

  try {
    const parsed = JSON.parse(raw) as DbProductImage[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (image) =>
        typeof image.url === "string" &&
        typeof image.publicId === "string" &&
        image.url &&
        image.publicId,
    );
  } catch {
    return [];
  }
}

function generateSku() {
  return `SKU-${Date.now()}`;
}

async function validateCategoryId(categoryId: string) {
  if (!mongoose.isValidObjectId(categoryId)) {
    throw new Error("Category is invalid");
  }

  const category = await CategoryModel.findById(categoryId).lean();

  if (!category) {
    throw new Error("Category was not found");
  }
}

function readProductForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim() || generateSku();
  const price = parseNumber(formData.get("price"));
  const compareAtPrice = parseNumber(formData.get("compareAtPrice"));
  const stock = parseNumber(formData.get("stock"), 0);
  const unit = String(formData.get("unit") ?? "ชิ้น").trim() || "ชิ้น";
  const brand = String(formData.get("brand") ?? "").trim();
  const weight = parseNumber(formData.get("weight"));
  const minOrderQty = parseNumber(formData.get("minOrderQty"), 1);
  const status = parseStatus(formData.get("status"));
  const tags = parseTags(formData.get("tags"));

  if (!name || !categoryId || price === undefined || price < 0) {
    throw new Error("Product data is incomplete");
  }

  if (stock === undefined || stock < 0) {
    throw new Error("Stock must be zero or greater");
  }

  if (minOrderQty === undefined || minOrderQty < 1) {
    throw new Error("Minimum order quantity must be at least 1");
  }

  return {
    name,
    description,
    categoryId,
    sku,
    price,
    compareAtPrice:
      compareAtPrice !== undefined && compareAtPrice > 0
        ? compareAtPrice
        : undefined,
    stock,
    unit,
    brand,
    weight: weight !== undefined && weight > 0 ? weight : undefined,
    minOrderQty,
    status,
    tags,
  };
}

export async function listProducts(options?: { query?: string }) {
  await requireRole(["admin"]);
  await connectDB();

  const query = options?.query?.trim() ?? "";
  const filter = query
    ? {
        $or: [
          { sku: { $regex: query, $options: "i" } },
          { name: { $regex: query, $options: "i" } },
          { brand: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
      }
    : {};

  const products = await ProductModel.find(filter)
    .populate("category", "name")
    .sort({ updatedAt: -1 })
    .lean<DbProduct[]>();

  return products.map(toProductDto);
}

export async function listActiveProducts() {
  await requireRole(["admin", "requester"]);
  await connectDB();

  const products = await ProductModel.find({
    status: "active",
    stock: { $gt: 0 },
  })
    .populate("category", "name")
    .sort({ updatedAt: -1 })
    .lean<DbProduct[]>();

  return products.map(toProductDto);
}

export async function getProduct(id: string) {
  await requireRole(["admin"]);
  await connectDB();

  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  const product = await ProductModel.findById(id)
    .populate("category", "name")
    .lean<DbProduct | null>();

  if (!product) {
    return null;
  }

  return toProductDto(product);
}

export async function createProduct(formData: FormData) {
  await requireRole(["admin"]);
  await connectDB();

  const data = readProductForm(formData);
  await validateCategoryId(data.categoryId);

  const imageFiles = imageFilesFromFormData(formData, "images");

  if (imageFiles.length === 0) {
    throw new Error("At least one product image is required");
  }

  if (imageFiles.length > MAX_PRODUCT_IMAGES) {
    throw new Error(`You can upload up to ${MAX_PRODUCT_IMAGES} images`);
  }

  const uploadedImages = await uploadProductImages(imageFiles);

  await ProductModel.create({
    ...data,
    category: data.categoryId,
    images: uploadedImages,
  });
}

export async function updateProduct(formData: FormData) {
  await requireRole(["admin"]);
  await connectDB();

  const id = String(formData.get("id") ?? "");

  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Product id is invalid");
  }

  const existing = await ProductModel.findById(id).lean<DbProduct | null>();

  if (!existing) {
    throw new Error("Product was not found");
  }

  const data = readProductForm(formData);
  await validateCategoryId(data.categoryId);

  const keptImages = parseExistingImages(formData);
  const newImageFiles = imageFilesFromFormData(formData, "images");
  const totalImages = keptImages.length + newImageFiles.length;

  if (totalImages === 0) {
    throw new Error("At least one product image is required");
  }

  if (totalImages > MAX_PRODUCT_IMAGES) {
    throw new Error(`You can upload up to ${MAX_PRODUCT_IMAGES} images`);
  }

  const uploadedImages = await uploadProductImages(newImageFiles);
  const nextImages = [...keptImages, ...uploadedImages].map((image, index) => ({
    url: image.url,
    publicId: image.publicId,
    order: index,
  }));

  const removedPublicIds = (existing.images ?? [])
    .map((image) => image.publicId)
    .filter((publicId) => !keptImages.some((image) => image.publicId === publicId));

  if (removedPublicIds.length > 0) {
    await deleteCloudinaryImages(removedPublicIds);
  }

  await ProductModel.findByIdAndUpdate(
    id,
    {
      ...data,
      category: data.categoryId,
      images: nextImages,
    },
    { runValidators: true },
  );
}

export async function deleteProduct(formData: FormData) {
  await requireRole(["admin"]);
  await connectDB();

  const id = String(formData.get("id") ?? "");

  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Product id is invalid");
  }

  const product = await ProductModel.findById(id).lean<DbProduct | null>();

  if (!product) {
    throw new Error("Product was not found");
  }

  const publicIds = (product.images ?? []).map((image) => image.publicId);

  if (publicIds.length > 0) {
    await deleteCloudinaryImages(publicIds);
  }

  await ProductModel.findByIdAndDelete(id);
}
