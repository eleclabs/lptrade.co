import { updateProfileAction } from "@/actions/auth-actions";
import type { Role } from "@/lib/types";

type ProfileFormProps = {
  profile: {
    name: string;
    email: string;
    phone: string;
    role: Role;
  };
  hasError?: boolean;
  updated?: boolean;
};

export default function ProfileForm({
  profile,
  hasError,
  updated,
}: ProfileFormProps) {
  return (
    <form action={updateProfileAction} className="form-panel">
      <h2>Profile</h2>

      {updated ? (
        <p className="alert alert-success mb-0">บันทึกข้อมูลเรียบร้อย</p>
      ) : null}
      {hasError ? (
        <p className="alert alert-danger mb-0">
          กรุณาตรวจสอบข้อมูล หรือ current password ไม่ถูกต้อง
        </p>
      ) : null}

      <label htmlFor="name" className="form-label mb-0">
        ชื่อ
      </label>
      <input
        id="name"
        name="name"
        defaultValue={profile.name}
        className="form-control"
        required
      />

      <label htmlFor="email" className="form-label mb-0">
        Email
      </label>
      <input
        id="email"
        value={profile.email}
        className="form-control"
        readOnly
      />

      <label htmlFor="phone" className="form-label mb-0">
        เบอร์โทร
      </label>
      <input
        id="phone"
        name="phone"
        type="tel"
        defaultValue={profile.phone}
        className="form-control"
      />

      <label htmlFor="role" className="form-label mb-0">
        Role
      </label>
      <input id="role" value={profile.role} className="form-control" readOnly />

      <hr className="my-2" />

      <label htmlFor="currentPassword" className="form-label mb-0">
        Current Password
      </label>
      <input
        id="currentPassword"
        name="currentPassword"
        type="password"
        className="form-control"
        placeholder="ใส่เมื่อต้องการเปลี่ยน password"
      />

      <label htmlFor="newPassword" className="form-label mb-0">
        New Password
      </label>
      <input
        id="newPassword"
        name="newPassword"
        type="password"
        className="form-control"
        minLength={6}
      />

      <label htmlFor="confirmPassword" className="form-label mb-0">
        Confirm New Password
      </label>
      <input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        className="form-control"
        minLength={6}
      />

      <button type="submit" className="btn btn-primary w-100">
        Save Profile
      </button>
    </form>
  );
}
