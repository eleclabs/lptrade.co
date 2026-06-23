"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createPasswordReset,
  login,
  logout,
  register,
  resetPassword,
  updateProfile,
} from "@/services/auth-service";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = await login(email, password);

  if (!result.ok) {
    redirect("/login?error=invalid");
  }

  redirect("/");
}

export async function registerAction(formData: FormData) {
  const result = await register(formData);

  if (!result.ok) {
    redirect("/register?error=invalid");
  }

  redirect("/");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const result = await createPasswordReset(email);
  const params = new URLSearchParams({ sent: "1" });

  if (result.token) {
    params.set("token", result.token);
  }

  redirect(`/forgot-password?${params}`);
}

export async function resetPasswordAction(formData: FormData) {
  const result = await resetPassword(formData);

  if (!result.ok) {
    const token = String(formData.get("token") ?? "");
    const params = new URLSearchParams({ error: "invalid" });

    if (token) {
      params.set("token", token);
    }

    redirect(`/reset-password?${params}`);
  }

  redirect("/");
}

export async function updateProfileAction(formData: FormData) {
  const result = await updateProfile(formData);

  if (!result.ok) {
    redirect("/profile?error=invalid");
  }

  revalidatePath("/profile");
  redirect("/profile?updated=1");
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}
