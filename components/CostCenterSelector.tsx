import Link from "next/link";
import type { CostCenter } from "@/lib/types";

type CostCenterSelectorProps = {
  action: string;
  costCenters: CostCenter[];
  selectedId?: string;
};

export default function CostCenterSelector({
  action,
  costCenters,
  selectedId,
}: CostCenterSelectorProps) {
  const selected = costCenters.find((costCenter) => costCenter.id === selectedId);

  return (
    <section className="content-panel mb-4">
      <div className="cost-center-select-row">
        <form action={action} method="get" className="cost-center-select-form">
          <label htmlFor="costCenterId" className="form-label mb-0">
            Cost Center
          </label>
          <select
            id="costCenterId"
            name="costCenterId"
            defaultValue={selectedId ?? ""}
            className="form-select"
            required
          >
            <option value="">เลือก Cost Center</option>
            {costCenters.map((costCenter) => (
              <option key={costCenter.id} value={costCenter.id}>
                {costCenter.code} - {costCenter.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            เลือก
          </button>
        </form>

        {selected ? (
          <div className="cost-center-selected">
            <strong>{selected.code}</strong>
            <span>{selected.name}</span>
            <span>{selected.address}</span>
          </div>
        ) : (
          <p className="empty-state mb-0">
            กรุณาเลือก Cost Center ก่อนทำรายการ
          </p>
        )}
      </div>

      {selected ? (
        <Link
          href={action}
          className="btn btn-outline-secondary btn-sm mt-3"
        >
          เปลี่ยน / ล้าง Cost Center
        </Link>
      ) : null}
    </section>
  );
}
