import Image from "next/image";
import { addToCartAction } from "@/actions/order-actions";
import type { Product } from "@/lib/types";

type ProductCatalogProps = {
  products: Product[];
};

function formatPrice(value: number) {
  return value.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function ProductCatalog({ products }: ProductCatalogProps) {
  if (products.length === 0) {
    return <p className="empty-state">ยังไม่มีสินค้าพร้อมขาย</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => {
        const coverImage = product.images[0];

        return (
          <article className="product-card" key={product.id}>
            <div className="product-card-image">
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

            <div className="product-card-body">
              <div>
                <h3>{product.name}</h3>
                <p>{product.categoryName || product.sku}</p>
              </div>

              <div className="product-card-meta">
                <strong>{formatPrice(product.price)} บาท</strong>
                <span>
                  คลัง {product.stock} {product.unit}
                </span>
              </div>

              <form action={addToCartAction} className="product-card-action">
                <input type="hidden" name="productId" value={product.id} />
                <input
                  aria-label={`จำนวน ${product.name}`}
                  className="form-control form-control-sm"
                  defaultValue={product.minOrderQty}
                  min={product.minOrderQty}
                  max={product.stock}
                  name="quantity"
                  type="number"
                />
                <button type="submit" className="btn btn-success btn-sm">
                  เพิ่มลง Cart
                </button>
              </form>
            </div>
          </article>
        );
      })}
    </div>
  );
}
