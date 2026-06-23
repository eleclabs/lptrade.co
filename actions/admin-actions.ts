"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/services/category-service";
import {
  createCostCenter,
  deleteCostCenter,
  updateCostCenter,
} from "@/services/eprocurement-service";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/services/product-service";
import {
  createUser,
  deleteUser,
  updateUser,
} from "@/services/user-service";

export async function createCategoryAction(formData: FormData) {
  await createCategory(formData);
  revalidatePath("/admin/category");
}

export async function updateCategoryAction(formData: FormData) {
  await updateCategory(formData);
  revalidatePath("/admin/category");
}

export async function deleteCategoryAction(formData: FormData) {
  await deleteCategory(formData);
  revalidatePath("/admin/category");
}

export async function createCostCenterAction(formData: FormData) {
  await createCostCenter(formData);
  revalidatePath("/admin/costcenter");
}

export async function updateCostCenterAction(formData: FormData) {
  await updateCostCenter(formData);
  revalidatePath("/admin/costcenter");
}

export async function deleteCostCenterAction(formData: FormData) {
  await deleteCostCenter(formData);
  revalidatePath("/admin/costcenter");
}

export async function createProductAction(formData: FormData) {
  await createProduct(formData);
  revalidatePath("/admin/product");
  redirect("/admin/product");
}

export async function updateProductAction(formData: FormData) {
  await updateProduct(formData);
  revalidatePath("/admin/product");
  redirect("/admin/product");
}

export async function deleteProductAction(formData: FormData) {
  await deleteProduct(formData);
  revalidatePath("/admin/product");
}

export async function createUserAction(formData: FormData) {
  await createUser(formData);
  revalidatePath("/admin");
}

export async function updateUserAction(formData: FormData) {
  await updateUser(formData);
  revalidatePath("/admin");
}

export async function deleteUserAction(formData: FormData) {
  await deleteUser(formData);
  revalidatePath("/admin");
}
