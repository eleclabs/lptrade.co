import Link from "next/link";
import { notFound } from "next/navigation";
import OrderEditForm from "@/components/OrderEditForm";
import PageHeader from "@/components/PageHeader";
import { requireRole } from "@/services/auth-service";
import { getOrder } from "@/services/order-service";

type OrderEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderEditPage({ params }: OrderEditPageProps) {
  const session = await requireRole(["admin", "requester"]);
  const { id } = await params;
  const order = await getOrder(id);

  if (!order || order.status === "paid") {
    notFound();
  }

  return (
    <div className="page-shell">
      <PageHeader eyebrow="Order" title={`Edit ${order.orderNo}`} badge={session.role} />
      <div className="mb-3">
        <Link href={`/order/${order.id}`} className="btn btn-outline-secondary btn-sm">
          Back to Detail
        </Link>
      </div>

      <div className="row g-4">
        <div className="col-sm-12 col-lg-9">
          <OrderEditForm order={order} />
        </div>
      </div>
    </div>
  );
}
