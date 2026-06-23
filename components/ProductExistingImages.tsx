"use client";

import { useState } from "react";
import { MAX_PRODUCT_IMAGES } from "@/lib/product-constants";
import type { ProductImage } from "@/lib/types";

type ProductExistingImagesProps = {
  images: ProductImage[];
};

export default function ProductExistingImages({
  images,
}: ProductExistingImagesProps) {
  const [keptImages, setKeptImages] = useState(images);
  const remainingSlots = MAX_PRODUCT_IMAGES - keptImages.length;

  function removeImage(publicId: string) {
    setKeptImages((current) =>
      current.filter((image) => image.publicId !== publicId),
    );
  }

  return (
    <div className="product-image-field">
      <input
        type="hidden"
        name="existingImages"
        value={JSON.stringify(keptImages)}
      />

      <label className="form-label mb-0">รูปภาพปัจจุบัน</label>
      {keptImages.length === 0 ? (
        <p className="form-help">ยังไม่มีรูปภาพที่เก็บไว้ กรุณาอัปโหลดรูปใหม่</p>
      ) : (
        <div className="product-image-preview-grid">
          {keptImages.map((image, index) => (
            <div key={image.publicId} className="product-image-card">
              <img src={image.url} alt={`รูปสินค้า ${index + 1}`} />
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => removeImage(image.publicId)}
              >
                ลบ
              </button>
            </div>
          ))}
        </div>
      )}

      <label htmlFor="images" className="form-label mb-0 mt-2">
        เพิ่มรูปภาพใหม่
      </label>
      <input
        id="images"
        name="images"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="form-control"
        disabled={remainingSlots <= 0}
      />
      <p className="form-help">
        เพิ่มได้อีก {remainingSlots} รูป (รวมไม่เกิน {MAX_PRODUCT_IMAGES} รูป)
      </p>
    </div>
  );
}
