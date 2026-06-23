import CostCenterSelector from "@/components/CostCenterSelector";
import DashboardStats from "@/components/DashboardStats";
import ProductCatalog from "@/components/ProductCatalog";
import RequestForm from "@/components/RequestForm";
import RequestTable from "@/components/RequestTable";
import { requireRole } from "@/services/auth-service";
import {
  getDashboardSummary,
  listMyCostCenters,
  listRequests,
} from "@/services/eprocurement-service";
import { listActiveProducts } from "@/services/product-service";

type RequesterPageProps = {
  searchParams?: Promise<{ costCenterId?: string }>;
};

export default async function RequesterPage({ searchParams }: RequesterPageProps) {
  await requireRole(["admin", "requester"]);
  const params = await searchParams;
  const costCenters = await listMyCostCenters();
  const selectedCostCenter = costCenters.find(
    (costCenter) => costCenter.id === params?.costCenterId,
  );
  const costCenterId = selectedCostCenter?.id;
  const summary = await getDashboardSummary({ costCenterId });
  const requests = costCenterId ? await listRequests({ costCenterId }) : [];
  const products = costCenterId ? await listActiveProducts() : [];

  return (
    <div className="page-shell">
      <CostCenterSelector
        action="/requester"
        costCenters={costCenters}
        selectedId={costCenterId}
      />

      {costCenterId ? (
        <>
          <DashboardStats
            total={summary.total}
            pending={summary.pending}
            approved={summary.approved}
            rejected={summary.rejected}
          />

          <div className="row g-4">
            <div className="col-sm-12 col-lg-4">
              <RequestForm costCenterId={costCenterId} />
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
            <ProductCatalog products={products} costCenterId={costCenterId} />
          </section>
        </>
      ) : null}
    </div>
  );
}
