import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryEditForm from "@/components/CategoryEditForm";
import { requireRole } from "@/services/auth-service";
import {
  getCategory,
  listParentCategories,
} from "@/services/category-service";

type AdminCategoryEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCategoryEditPage({
  params,
}: AdminCategoryEditPageProps) {
  await requireRole(["admin"]);
  const { id } = await params;
  const [category, parentCategories] = await Promise.all([
    getCategory(id),
    listParentCategories(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="page-shell">
      <div className="mb-3">
        <Link href="/admin/category" className="btn btn-outline-secondary btn-sm">
          Back to Category
        </Link>
      </div>

      <div className="row g-4">
        <div className="col-sm-12 col-lg-6">
          <CategoryEditForm
            category={category}
            parentCategories={parentCategories}
          />
        </div>
      </div>
    </div>
  );
}
