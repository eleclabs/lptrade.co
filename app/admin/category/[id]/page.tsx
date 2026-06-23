import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryEditForm from "@/components/CategoryEditForm";
import PageHeader from "@/components/PageHeader";
import { requireRole } from "@/services/auth-service";
import { getCategory } from "@/services/category-service";

type AdminCategoryEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminCategoryEditPage({
  params,
}: AdminCategoryEditPageProps) {
  const session = await requireRole(["admin"]);
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="page-shell">
      <PageHeader eyebrow="Admin" title="แก้ไขหมวดหมู่" badge={session.role} />
      <div className="mb-3">
        <Link href="/admin/category" className="btn btn-outline-secondary btn-sm">
          Back to Category
        </Link>
      </div>

      <div className="row g-4">
        <div className="col-sm-12 col-lg-6">
          <CategoryEditForm category={category} />
        </div>
      </div>
    </div>
  );
}
