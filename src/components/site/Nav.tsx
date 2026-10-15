import type { SiteContent } from "@/lib/types";
import { SECTION_ANCHORS } from "./anchors";
import { NavLinks } from "./NavLinks";

export function Nav({ settings, sections }: Pick<SiteContent, "settings" | "sections">) {
  const links = (["about", "journey", "projects", "contact"] as const).map((key) => ({
    id: SECTION_ANCHORS[key],
    label: sections[key].nav_label,
  }));

  return (
    <header className="nb-nav">
      <a className="skip-link" href="#konten">
        Lewati ke konten
      </a>
      <a className="nb-logo" href="#">
        <span className="nb-logo__mark"></span>
        {settings.brand}
      </a>
      <NavLinks links={links} />
      <a className="nb-btn nb-btn--sm nb-btn--tomato" href={settings.nav_cta_href}>
        {settings.nav_cta_label}
      </a>
    </header>
  );
}
