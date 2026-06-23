import Link from "next/link";
import { logoutAction } from "@/actions/auth-actions";
import {
  getAdminMenuByRole,
  getMenuByRole,
  getSession,
} from "@/services/auth-service";

export default async function Navbar() {
  const session = await getSession();
  const navItems = [
    ...getMenuByRole(session?.role),
    ...getAdminMenuByRole(session?.role),
  ];

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top app-navbar">
      <div className="container-fluid px-3 px-lg-4">
        <Link href="/" className="navbar-brand fw-bold text-primary">
          lptrade.co
        </Link>

        <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3 w-100">
          <ul className="navbar-nav flex-row flex-wrap gap-1 me-lg-auto">
            {navItems.map((item) => (
              <li className="nav-item" key={item.href}>
                <Link href={item.href} className="nav-link px-3">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-2 ms-lg-auto">
            {session ? (
              <>
                <span className="badge text-bg-primary text-uppercase">
                  {session.role}
                </span>
                <span className="small text-secondary d-none d-md-inline">
                  {session.name}
                </span>
                <form action={logoutAction}>
                  <button type="submit" className="btn btn-outline-dark btn-sm">
                    ออก
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="btn btn-primary btn-sm">
                เข้า
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
