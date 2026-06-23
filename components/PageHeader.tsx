type PageHeaderProps = {
  eyebrow: string;
  title: string;
  badge?: string;
};

export default function PageHeader({ eyebrow, title, badge }: PageHeaderProps) {
  return (
    <section className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {badge ? <span className="role-badge">{badge}</span> : null}
    </section>
  );
}
