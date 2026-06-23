import { createUserAction } from "@/actions/admin-actions";

export default function UserForm() {
  return (
    <form action={createUserAction} className="form-panel">
      <h2>เพิ่มผู้ใช้งาน</h2>

      <input name="name" className="form-control" placeholder="ชื่อ นามสกุล" required />
      <input
        name="email"
        type="email"
        className="form-control"
        placeholder="Email"
        required
      />
      <input
        id="user-password"
        name="password"
        type="password"
        className="form-control"
        placeholder="Password"
        required
      />

      <label className="form-label mb-0">
        สิทธิ์
      </label>
      <select name="role" className="form-select" required>
        <option value="requester">Requester</option>
        <option value="approver">Approver</option>
        <option value="admin">Admin</option>
      </select>

      <button type="submit" className="btn btn-success w-100">
        Save
      </button>
    </form>
  );
}
