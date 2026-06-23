import {
  approveRequestAction,
  rejectRequestAction,
} from "@/actions/procurement-actions";
import type { ProcurementRequest } from "@/lib/types";

type RequestTableProps = {
  requests: ProcurementRequest[];
  showActions?: boolean;
};

export default function RequestTable({
  requests,
  showActions = false,
}: RequestTableProps) {
  if (requests.length === 0) {
    return <p className="empty-state">ยังไม่มีรายการ</p>;
  }

  return (
    <table className="table table-hover">
      <thead>
        <tr>
          <th>เลขที่</th>
          <th>รายการ</th>
          <th>แผนก</th>
          <th>งบประมาณ</th>
          <th>สถานะ</th>
          <th>วันที่</th>
          {showActions ? <th>จัดการ</th> : null}
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => (
          <tr key={request.id}>
            <td>{request.id}</td>
            <td>{request.title}</td>
            <td>{request.department}</td>
            <td>{request.amount.toLocaleString("th-TH")}</td>
            <td>
              <span className={`status status-${request.status}`}>
                {request.status}
              </span>
            </td>
            <td>{request.updatedAt}</td>
            {showActions ? (
              <td>
                <div className="table-actions">
                  <form action={approveRequestAction}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <button type="submit" className="btn btn-success">
                      Approve
                    </button>
                  </form>
                  <form action={rejectRequestAction}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <button type="submit" className="btn btn-danger">
                      Reject
                    </button>
                  </form>
                </div>
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
