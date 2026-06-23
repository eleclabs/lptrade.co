import Link from "next/link";
import AdminSearchToolbar from "@/components/AdminSearchToolbar";
import ProductCardList from "@/components/ProductCardList";
import ProductTable from "@/components/ProductTable";
import { requireRole } from "@/services/auth-service";
import { listProducts } from "@/services/product-service";

type ProductView = "table" | "card";

function queryFromValue(value?: string | string[]) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function viewFromValue(value?: string | string[]): ProductView {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "card" ? "card" : "table";
}

function viewHref(view: ProductView, query: string) {
  const params = new URLSearchParams();
  params.set("view", view);

  if (query) {
    params.set("q", query);
  }

  return `/admin/product?${params}`;
}

export default async function AdminProductPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; view?: string | string[] }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const query = queryFromValue(params.q);
  const view = viewFromValue(params.view);
  const products = await listProducts({ query });

  return (
    <div className="page-shell">
      <div className="admin-page-actions">
        <Link href="/admin/product/new" className="btn btn-success btn-sm">
          เพิ่มสินค้า
        </Link>
      </div>

      <section className="content-panel">
        <h2>รายการสินค้า</h2>
        <AdminSearchToolbar
          action="/admin/product"
          hiddenFields={{ view }}
          placeholder="ค้นหาชื่อสินค้า SKU แบรนด์ หรือ tag"
          query={query}
        >
          <div className="view-toggle" aria-label="Product view">
            <Link
              className={`view-toggle-button ${view === "table" ? "active" : ""}`}
              href={viewHref("table", query)}
            >
              Table
            </Link>
            <Link
              className={`view-toggle-button ${view === "card" ? "active" : ""}`}
              href={viewHref("card", query)}
            >
              Card
            </Link>
          </div>
        </AdminSearchToolbar>

        {view === "card" ? (
          <ProductCardList products={products} />
        ) : (
          <ProductTable products={products} />
        )}
      </section>
    </div>
  );
}
