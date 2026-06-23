import type { Category, Product, ProductStatus } from "@/lib/types";

type CategoryOption = Pick<Category, "id" | "name" | "code">;

const statuses: Array<{ value: ProductStatus; label: string }> = [
  { value: "active", label: "วางขาย" },
  { value: "inactive", label: "ปิดการขาย" },
  { value: "draft", label: "ฉบับร่าง" },
];

type ProductFormFieldsProps = {
  categories: CategoryOption[];
  product?: Product;
};

export default function ProductFormFields({
  categories,
  product,
}: ProductFormFieldsProps) {
  return (
    <>
      <label htmlFor="name" className="form-label mb-0">
        ชื่อสินค้า
      </label>
      <input
        id="name"
        name="name"
        defaultValue={product?.name}
        className="form-control"
        required
      />

      <label htmlFor="sku" className="form-label mb-0">
        รหัสสินค้า (SKU)
      </label>
      <input
        id="sku"
        name="sku"
        defaultValue={product?.sku}
        className="form-control"
        placeholder="เว้นว่างเพื่อสร้างอัตโนมัติ"
      />

      <label htmlFor="categoryId" className="form-label mb-0">
        หมวดหมู่
      </label>
      <select
        id="categoryId"
        name="categoryId"
        defaultValue={product?.categoryId}
        className="form-select"
        required
      >
        <option value="">เลือกหมวดหมู่</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name} ({category.code})
          </option>
        ))}
      </select>

      <label htmlFor="description" className="form-label mb-0">
        รายละเอียดสินค้า
      </label>
      <textarea
        id="description"
        name="description"
        defaultValue={product?.description}
        className="form-control"
        rows={5}
        placeholder="อธิบายคุณสมบัติ ขนาด วิธีใช้ หรือรายละเอียดอื่น ๆ"
      />

      <div className="row g-3">
        <div className="col-md-6">
          <label htmlFor="price" className="form-label mb-0">
            ราคาขาย (บาท)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.price}
            className="form-control"
            required
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="compareAtPrice" className="form-label mb-0">
            ราคาก่อนลด (บาท)
          </label>
          <input
            id="compareAtPrice"
            name="compareAtPrice"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.compareAtPrice}
            className="form-control"
            placeholder="ไม่บังคับ"
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <label htmlFor="stock" className="form-label mb-0">
            จำนวนในคลัง
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.stock ?? 0}
            className="form-control"
            required
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="unit" className="form-label mb-0">
            หน่วย
          </label>
          <input
            id="unit"
            name="unit"
            defaultValue={product?.unit ?? "ชิ้น"}
            className="form-control"
            required
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="minOrderQty" className="form-label mb-0">
            สั่งซื้อขั้นต่ำ
          </label>
          <input
            id="minOrderQty"
            name="minOrderQty"
            type="number"
            min="1"
            step="1"
            defaultValue={product?.minOrderQty ?? 1}
            className="form-control"
            required
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label htmlFor="brand" className="form-label mb-0">
            แบรนด์
          </label>
          <input
            id="brand"
            name="brand"
            defaultValue={product?.brand}
            className="form-control"
            placeholder="ไม่บังคับ"
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="weight" className="form-label mb-0">
            น้ำหนัก (กรัม)
          </label>
          <input
            id="weight"
            name="weight"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.weight}
            className="form-control"
            placeholder="ไม่บังคับ"
          />
        </div>
      </div>

      <label htmlFor="tags" className="form-label mb-0">
        แท็ก
      </label>
      <input
        id="tags"
        name="tags"
        defaultValue={product?.tags.join(", ")}
        className="form-control"
        placeholder="เช่น ของใช้สำนักงาน, สินค้าขายดี"
      />
      <p className="form-help">คั่นแต่ละแท็กด้วยเครื่องหมายจุลภาค (,)</p>

      <label htmlFor="status" className="form-label mb-0">
        สถานะ
      </label>
      <select
        id="status"
        name="status"
        defaultValue={product?.status ?? "active"}
        className="form-select"
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </>
  );
}
