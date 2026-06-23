import "server-only";

import type { UploadApiResponse } from "cloudinary";
import sharp from "sharp";
import cloudinary from "@/lib/cloudinary";
import { MAX_PRODUCT_IMAGES } from "@/lib/product-constants";

const MAX_WIDTH = 1200;
const JPEG_QUALITY = 80;
export { MAX_PRODUCT_IMAGES };

export type UploadedImage = {
  url: string;
  publicId: string;
};

export async function compressImage(file: File): Promise<Buffer> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return sharp(buffer)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}

export async function uploadProductImage(file: File): Promise<UploadedImage> {
  const compressed = await compressImage(file);

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "lptrade/products",
          resource_type: "image",
        },
        (error, uploadResult) => {
          if (error) reject(error);
          else if (uploadResult) resolve(uploadResult);
          else reject(new Error("Cloudinary upload did not return a result"));
        },
      )
      .end(compressed);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function uploadProductImages(files: File[]) {
  const uploads = files.slice(0, MAX_PRODUCT_IMAGES).map((file, index) =>
    uploadProductImage(file).then((image) => ({
      ...image,
      order: index,
    })),
  );

  return Promise.all(uploads);
}

export async function deleteCloudinaryImages(publicIds: string[]) {
  await Promise.all(
    publicIds.map((publicId) => cloudinary.uploader.destroy(publicId)),
  );
}

export function imageFilesFromFormData(formData: FormData, fieldName: string) {
  return formData
    .getAll(fieldName)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}
