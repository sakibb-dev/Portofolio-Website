import type { SiteContent } from "@/lib/types";
import { SECTION_ANCHORS } from "./anchors";

export function Nav({ settings, sections }: Pick<SiteContent, "settings" | "sections">) {
  const links = (["about", "journey", "projects", "contact"] as const).map((key) => ({
    href: `#${SECTION_ANCHORS[key]}`,
    label: sections[key].nav_label,
  }));

  return (
    <header className="nb-nav">
      <a className="nb-logo" href="#">
        <span className="nb-logo__mark"></span>
        {settings.brand}
      </a>
      <ul className="nb-nav__links">
        {links.map((l, i) => (
          <li key={l.href}>
            <a href={l.href} aria-current={i === 0 ? "page" : undefined}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
      <a className="nb-btn nb-btn--sm nb-btn--tomato" href={settings.nav_cta_href}>
        {settings.nav_cta_label}
      </a>
    </header>
  );
}
