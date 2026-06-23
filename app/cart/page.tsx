import CartTable from "@/components/CartTable";
import PageHeader from "@/components/PageHeader";
import { requireRole } from "@/services/auth-service";
import { getCart } from "@/services/order-service";

export default async function CartPage() {
  const session = await requireRole(["admin", "requester"]);
  const cart = await getCart();

  return (
    <div className="page-shell">
      <PageHeader eyebrow="Cart" title="Cart" badge={session.role} />
      <CartTable cart={cart} />
    </div>
  );
}
