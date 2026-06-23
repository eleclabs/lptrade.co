"use server";

import type { UploadApiResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/mongodb";
import PurchaseRequest from "@/models/PurchaseRequest";

export async function uploadToCloudinary(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "eprocurement",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error("Cloudinary upload did not return a result"));
        },
      )
      .end(buffer);
  });
}

export async function createPurchaseRequest(formData: FormData) {
  await connectDB();

  const title = String(formData.get("title") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const requester = String(formData.get("requester") ?? "").trim();

  if (!title || !requester) {
    throw new Error("Missing required purchase request fields");
  }

  const requestNo = `PR-${Date.now()}`;

  await PurchaseRequest.create({
    requestNo,
    title,
    reason,
    requester,
    status: "SUBMITTED",
  });
}
