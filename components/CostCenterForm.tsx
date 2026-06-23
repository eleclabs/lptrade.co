import { createCostCenterAction } from "@/actions/admin-actions";

type UserOption = {
  email: string;
  name: string;
};

type CostCenterFormProps = {
  requesters: UserOption[];
  approvers: UserOption[];
};

function UserDatalist({ id, users }: { id: string; users: UserOption[] }) {
  return (
    <datalist id={id}>
      {users.map((user) => (
        <option key={user.email} value={user.email}>
          {user.name} ({user.email})
        </option>
      ))}
    </datalist>
  );
}

export default function CostCenterForm({
  requesters,
  approvers,
}: CostCenterFormProps) {
  return (
    <form action={createCostCenterAction} className="form-panel">
      <h2>เพิ่ม Cost Center</h2>

      <label htmlFor="code" className="form-label mb-0">
        รหัสโครงการ
      </label>
      <input id="code" name="code" className="form-control" required />

      <label htmlFor="name" className="form-label mb-0">
        ชื่อโครงการ
      </label>
      <input id="name" name="name" className="form-control" required />

      <label htmlFor="address" className="form-label mb-0">
        ที่อยู่
      </label>
      <input id="address" name="address" className="form-control" required />

      <label htmlFor="phone" className="form-label mb-0">
        เบอร์โทร
      </label>
      <input id="phone" name="phone" type="tel" className="form-control" required />

      <label htmlFor="requesterEmail" className="form-label mb-0">
        Requester
      </label>
      <input
        id="requesterEmail"
        name="requesterEmail"
        className="form-control"
        list="requesterEmailOptions"
        placeholder="พิมพ์ชื่อหรือ email requester"
        required
      />
      <UserDatalist id="requesterEmailOptions" users={requesters} />

      <label htmlFor="approverEmail" className="form-label mb-0">
        Approver
      </label>
      <input
        id="approverEmail"
        name="approverEmail"
        className="form-control"
        list="approverEmailOptions"
        placeholder="พิมพ์ชื่อหรือ email approver"
        required
      />
      <UserDatalist id="approverEmailOptions" users={approvers} />

      <button type="submit" className="btn btn-success w-100">
        Save Cost Center
      </button>
    </form>
  );
}
