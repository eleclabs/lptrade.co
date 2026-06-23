import CostCenterSelector from "@/components/CostCenterSelector";
import DashboardStats from "@/components/DashboardStats";
import RequestTable from "@/components/RequestTable";
import { requireRole } from "@/services/auth-service";
import {
  getDashboardSummary,
  listMyCostCenters,
  listPendingApprovals,
} from "@/services/eprocurement-service";

type ApproverPageProps = {
  searchParams?: Promise<{ costCenterId?: string }>;
};

export default async function ApproverPage({ searchParams }: ApproverPageProps) {
  await requireRole(["admin", "approver"]);
  const params = await searchParams;
  const costCenters = await listMyCostCenters();
  const selectedCostCenter = costCenters.find(
    (costCenter) => costCenter.id === params?.costCenterId,
  );
  const costCenterId = selectedCostCenter?.id;
  const summary = await getDashboardSummary({ costCenterId });
  const requests = costCenterId
    ? await listPendingApprovals({ costCenterId })
    : [];

  return (
    <div className="page-shell">
      <CostCenterSelector
        action="/approver"
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

          <section className="content-panel">
            <h2>รายการที่ต้องดำเนินการ</h2>
            <RequestTable requests={requests} showActions />
          </section>
        </>
      ) : null}
    </div>
  );
}
