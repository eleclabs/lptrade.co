import Link from "next/link";
import { forgotPasswordAction } from "@/actions/auth-actions";

type ForgotPasswordFormProps = {
  resetToken?: string;
  sent?: boolean;
};

export default function ForgotPasswordForm({
  resetToken,
  sent = false,
}: ForgotPasswordFormProps) {
  const resetHref = resetToken ? `/reset-password?token=${resetToken}` : "";

  return (
    <form action={forgotPasswordAction} className="form-panel">
      <h1>Forgot Password</h1>

      {sent ? (
        <p className="alert alert-success mb-0">
          ถ้ามี email นี้ในระบบ ระบบจะสร้างลิงก์สำหรับตั้งรหัสผ่านใหม่
        </p>
      ) : null}

      {resetHref ? (
        <Link href={resetHref} className="btn btn-outline-primary w-100">
          เปิดลิงก์ Reset Password
        </Link>
      ) : null}

      <label htmlFor="email" className="form-label mb-0">
        Email
      </label>
      <input id="email" name="email" type="email" className="form-control" required />

      <button type="submit" className="btn btn-primary w-100">
        Send Reset Link
      </button>

      <Link href="/login" className="btn btn-outline-secondary w-100">
        Back to Login
      </Link>
    </form>
  );
}
