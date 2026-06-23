import Link from "next/link";

type AdminSearchToolbarProps = {
  action: string;
  query: string;
  placeholder?: string;
  hiddenFields?: Record<string, string | undefined>;
  children?: React.ReactNode;
};

export default function AdminSearchToolbar({
  action,
  query,
  placeholder = "ค้นหา",
  hiddenFields,
  children,
}: AdminSearchToolbarProps) {
  const clearParams = new URLSearchParams();

  Object.entries(hiddenFields ?? {}).forEach(([key, value]) => {
    if (value) {
      clearParams.set(key, value);
    }
  });

  const clearHref = `${action}${clearParams.toString() ? `?${clearParams}` : ""}`;

  return (
    <div className="admin-list-toolbar">
      <form action={action} className="admin-search" method="get">
        {Object.entries(hiddenFields ?? {}).map(([key, value]) =>
          value ? <input key={key} type="hidden" name={key} value={value} /> : null,
        )}
        <input
          aria-label={placeholder}
          className="form-control form-control-sm"
          defaultValue={query}
          name="q"
          placeholder={placeholder}
          type="search"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          ค้นหา
        </button>
        {query ? (
          <Link href={clearHref} className="btn btn-outline-secondary btn-sm">
            ล้าง
          </Link>
        ) : null}
      </form>
      {children}
    </div>
  );
}
