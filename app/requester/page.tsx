import DashboardStats from "@/components/DashboardStats";
import PageHeader from "@/components/PageHeader";
import ProductCatalog from "@/components/ProductCatalog";
import RequestForm from "@/components/RequestForm";
import RequestTable from "@/components/RequestTable";
import { requireRole } from "@/services/auth-service";
import {
  getDashboardSummary,
  listRequests,
} from "@/services/eprocurement-service";
import { listActiveProducts } from "@/services/product-service";

export default async function RequesterPage() {
  await requireRole(["admin", "requester"]);
  const summary = await getDashboardSummary();
  const requests = await listRequests();
  const products = await listActiveProducts();

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Requester"
        title="คำขอจัดซื้อของฉัน"
        badge={summary.user.role}
      />

      <DashboardStats
        total={summary.total}
        pending={summary.pending}
        approved={summary.approved}
        rejected={summary.rejected}
      />

      <div className="row g-4">
        <div className="col-sm-12 col-lg-4">
          <RequestForm />
        </div>
        <div className="col-sm-12 col-lg-8">
          <section className="content-panel">
            <h2>รายการคำขอ</h2>
            <RequestTable requests={requests} />
          </section>
        </div>
      </div>

      <section className="content-panel mt-4">
        <h2>สินค้า</h2>
        <ProductCatalog products={products} />
      </section>
    </div>
  );
}
