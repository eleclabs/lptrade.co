"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addToCart,
  checkoutCart,
  clearCart,
  removeCartItem,
  updateCartItem,
} from "@/services/order-service";

export async function addToCartAction(formData: FormData) {
  await addToCart(formData);
  revalidatePath("/requester");
  revalidatePath("/cart");
}

export async function updateCartItemAction(formData: FormData) {
  await updateCartItem(formData);
  revalidatePath("/cart");
}

export async function removeCartItemAction(formData: FormData) {
  await removeCartItem(formData);
  revalidatePath("/cart");
}

export async function clearCartAction() {
  await clearCart();
  revalidatePath("/cart");
}

export async function checkoutCartAction(formData: FormData) {
  await checkoutCart(formData);
  revalidatePath("/cart");
  revalidatePath("/order");
  revalidatePath("/requester");
  redirect("/order");
}
