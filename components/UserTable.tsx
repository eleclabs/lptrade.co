import {
  deleteUserAction,
  updateUserAction,
} from "@/actions/admin-actions";
import type { Role } from "@/lib/types";

type UserTableProps = {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: Role;
  }>;
};

const roles: Role[] = ["requester", "approver", "admin"];

export default function UserTable({ users }: UserTableProps) {
  if (users.length === 0) {
    return <p className="empty-state">ยังไม่มีผู้ใช้งาน</p>;
  }

  return (
    <table className="table table-hover align-middle">
      <thead>
        <tr>
          <th>ชื่อ</th>
          <th>Email</th>
          <th>สิทธิ์</th>
          <th>Password ใหม่</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => {
          const updateFormId = `update-user-${user.id}`;
          const deleteFormId = `delete-user-${user.id}`;

          return (
            <tr key={user.id}>
              <td>
                <input form={updateFormId} type="hidden" name="id" value={user.id} />
                <input
                  form={updateFormId}
                  name="name"
                  defaultValue={user.name}
                  className="form-control form-control-sm"
                  required
                />
              </td>
              <td>
                <input
                  form={updateFormId}
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  className="form-control form-control-sm"
                  required
                />
              </td>
              <td>
                <select
                  form={updateFormId}
                  name="role"
                  defaultValue={user.role}
                  className="form-select form-select-sm"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  form={updateFormId}
                  name="password"
                  type="password"
                  className="form-control form-control-sm"
                  placeholder="เว้นว่างถ้าไม่เปลี่ยน"
                />
              </td>
              <td>
                <form id={updateFormId} action={updateUserAction} />
                <form id={deleteFormId} action={deleteUserAction}>
                  <input type="hidden" name="id" value={user.id} />
                </form>
                <div className="table-actions">
                  <button
                    type="submit"
                    form={updateFormId}
                    className="btn btn-primary btn-sm"
                  >
                    Save
                  </button>
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
