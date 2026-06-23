import { loginAction } from "@/actions/auth-actions";

type LoginFormProps = {
  hasError?: boolean;
};

export default function LoginForm({ hasError }: LoginFormProps) {
  return (
    <form action={loginAction} className="form-panel">
      <h1>เข้าสู่ระบบ Eprocurement</h1>
      {hasError ? (
        <p className="alert alert-danger mb-0">
          Email หรือ Password ไม่ถูกต้อง
        </p>
      ) : null}

      <label htmlFor="email" className="form-label mb-0">
        Email
      </label>
      <input id="email" name="email" type="email" className="form-control" required />

      <label htmlFor="password" className="form-label mb-0">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        className="form-control"
        required
      />

      <button type="submit" className="btn btn-primary w-100">
        Login
      </button>

      <p className="form-help">ใช้บัญชีผู้ใช้งานจาก MongoDB เท่านั้น</p>
    </form>
  );
}
