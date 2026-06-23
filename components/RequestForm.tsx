import { createRequestAction } from "@/actions/procurement-actions";

export default function RequestForm() {
  return (
    <form action={createRequestAction} className="form-panel">
      <h2>สร้างคำขอจัดซื้อ</h2>

      <label htmlFor="title" className="form-label mb-0">
        รายการ
      </label>
      <input id="title" name="title" className="form-control" required />

      <label htmlFor="department" className="form-label mb-0">
        แผนก
      </label>
      <input id="department" name="department" className="form-control" required />

      <label htmlFor="amount" className="form-label mb-0">
        งบประมาณ
      </label>
      <input
        id="amount"
        name="amount"
        type="number"
        min="1"
        className="form-control"
        required
      />

      <button type="submit" className="btn btn-success w-100">
        Submit Request
      </button>
    </form>
  );
}
