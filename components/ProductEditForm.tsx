import { updateProductAction } from "@/actions/admin-actions";
import ProductExistingImages from "@/components/ProductExistingImages";
import ProductFormFields from "@/components/ProductFormFields";
import type { Category, Product } from "@/lib/types";

type CategoryOption = Pick<Category, "id" | "name" | "code" | "displayName">;

type ProductEditFormProps = {
  product: Product;
  categories: CategoryOption[];
};

export default function ProductEditForm({
  product,
  categories,
}: ProductEditFormProps) {
  return (
    <form action={updateProductAction} encType="multipart/form-data" className="form-panel">
      <input type="hidden" name="id" value={product.id} />

      <ProductFormFields categories={categories} product={product} />
      <ProductExistingImages images={product.images} />

      <button type="submit" className="btn btn-primary w-100">
        Save Product
      </button>
    </form>
  );
}
