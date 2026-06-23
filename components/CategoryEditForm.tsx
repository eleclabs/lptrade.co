import { updateCategoryAction } from "@/actions/admin-actions";
import type { Category } from "@/lib/types";

type CategoryEditFormProps = {
  category: Category;
};

export default function CategoryEditForm({ category }: CategoryEditFormProps) {
  return (
    <form action={updateCategoryAction} className="form-panel">
      <input type="hidden" name="id" value={category.id} />

      <label htmlFor="code" className="form-label mb-0">
        รหัสหมวดหมู่
      </label>
      <input
        id="code"
        name="code"
        defaultValue={category.code}
        className="form-control"
        required
      />

      <label htmlFor="name" className="form-label mb-0">
        ชื่อหมวดหมู่
      </label>
      <input
        id="name"
        name="name"
        defaultValue={category.name}
        className="form-control"
        required
      />

      <button type="submit" className="btn btn-primary w-100">
        Save Category
      </button>
    </form>
  );
}
