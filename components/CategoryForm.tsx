import { createCategoryAction } from "@/actions/admin-actions";

export default function CategoryForm() {
  return (
    <form action={createCategoryAction} className="form-panel">
      <h2>เพิ่มหมวดหมู่</h2>

      <label htmlFor="code" className="form-label mb-0">
        รหัสหมวดหมู่
      </label>
      <input id="code" name="code" className="form-control" required />

      <label htmlFor="name" className="form-label mb-0">
        ชื่อหมวดหมู่
      </label>
      <input id="name" name="name" className="form-control" required />

      <button type="submit" className="btn btn-success w-100">
        Save Category
      </button>
    </form>
  );
}
