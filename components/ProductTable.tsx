import Image from "next/image";
import Link from "next/link";
import { deleteProductAction } from "@/actions/admin-actions";
import type { Product, ProductStatus } from "@/lib/types";

type ProductTableProps = {
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

export default function ProductTable({ products }: ProductTableProps) {
  if (products.length === 0) {
    return <p className="empty-state">ยังไม่มีสินค้า</p>;
  }

  return (
    <table className="table table-hover align-middle">
      <thead>
        <tr>
          <th>รูป</th>
          <th>ชื่อสินค้า</th>
          <th>SKU</th>
          <th>หมวดหมู่</th>
          <th>ราคา</th>
          <th>คลัง</th>
          <th>สถานะ</th>
          <th>อัปเดต</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => {
          const deleteFormId = `delete-product-${product.id}`;
          const coverImage = product.images[0];

          return (
            <tr key={product.id}>
              <td>
                {coverImage ? (
                  <Image
                    src={coverImage.url}
                    alt={product.name}
                    width={56}
                    height={56}
                    className="product-thumb"
                  />
                ) : (
                  <span className="text-secondary">-</span>
                )}
              </td>
              <td>
                <div className="fw-semibold">{product.name}</div>
                {product.brand ? (
                  <div className="small text-secondary">{product.brand}</div>
                ) : null}
              </td>
              <td>{product.sku}</td>
              <td>{product.categoryName || "-"}</td>
              <td>
                <div>{formatPrice(product.price)} ฿</div>
                {product.compareAtPrice && product.compareAtPrice > product.price ? (
                  <div className="small text-secondary text-decoration-line-through">
                    {formatPrice(product.compareAtPrice)} ฿
                  </div>
                ) : null}
              </td>
              <td>
                {product.stock} {product.unit}
              </td>
              <td>
                <span className={`status ${statusClass(product.status)}`}>
                  {statusLabel(product.status)}
                </span>
              </td>
              <td>{product.updatedAt}</td>
              <td>
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
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
