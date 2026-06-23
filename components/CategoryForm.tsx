import { createCategoryAction } from "@/actions/admin-actions";
import type { Category } from "@/lib/types";

type CategoryFormProps = {
  parentCategories: Category[];
};

export default function CategoryForm({ parentCategories }: CategoryFormProps) {
  return (
    <div className="category-form-stack">
      <form action={createCategoryAction} className="form-panel">
        <h2>เพิ่มหมวดหมู่หลัก</h2>

        <label htmlFor="parent-name" className="form-label mb-0">
          ชื่อหมวดหมู่หลัก
        </label>
        <input id="parent-name" name="name" className="form-control" required />
        <p className="form-help">ระบบจะสุ่มรหัสหมวดหมู่ให้ สามารถแก้ไขทีหลังได้</p>

        <button type="submit" className="btn btn-success w-100">
          Save Main Category
        </button>
      </form>

      <form action={createCategoryAction} className="form-panel">
        <h2>เพิ่มหมวดหมู่ย่อย</h2>

        <label htmlFor="parentId" className="form-label mb-0">
          หมวดหมู่หลัก
        </label>
        {parentCategories.length > 0 ? (
          <select id="parentId" name="parentId" className="form-select" required>
            <option value="">เลือกหมวดหมู่หลัก</option>
            {parentCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.code})
              </option>
            ))}
          </select>
        ) : (
          <p className="empty-state mb-0">ไม่มี - กรุณาเพิ่มหมวดหมู่หลักก่อน</p>
        )}

        <label htmlFor="child-name" className="form-label mb-0">
          ชื่อหมวดหมู่ย่อย
        </label>
        <input
          id="child-name"
          name="name"
          className="form-control"
          disabled={parentCategories.length === 0}
          required
        />
        <p className="form-help">ระบบจะสุ่มรหัสจากหมวดหมู่หลักให้ สามารถแก้ไขทีหลังได้</p>

        <button
          type="submit"
          className="btn btn-success w-100"
          disabled={parentCategories.length === 0}
        >
          Save Sub Category
        </button>
      </form>
    </div>
  );
}
