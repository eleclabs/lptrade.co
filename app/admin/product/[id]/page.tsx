import Link from "next/link";
import { notFound } from "next/navigation";
import ProductEditForm from "@/components/ProductEditForm";
import PageHeader from "@/components/PageHeader";
import { requireRole } from "@/services/auth-service";
import { listCategories } from "@/services/category-service";
import { getProduct } from "@/services/product-service";

type AdminProductEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminProductEditPage({
  params,
}: AdminProductEditPageProps) {
  const session = await requireRole(["admin"]);
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(id),
    listCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="page-shell">
      <PageHeader eyebrow="Admin" title="แก้ไขสินค้า" badge={session.role} />
      <div className="mb-3">
        <Link href="/admin/product" className="btn btn-outline-secondary btn-sm">
          Back to Product
        </Link>
      </div>

      <div className="row g-4">
        <div className="col-sm-12 col-lg-8">
          <ProductEditForm product={product} categories={categories} />
        </div>
      </div>
    </div>
  );
}
