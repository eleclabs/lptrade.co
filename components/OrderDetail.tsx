import type { Order } from "@/lib/types";

type OrderDetailProps = {
  order: Order;
};

function formatPrice(value: number) {
  return value.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function OrderDetail({ order }: OrderDetailProps) {
  return (
    <>
      <section className="content-panel">
        <h2>รายละเอียดโครงการ</h2>
        <div className="order-detail-grid">
          <div>
            <span>Order No.</span>
            <strong>{order.orderNo}</strong>
          </div>
          <div>
            <span>Cost Center</span>
            <strong>
              {order.costCenterCode} - {order.costCenterName}
            </strong>
          </div>
          <div>
            <span>ที่อยู่</span>
            <strong>{order.costCenterAddress || "-"}</strong>
          </div>
          <div>
            <span>เบอร์โทร</span>
            <strong>{order.costCenterPhone || "-"}</strong>
          </div>
          <div>
            <span>Requester</span>
            <strong>{order.requesterName || order.requesterEmail || "-"}</strong>
          </div>
          <div>
            <span>Approver</span>
            <strong>{order.approverEmail || "-"}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{order.status}</strong>
          </div>
          <div>
            <span>Note</span>
            <strong>{order.note || "-"}</strong>
          </div>
        </div>
      </section>

      <section className="content-panel mt-4">
        <h2>สินค้าที่สั่งซื้อ</h2>
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>SKU</th>
              <th>สินค้า</th>
              <th>ราคา</th>
              <th>จำนวน</th>
              <th>รวม</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.sku}</td>
                <td>{item.name}</td>
                <td>{formatPrice(item.price)} บาท</td>
                <td>
                  {item.quantity} {item.unit}
                </td>
                <td>{formatPrice(item.lineTotal)} บาท</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={4}>รวมทั้งหมด</th>
              <th>{formatPrice(order.totalAmount)} บาท</th>
            </tr>
          </tfoot>
        </table>
      </section>
    </>
  );
}
