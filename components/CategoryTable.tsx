import Link from "next/link";
import { deleteCategoryAction } from "@/actions/admin-actions";
import type { Category } from "@/lib/types";

type CategoryTableProps = {
  categories: Category[];
};

export default function CategoryTable({ categories }: CategoryTableProps) {
  if (categories.length === 0) {
    return <p className="empty-state">ยังไม่มีหมวดหมู่</p>;
  }

  return (
    <table className="table table-hover align-middle">
      <thead>
        <tr>
          <th>รหัสหมวดหมู่</th>
          <th>ชื่อหมวดหมู่</th>
          <th>วันที่สร้าง</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category) => {
          const deleteFormId = `delete-category-${category.id}`;

          return (
            <tr key={category.id}>
              <td>{category.code}</td>
              <td>{category.name}</td>
              <td>{category.createdAt}</td>
              <td>
                <form id={deleteFormId} action={deleteCategoryAction}>
                  <input type="hidden" name="id" value={category.id} />
                </form>
                <div className="table-actions">
                  <Link
                    href={`/admin/category/${category.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Edit
                  </Link>
                  <button
                    type="submit"
                    form={deleteFormId}
                    className="btn btn-outline-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
