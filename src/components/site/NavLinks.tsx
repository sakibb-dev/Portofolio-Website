"use client";

import { useEffect, useState } from "react";

/** Tautan navigasi; penanda aktif mengikuti bagian yang sedang di tengah layar. */
export function NavLinks({ links }: { links: { id: string; label: string }[] }) {
  const [active, setActive] = useState(links[0]?.id);

  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [links]);

  return (
    <ul className="nb-nav__links">
      {links.map((l) => (
        <li key={l.id}>
          <a href={`#${l.id}`} aria-current={active === l.id ? "location" : undefined}>
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
