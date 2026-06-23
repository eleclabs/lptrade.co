import AdminSearchToolbar from "@/components/AdminSearchToolbar";
import CategoryForm from "@/components/CategoryForm";
import CategoryTable from "@/components/CategoryTable";
import { requireRole } from "@/services/auth-service";
import { listCategories } from "@/services/category-service";

function queryFromValue(value?: string | string[]) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function AdminCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const query = queryFromValue(params.q);
  const categories = await listCategories({ query });

  return (
    <div className="page-shell">
      <div className="row g-2">
        <div className="col-sm-4">
          <CategoryForm />
        </div>
        <div className="col-sm-8">
          <section className="content-panel">
            <h2>รายการหมวดหมู่</h2>
            <AdminSearchToolbar
              action="/admin/category"
              placeholder="ค้นหารหัสหรือชื่อหมวดหมู่"
              query={query}
            />
            <CategoryTable categories={categories} />
          </section>
        </div>
      </div>
    </div>
  );
}
