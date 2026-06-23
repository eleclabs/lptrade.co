import type { Order, OrderStatus } from "@/lib/types";

type OrderTableProps = {
  orders: Order[];
  showRequester?: boolean;
};

function formatPrice(value: number) {
  return value.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function statusLabel(status: OrderStatus) {
  if (status === "paid") return "Paid";
  if (status === "cancelled") return "Cancelled";
  return "Pending";
}

function statusClass(status: OrderStatus) {
  if (status === "paid") return "status-approved";
  if (status === "cancelled") return "status-rejected";
  return "status-pending";
}

export default function OrderTable({
  orders,
  showRequester = false,
}: OrderTableProps) {
  if (orders.length === 0) {
    return <p className="empty-state">ยังไม่มี Order</p>;
  }

  return (
    <table className="table table-hover align-middle">
      <thead>
        <tr>
          <th>เลขที่</th>
          {showRequester ? <th>ผู้สั่งซื้อ</th> : null}
          <th>รายการ</th>
          <th>จำนวน</th>
          <th>ยอดรวม</th>
          <th>สถานะ</th>
          <th>วันที่</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>{order.orderNo}</td>
            {showRequester ? <td>{order.requesterName || "-"}</td> : null}
            <td>
              <div className="order-items">
                {order.items.map((item) => (
                  <span key={item.productId}>
                    {item.name} x {item.quantity}
                  </span>
                ))}
              </div>
            </td>
            <td>{order.itemCount}</td>
            <td>{formatPrice(order.totalAmount)} บาท</td>
            <td>
              <span className={`status ${statusClass(order.status)}`}>
                {statusLabel(order.status)}
              </span>
            </td>
            <td>{order.createdAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
