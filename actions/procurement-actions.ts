"use server";

import { revalidatePath } from "next/cache";
import {
  approveRequest,
  createRequest,
  rejectRequest,
} from "@/services/eprocurement-service";

export async function createRequestAction(formData: FormData) {
  await createRequest(formData);
  revalidatePath("/");
  revalidatePath("/requester");
}

export async function approveRequestAction(formData: FormData) {
  await approveRequest(formData);
  revalidatePath("/");
  revalidatePath("/approver");
}

export async function rejectRequestAction(formData: FormData) {
  await rejectRequest(formData);
  revalidatePath("/");
  revalidatePath("/approver");
}
