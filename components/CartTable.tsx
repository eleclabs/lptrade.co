import Image from "next/image";
import {
  checkoutCartAction,
  clearCartAction,
  removeCartItemAction,
  updateCartItemAction,
} from "@/actions/order-actions";
import type { Cart } from "@/lib/types";

type CartTableProps = {
  cart: Cart;
};

function formatPrice(value: number) {
  return value.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function CartTable({ cart }: CartTableProps) {
  if (cart.items.length === 0) {
    return <p className="empty-state">ยังไม่มีสินค้าใน Cart</p>;
  }

  return (
    <div className="cart-layout">
      <div className="content-panel">
        <h2>สินค้าใน Cart</h2>
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>สินค้า</th>
              <th>ราคา</th>
              <th>จำนวน</th>
              <th>รวม</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {cart.items.map((item) => (
              <tr key={item.productId}>
                <td>
                  <div className="cart-product">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={56}
                        height={56}
                        className="product-thumb"
                      />
                    ) : (
                      <span className="product-thumb product-thumb-empty">-</span>
                    )}
                    <div>
                      <div className="fw-semibold">{item.name}</div>
                      <div className="small text-secondary">{item.sku}</div>
                    </div>
                  </div>
                </td>
                <td>{formatPrice(item.price)} บาท</td>
                <td>
                  <form action={updateCartItemAction} className="cart-quantity-form">
                    <input type="hidden" name="productId" value={item.productId} />
                    <input
                      aria-label={`จำนวน ${item.name}`}
                      className="form-control form-control-sm"
                      defaultValue={item.quantity}
                      min="1"
                      name="quantity"
                      type="number"
                    />
                    <button type="submit" className="btn btn-outline-primary btn-sm">
                      Update
                    </button>
                  </form>
                </td>
                <td>{formatPrice(item.lineTotal)} บาท</td>
                <td>
                  <form action={removeCartItemAction}>
                    <input type="hidden" name="productId" value={item.productId} />
                    <button type="submit" className="btn btn-outline-danger btn-sm">
                      Remove
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <aside className="form-panel cart-summary">
        <h2>สรุป Order</h2>
        <div className="summary-row">
          <span>Cost Center</span>
          <strong>
            {cart.costCenterCode
              ? `${cart.costCenterCode} ${cart.costCenterName}`
              : "-"}
          </strong>
        </div>
        <div className="summary-row">
          <span>จำนวนสินค้า</span>
          <strong>{cart.itemCount}</strong>
        </div>
        <div className="summary-row">
          <span>ยอดรวม</span>
          <strong>{formatPrice(cart.totalAmount)} บาท</strong>
        </div>

        <form action={checkoutCartAction} className="cart-checkout-form">
          <label htmlFor="note" className="form-label mb-0">
            หมายเหตุ
          </label>
          <textarea id="note" name="note" className="form-control" rows={3} />
          <button type="submit" className="btn btn-success w-100">
            Checkout
          </button>
        </form>

        <form action={clearCartAction}>
          <button type="submit" className="btn btn-outline-danger w-100">
            Clear Cart
          </button>
        </form>
      </aside>
    </div>
  );
}
