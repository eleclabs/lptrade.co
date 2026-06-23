"use client";

import { useEffect, useState } from "react";
import { MAX_PRODUCT_IMAGES } from "@/lib/product-constants";
import type { ProductImage } from "@/lib/types";

type ProductImageInputProps = {
  name?: string;
  required?: boolean;
  maxFiles?: number;
};

export default function ProductImageInput({
  name = "images",
  required = true,
  maxFiles = MAX_PRODUCT_IMAGES,
}: ProductImageInputProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, maxFiles);

    setPreviews((current) => {
      current.forEach((preview) => URL.revokeObjectURL(preview));
      return files.map((file) => URL.createObjectURL(file));
    });
  }

  return (
    <div className="product-image-field">
      <label htmlFor={name} className="form-label mb-0">
        รูปภาพสินค้า
      </label>
      <input
        id={name}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        required={required}
        className="form-control"
        onChange={onChange}
      />
      <p className="form-help">
        อัปโหลดได้สูงสุด {maxFiles} รูป ระบบจะบีบอัดรูปให้เล็กลงก่อนอัปโหลด Cloudinary
      </p>
      {previews.length > 0 ? (
        <div className="product-image-preview-grid">
          {previews.map((preview, index) => (
            <img key={preview} src={preview} alt={`ตัวอย่างรูปที่ ${index + 1}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
