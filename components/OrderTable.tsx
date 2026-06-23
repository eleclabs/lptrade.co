import Link from "next/link";
import { deleteOrderAction } from "@/actions/order-actions";
import type { Order, OrderStatus } from "@/lib/types";

type OrderTableProps = {
  orders: Order[];
  showRequester?: boolean;
  canManage?: boolean;
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
  canManage = false,
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
          <th>Cost Center</th>
          <th>จำนวน</th>
          <th>ยอดรวม</th>
          <th>สถานะ</th>
          <th>วันที่</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => {
          const deleteFormId = `delete-order-${order.id}`;

          return (
            <tr key={order.id}>
              <td>{order.orderNo}</td>
              {showRequester ? <td>{order.requesterName || "-"}</td> : null}
              <td>
                {order.costCenterCode
                  ? `${order.costCenterCode} - ${order.costCenterName}`
                  : "-"}
              </td>
              <td>{order.itemCount}</td>
              <td>{formatPrice(order.totalAmount)} บาท</td>
              <td>
                <span className={`status ${statusClass(order.status)}`}>
                  {statusLabel(order.status)}
                </span>
              </td>
              <td>{order.createdAt}</td>
              <td>
                <form id={deleteFormId} action={deleteOrderAction}>
                  <input type="hidden" name="id" value={order.id} />
                </form>
                <div className="table-actions">
                  <Link href={`/order/${order.id}`} className="btn btn-primary btn-sm">
                    Detail
                  </Link>
                  {canManage && order.status !== "paid" ? (
                    <>
                      <Link
                        href={`/order/${order.id}/edit`}
                        className="btn btn-outline-primary btn-sm"
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
                    </>
                  ) : null}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
