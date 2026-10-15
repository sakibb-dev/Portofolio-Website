import Link from "next/link";
import { Suspense } from "react";
import { AdminMenu, AdminMenuList } from "@/components/admin/AdminMenu";
import { UnreadBadge } from "@/components/admin/UnreadBadge";
import { logout } from "../actions";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm">
      <aside className="adm-side">
        <Link className="nb-logo" href="/admin">
          <span className="nb-logo__mark"></span>Admin
        </Link>
        <nav aria-label="Menu admin">
          <Suspense fallback={<AdminMenuList badge={null} />}>
            <AdminMenu
              badge={
                <Suspense fallback={null}>
                  <UnreadBadge />
                </Suspense>
              }
            />
          </Suspense>
        </nav>
        <div className="adm-side__foot">
          <a className="nb-btn nb-btn--sm nb-btn--plain" href="/" target="_blank" rel="noopener">
            Lihat situs ↗
          </a>
          <form action={logout}>
            <button className="nb-btn nb-btn--sm nb-btn--tomato" type="submit" style={{ width: "100%" }}>
              Keluar
            </button>
          </form>
        </div>
      </aside>
      <main className="adm-main">
        <Suspense fallback={<p className="note">Memuat…</p>}>{children}</Suspense>
      </main>
    </div>
  );
}
