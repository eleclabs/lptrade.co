import Link from "next/link";
import { notFound } from "next/navigation";
import CostCenterEditForm from "@/components/CostCenterEditForm";
import PageHeader from "@/components/PageHeader";
import { requireRole } from "@/services/auth-service";
import { getCostCenter } from "@/services/eprocurement-service";
import { listUsersByRole } from "@/services/user-service";

type AdminCostCenterEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminCostCenterEditPage({
  params,
}: AdminCostCenterEditPageProps) {
  const session = await requireRole(["admin"]);
  const { id } = await params;
  const [costCenter, requesters, approvers] = await Promise.all([
    getCostCenter(id),
    listUsersByRole("requester"),
    listUsersByRole("approver"),
  ]);

  if (!costCenter) {
    notFound();
  }

  return (
    <div className="page-shell">
      <PageHeader eyebrow="Admin" title="แก้ไข Cost Center" badge={session.role} />
      <div className="mb-3">
        <Link href="/admin/costcenter" className="btn btn-outline-secondary btn-sm">
          Back to Cost Center
        </Link>
      </div>

      <div className="row g-4">
        <div className="col-sm-12 col-lg-6">
          <CostCenterEditForm
            costCenter={costCenter}
            requesters={requesters}
            approvers={approvers}
          />
        </div>
      </div>
    </div>
  );
}
