import Link from "next/link";
import ProductForm from "@/components/ProductForm";
import PageHeader from "@/components/PageHeader";
import { requireRole } from "@/services/auth-service";
import { listCategories } from "@/services/category-service";

export default async function AdminProductNewPage() {
  const session = await requireRole(["admin"]);
  const categories = await listCategories();

  return (
    <div className="page-shell">
      <PageHeader eyebrow="Admin" title="เพิ่มสินค้า" badge={session.role} />
      <div className="mb-3">
        <Link href="/admin/product" className="btn btn-outline-secondary btn-sm">
          Back to Product
        </Link>
      </div>

      <div className="row g-4">
        <div className="col-sm-12 col-lg-8">
          <ProductForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
