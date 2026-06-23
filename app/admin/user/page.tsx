import Link from "next/link";
import UserForm from "@/components/UserForm";
import UserTable from "@/components/UserTable";
import type { Role } from "@/lib/types";
import { requireRole } from "@/services/auth-service";
import { listUsersForAdmin } from "@/services/user-service";

type UserTab = Role | "all";

const tabs: Array<{ label: string; value: UserTab }> = [
  { label: "ทั้งหมด", value: "all" },
  { label: "Requester", value: "requester" },
  { label: "Approver", value: "approver" },
  { label: "Admin", value: "admin" },
];

function tabFromValue(value?: string | string[]): UserTab {
  const raw = Array.isArray(value) ? value[0] : value;

  if (raw === "requester" || raw === "approver" || raw === "admin") {
    return raw;
  }

  return "all";
}

function queryFromValue(value?: string | string[]) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function hrefForTab(tab: UserTab, query: string) {
  const params = new URLSearchParams();

  if (tab !== "all") {
    params.set("role", tab);
  }

  if (query) {
    params.set("q", query);
  }

  const queryString = params.toString();
  return `/admin/user${queryString ? `?${queryString}` : ""}`;
}

export default async function AdminUserPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string | string[]; q?: string | string[] }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const activeTab = tabFromValue(params.role);
  const query = queryFromValue(params.q);
  const users = await listUsersForAdmin({ role: activeTab, query });

  return (
    <div className="page-shell">
      <div className="row g-3">
        <div className="col-sm-12 col-lg-4">
          <UserForm />
        </div>
        <div className="col-sm-12 col-lg-8">
          <section className="content-panel">
            <div className="user-toolbar">
              <div className="user-tabs" role="tablist" aria-label="User role tabs">
                {tabs.map((tab) => (
                  <Link
                    aria-selected={activeTab === tab.value}
                    className={`user-tab ${activeTab === tab.value ? "active" : ""}`}
                    href={hrefForTab(tab.value, query)}
                    key={tab.value}
                    role="tab"
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>

              <form action="/admin/user" className="user-search" method="get">
                {activeTab !== "all" ? (
                  <input type="hidden" name="role" value={activeTab} />
                ) : null}
                <input
                  aria-label="ค้นหาผู้ใช้"
                  className="form-control form-control-sm"
                  defaultValue={query}
                  name="q"
                  placeholder="ค้นหาชื่อหรือ email"
                  type="search"
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  ค้นหา
                </button>
                {query ? (
                  <Link
                    className="btn btn-outline-secondary btn-sm"
                    href={hrefForTab(activeTab, "")}
                  >
                    ล้าง
                  </Link>
                ) : null}
              </form>
            </div>

            <UserTable users={users} />
          </section>
        </div>
      </div>
    </div>
  );
}
