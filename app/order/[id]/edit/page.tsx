import Link from "next/link";
import { notFound } from "next/navigation";
import OrderEditForm from "@/components/OrderEditForm";
import { requireRole } from "@/services/auth-service";
import { getOrder } from "@/services/order-service";

type OrderEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderEditPage({ params }: OrderEditPageProps) {
  await requireRole(["admin", "requester"]);
  const { id } = await params;
  const order = await getOrder(id);

  if (!order || order.status === "paid") {
    notFound();
  }

  return (
    <div className="page-shell">
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
