import DashboardStats from "@/components/DashboardStats";
import PageHeader from "@/components/PageHeader";
import RequestTable from "@/components/RequestTable";
import { requireRole } from "@/services/auth-service";
import {
  getDashboardSummary,
  listPendingApprovals,
} from "@/services/eprocurement-service";

export default async function ApproverPage() {
  await requireRole(["admin", "approver"]);
  const summary = await getDashboardSummary();
  const requests = await listPendingApprovals();

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Approver"
        title="รายการรออนุมัติ"
        badge={summary.user.role}
      />

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
    </div>
  );
}
