import Link from "next/link";
import { notFound } from "next/navigation";
import OrderDetail from "@/components/OrderDetail";
import { requireRole } from "@/services/auth-service";
import { getOrder } from "@/services/order-service";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await requireRole(["admin", "approver", "requester"]);
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="page-shell">
      <div className="table-actions mb-3">
        <Link href="/order" className="btn btn-outline-secondary btn-sm">
          Back to Order
        </Link>
        {(session.role === "admin" || session.role === "requester") &&
        order.status !== "paid" ? (
          <Link href={`/order/${order.id}/edit`} className="btn btn-primary btn-sm">
            Edit Order
          </Link>
        ) : null}
      </div>
      <OrderDetail order={order} />
    </div>
  );
}
