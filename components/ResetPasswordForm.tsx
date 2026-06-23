import Link from "next/link";
import { resetPasswordAction } from "@/actions/auth-actions";

type ResetPasswordFormProps = {
  token: string;
  hasError?: boolean;
};

export default function ResetPasswordForm({
  token,
  hasError,
}: ResetPasswordFormProps) {
  return (
    <form action={resetPasswordAction} className="form-panel">
      <h1>Reset Password</h1>
      {hasError ? (
        <p className="alert alert-danger mb-0">
          ลิงก์หมดอายุ หรือข้อมูล password ไม่ถูกต้อง
        </p>
      ) : null}

      {!token ? (
        <p className="alert alert-warning mb-0">ไม่พบ reset token</p>
      ) : null}

      <input type="hidden" name="token" value={token} />

      <label htmlFor="password" className="form-label mb-0">
        Password ใหม่
      </label>
      <input
        id="password"
        name="password"
        type="password"
        className="form-control"
        minLength={6}
        required
      />

      <label htmlFor="confirmPassword" className="form-label mb-0">
        ยืนยัน Password ใหม่
      </label>
      <input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        className="form-control"
        minLength={6}
        required
      />

      <button type="submit" className="btn btn-primary w-100" disabled={!token}>
        Reset Password
      </button>

      <Link href="/login" className="btn btn-outline-secondary w-100">
        Back to Login
      </Link>
    </form>
  );
}
