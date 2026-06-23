import StatCard from "@/components/StatCard";

type DashboardStatsProps = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export default function DashboardStats({
  total,
  pending,
  approved,
  rejected,
}: DashboardStatsProps) {
  return (
    <section className="row g-4 stats-grid">
      <div className="col-sm-12 col-md-3">
        <StatCard label="ทั้งหมด" value={total} />
      </div>
      <div className="col-sm-12 col-md-3">
        <StatCard label="รออนุมัติ" value={pending} />
      </div>
      <div className="col-sm-12 col-md-3">
        <StatCard label="อนุมัติแล้ว" value={approved} />
      </div>
      <div className="col-sm-12 col-md-3">
        <StatCard label="ไม่อนุมัติ" value={rejected} />
      </div>
    </section>
  );
}
