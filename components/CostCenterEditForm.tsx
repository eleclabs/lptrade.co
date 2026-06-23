import { updateCostCenterAction } from "@/actions/admin-actions";
import type { CostCenter } from "@/lib/types";

type UserOption = {
  email: string;
  name: string;
};

type CostCenterEditFormProps = {
  costCenter: CostCenter;
  requesters: UserOption[];
  approvers: UserOption[];
};

function UserDatalist({
  id,
  users,
  selectedEmail,
}: {
  id: string;
  users: UserOption[];
  selectedEmail: string;
}) {
  return (
    <datalist id={id}>
      {users.map((user) => (
        <option key={user.email} value={user.email}>
          {user.name} ({user.email})
        </option>
      ))}
      {selectedEmail && !users.some((user) => user.email === selectedEmail) ? (
        <option value={selectedEmail}>{selectedEmail}</option>
      ) : null}
    </datalist>
  );
}

export default function CostCenterEditForm({
  costCenter,
  requesters,
  approvers,
}: CostCenterEditFormProps) {
  return (
    <form action={updateCostCenterAction} className="form-panel">
      <input type="hidden" name="id" value={costCenter.id} />

      <label htmlFor="code" className="form-label mb-0">
        รหัสโครงการ
      </label>
      <input
        id="code"
        name="code"
        defaultValue={costCenter.code}
        className="form-control"
        required
      />

      <label htmlFor="name" className="form-label mb-0">
        ชื่อโครงการ
      </label>
      <input
        id="name"
        name="name"
        defaultValue={costCenter.name}
        className="form-control"
        required
      />

      <label htmlFor="address" className="form-label mb-0">
        ที่อยู่
      </label>
      <input
        id="address"
        name="address"
        defaultValue={costCenter.address}
        className="form-control"
        required
      />

      <label htmlFor="phone" className="form-label mb-0">
        เบอร์โทร
      </label>
      <input
        id="phone"
        name="phone"
        type="tel"
        defaultValue={costCenter.phone}
        className="form-control"
        required
      />

      <label htmlFor="requesterEmail" className="form-label mb-0">
        Requester
      </label>
      <input
        id="requesterEmail"
        name="requesterEmail"
        defaultValue={costCenter.requesterEmail}
        className="form-control"
        list="requesterEmailOptions"
        placeholder="พิมพ์ชื่อหรือ email requester"
        required
      />
      <UserDatalist
        id="requesterEmailOptions"
        selectedEmail={costCenter.requesterEmail}
        users={requesters}
      />

      <label htmlFor="approverEmail" className="form-label mb-0">
        Approver
      </label>
      <input
        id="approverEmail"
        name="approverEmail"
        defaultValue={costCenter.approverEmail}
        className="form-control"
        list="approverEmailOptions"
        placeholder="พิมพ์ชื่อหรือ email approver"
        required
      />
      <UserDatalist
        id="approverEmailOptions"
        selectedEmail={costCenter.approverEmail}
        users={approvers}
      />

      <button type="submit" className="btn btn-primary w-100">
        Save Cost Center
      </button>
    </form>
  );
}
