"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export const ADMIN_MENU = [
  { href: "/admin/inbox", label: "Kotak masuk" },
  { href: "/admin/hero", label: "Hero" },
  { href: "/admin/stack", label: "Pita stack" },
  { href: "/admin/layanan", label: "Yang saya kerjakan" },
  { href: "/admin/perjalanan", label: "Perjalanan" },
  { href: "/admin/proyek", label: "Proyek" },
  { href: "/admin/kontak", label: "Kontak" },
  { href: "/admin/footer", label: "Footer & sosial" },
  { href: "/admin/pengaturan", label: "Pengaturan situs" },
];

/** Menu dengan penanda halaman aktif (butuh URL saat runtime → dibungkus Suspense). */
export function AdminMenu({ badge }: { badge: ReactNode }) {
  return <AdminMenuList badge={badge} path={usePathname()} />;
}

export function AdminMenuList({ badge, path = "" }: { badge: ReactNode; path?: string }) {
  return (
    <ul className="adm-menu">
      {ADMIN_MENU.map((m) => (
        <li key={m.href}>
          <Link href={m.href} aria-current={path.startsWith(m.href) ? "page" : undefined}>
            {m.label}
            {m.href === "/admin/inbox" && badge}
          </Link>
        </li>
      ))}
    </ul>
  );
}
