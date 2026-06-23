import Link from "next/link";
import { registerAction } from "@/actions/auth-actions";

type RegisterFormProps = {
  hasError?: boolean;
};

export default function RegisterForm({ hasError }: RegisterFormProps) {
  return (
    <form action={registerAction} className="form-panel">
      <h1>สมัครสมาชิก</h1>
      {hasError ? (
        <p className="alert alert-danger mb-0">
          กรุณาตรวจสอบข้อมูล หรือ email นี้ถูกใช้งานแล้ว
        </p>
      ) : null}

      <label htmlFor="name" className="form-label mb-0">
        ชื่อ
      </label>
      <input id="name" name="name" className="form-control" required />

      <label htmlFor="email" className="form-label mb-0">
        Email
      </label>
      <input id="email" name="email" type="email" className="form-control" required />

      <label htmlFor="phone" className="form-label mb-0">
        เบอร์โทร
      </label>
      <input id="phone" name="phone" type="tel" className="form-control" />

      <label htmlFor="password" className="form-label mb-0">
        Password
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
        ยืนยัน Password
      </label>
      <input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        className="form-control"
        minLength={6}
        required
      />

      <button type="submit" className="btn btn-success w-100">
        Register
      </button>

      <Link href="/login" className="btn btn-outline-secondary w-100">
        Login
      </Link>
    </form>
  );
}
