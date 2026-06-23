import OrderTable from "@/components/OrderTable";
import PageHeader from "@/components/PageHeader";
import { requireRole } from "@/services/auth-service";
import { listOrders } from "@/services/order-service";

export default async function OrderPage() {
  const session = await requireRole(["admin", "requester"]);
  const orders = await listOrders();

  return (
    <div className="page-shell">
      <PageHeader eyebrow="Order" title="Order" badge={session.role} />

      <section className="content-panel">
        <h2>รายการ Order</h2>
        <OrderTable orders={orders} showRequester={session.role === "admin"} />
      </section>
    </div>
  );
}
