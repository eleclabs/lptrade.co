import type { ProcurementRequest } from "@/lib/types";

type RequestStatusSummaryProps = {
  requests: ProcurementRequest[];
};

const statuses = ["pending", "approved", "rejected"] as const;

export default function RequestStatusSummary({
  requests,
}: RequestStatusSummaryProps) {
  return (
    <table className="table table-hover">
      <thead>
        <tr>
          <th>สถานะ</th>
          <th>จำนวน</th>
        </tr>
      </thead>
      <tbody>
        {statuses.map((status) => (
          <tr key={status}>
            <td>{status}</td>
            <td>
              {requests.filter((request) => request.status === status).length}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
