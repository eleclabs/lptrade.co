import Image from "next/image";
import Link from "next/link";
import { deleteProductAction } from "@/actions/admin-actions";
import type { Product, ProductStatus } from "@/lib/types";

type ProductCardListProps = {
  products: Product[];
};

function formatPrice(value: number) {
  return value.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function statusLabel(status: ProductStatus) {
  if (status === "inactive") return "ปิดการขาย";
  if (status === "draft") return "ฉบับร่าง";
  return "วางขาย";
}

function statusClass(status: ProductStatus) {
  if (status === "inactive") return "status-rejected";
  if (status === "draft") return "status-draft";
  return "status-approved";
}

export default function ProductCardList({ products }: ProductCardListProps) {
  if (products.length === 0) {
    return <p className="empty-state">ยังไม่มีสินค้า</p>;
  }

  return (
    <div className="admin-product-cards">
      {products.map((product) => {
        const deleteFormId = `delete-product-card-${product.id}`;
        const coverImage = product.images[0];

        return (
          <article className="admin-product-card" key={product.id}>
            <div className="admin-product-card-image">
              {coverImage ? (
                <Image
                  src={coverImage.url}
                  alt={product.name}
                  width={320}
                  height={240}
                />
              ) : (
                <span>ไม่มีรูป</span>
              )}
            </div>

            <div className="admin-product-card-body">
              <div className="admin-product-card-title">
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.sku}</p>
                </div>
                <span className={`status ${statusClass(product.status)}`}>
                  {statusLabel(product.status)}
                </span>
              </div>

              <div className="admin-product-card-meta">
                <span>{product.categoryName || "-"}</span>
                <strong>{formatPrice(product.price)} บาท</strong>
              </div>

              <div className="admin-product-card-meta">
                <span>
                  คลัง {product.stock} {product.unit}
                </span>
                <span>{product.updatedAt}</span>
              </div>

              <form id={deleteFormId} action={deleteProductAction}>
                <input type="hidden" name="id" value={product.id} />
              </form>
              <div className="table-actions">
                <Link
                  href={`/admin/product/${product.id}`}
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
            </div>
          </article>
        );
      })}
    </div>
  );
}
