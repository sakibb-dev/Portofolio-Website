export function PageHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="adm-block">
      <div>
        <p className="nb-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {children && <p className="nb-hint">{children}</p>}
    </header>
  );
}
