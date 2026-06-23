import AdminSearchToolbar from "@/components/AdminSearchToolbar";
import DashboardStats from "@/components/DashboardStats";
import RequestStatusSummary from "@/components/RequestStatusSummary";
import { requireRole } from "@/services/auth-service";
import {
  getDashboardSummary,
  listRequests,
} from "@/services/eprocurement-service";

function queryFromValue(value?: string | string[]) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const query = queryFromValue(params.q);
  const summary = await getDashboardSummary();
  const requests = await listRequests({ query });

  return (
    <div className="page-shell">
      <DashboardStats
        total={summary.total}
        pending={summary.pending}
        approved={summary.approved}
        rejected={summary.rejected}
      />

      <section className="content-panel">
        <h2>ภาพรวมคำขอ</h2>
        <AdminSearchToolbar
          action="/admin/dashboard"
          placeholder="ค้นหาเลขที่คำขอ รายการ หรือแผนก"
          query={query}
        />
        <RequestStatusSummary requests={requests} />
      </section>
    </div>
  );
}
