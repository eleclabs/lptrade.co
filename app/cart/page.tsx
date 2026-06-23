import CartTable from "@/components/CartTable";
import { requireRole } from "@/services/auth-service";
import { getCart } from "@/services/order-service";

export default async function CartPage() {
  await requireRole(["admin", "requester"]);
  const cart = await getCart();

  return (
    <div className="page-shell">
      <CartTable cart={cart} />
    </div>
  );
}
