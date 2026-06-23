"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@/services/auth-service";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = await login(email, password);

  if (!result.ok) {
    redirect("/login?error=invalid");
  }

  redirect("/");
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}
