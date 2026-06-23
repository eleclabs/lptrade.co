import { createProductAction } from "@/actions/admin-actions";
import ProductFormFields from "@/components/ProductFormFields";
import ProductImageInput from "@/components/ProductImageInput";
import type { Category } from "@/lib/types";

type CategoryOption = Pick<Category, "id" | "name" | "code" | "displayName">;

type ProductFormProps = {
  categories: CategoryOption[];
};

export default function ProductForm({ categories }: ProductFormProps) {
  return (
    <form action={createProductAction} encType="multipart/form-data" className="form-panel">
      <h2>เพิ่มสินค้า</h2>

      <ProductFormFields categories={categories} />
      <ProductImageInput required />

      <button type="submit" className="btn btn-success w-100">
        Save Product
      </button>
    </form>
  );
}
