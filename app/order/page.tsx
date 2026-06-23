import OrderTable from "@/components/OrderTable";
import { requireRole } from "@/services/auth-service";
import { listOrders } from "@/services/order-service";

export default async function OrderPage() {
  const session = await requireRole(["admin", "approver", "requester"]);
  const orders = await listOrders();

  return (
    <div className="page-shell">
      <section className="content-panel">
        <h2>รายการ Order</h2>
        <OrderTable
          orders={orders}
          showRequester={session.role === "admin" || session.role === "approver"}
          canManage={session.role === "admin" || session.role === "requester"}
        />
      </section>
    </div>
  );
}
