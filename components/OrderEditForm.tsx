import { updateOrderAction } from "@/actions/order-actions";
import type { Order, OrderStatus } from "@/lib/types";

type OrderEditFormProps = {
  order: Order;
};

const statuses: Array<{ value: OrderStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

function formatPrice(value: number) {
  return value.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function OrderEditForm({ order }: OrderEditFormProps) {
  return (
    <form action={updateOrderAction} className="form-panel order-edit-form">
      <input type="hidden" name="id" value={order.id} />

      <h2>แก้ไข Order</h2>
      <p className="form-help">
        {order.orderNo} - {order.costCenterCode} {order.costCenterName}
      </p>

      <label htmlFor="status" className="form-label mb-0">
        Status
      </label>
      <select
        id="status"
        name="status"
        defaultValue={order.status}
        className="form-select"
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      <label htmlFor="note" className="form-label mb-0">
        Note
      </label>
      <textarea
        id="note"
        name="note"
        defaultValue={order.note}
        className="form-control"
        rows={3}
      />

      <div className="content-panel p-0 border-0 shadow-none">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>สินค้า</th>
              <th>ราคา</th>
              <th>จำนวน</th>
              <th>รวม</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="fw-semibold">{item.name}</div>
                  <div className="small text-secondary">{item.sku}</div>
                </td>
                <td>{formatPrice(item.price)} บาท</td>
                <td>
                  <input
                    aria-label={`จำนวน ${item.name}`}
                    className="form-control form-control-sm"
                    defaultValue={item.quantity}
                    min="1"
                    name={`quantity-${item.id}`}
                    type="number"
                  />
                </td>
                <td>{formatPrice(item.lineTotal)} บาท</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="submit" className="btn btn-primary w-100">
        Save Order
      </button>
    </form>
  );
}
