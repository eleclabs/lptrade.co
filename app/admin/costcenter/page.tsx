import AdminSearchToolbar from "@/components/AdminSearchToolbar";
import CostCenterForm from "@/components/CostCenterForm";
import CostCenterTable from "@/components/CostCenterTable";
import { requireRole } from "@/services/auth-service";
import { listCostCenters } from "@/services/eprocurement-service";
import { listUsersByRole } from "@/services/user-service";

function queryFromValue(value?: string | string[]) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function AdminCostCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const query = queryFromValue(params.q);
  const [costCenters, requesters, approvers] = await Promise.all([
    listCostCenters({ query }),
    listUsersByRole("requester"),
    listUsersByRole("approver"),
  ]);

  return (
    <div className="page-shell">
      <div className="row g-4">
        <div className="col-md-4 col-lg-4">
          <CostCenterForm requesters={requesters} approvers={approvers} />
        </div>
        <div className="col-md-8">
          <section className="content-panel">
            <h2>Cost Center</h2>
            <AdminSearchToolbar
              action="/admin/costcenter"
              placeholder="ค้นหา cost center หรือผู้เกี่ยวข้อง"
              query={query}
            />
            <CostCenterTable costCenters={costCenters} />
          </section>
        </div>
      </div>
    </div>
  );
}
