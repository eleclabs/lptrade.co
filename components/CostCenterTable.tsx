import Link from "next/link";
import { deleteCostCenterAction } from "@/actions/admin-actions";
import type { CostCenter } from "@/lib/types";

type CostCenterTableProps = {
  costCenters: CostCenter[];
};

function UserCell({ name, email }: { name: string; email: string }) {
  if (!email) {
    return <>-</>;
  }

  return (
    <div>
      <div className="fw-semibold">{name || "-"}</div>
      <div className="small text-secondary">{email}</div>
    </div>
  );
}

export default function CostCenterTable({ costCenters }: CostCenterTableProps) {
  if (costCenters.length === 0) {
    return <p className="empty-state">ยังไม่มี Cost Center</p>;
  }

  return (
    <table className="table table-hover table-responsive align-middle">
      <thead>
        <tr>
          <th>รหัสโครงการ</th>
          <th>ชื่อโครงการ</th>
          <th>ที่อยู่</th>
          <th>เบอร์โทร</th>
          <th>Requester</th>
          <th>Approver</th>
          <th>วันที่สร้าง</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {costCenters.map((costCenter) => {
          const deleteFormId = `delete-costcenter-${costCenter.id}`;

          return (
            <tr key={costCenter.id}>
              <td>{costCenter.code}</td>
              <td>{costCenter.name}</td>
              <td>{costCenter.address}</td>
              <td>{costCenter.phone}</td>
              <td>
                <UserCell
                  name={costCenter.requesterName}
                  email={costCenter.requesterEmail}
                />
              </td>
              <td>
                <UserCell
                  name={costCenter.approverName}
                  email={costCenter.approverEmail}
                />
              </td>
              <td>{costCenter.createdAt}</td>
              <td>
                <form id={deleteFormId} action={deleteCostCenterAction}>
                  <input type="hidden" name="id" value={costCenter.id} />
                </form>
                <div className="table-actions">
                  <Link
                    href={`/admin/costcenter/${costCenter.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Edit
                  </Link>
                  <button
                    type="submit"
                    form={deleteFormId}
                    className="btn btn-outline-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
