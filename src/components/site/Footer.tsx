import { Fragment } from "react";
import type { SiteContent } from "@/lib/types";

export function Footer({ settings, socials }: Pick<SiteContent, "settings" | "socials">) {
  const links = socials.map((s) => ({ key: s.id, label: s.label, href: s.url }));
  if (settings.cv_path) links.push({ key: "cv", label: settings.cv_label, href: "/cv" });

  return (
    <footer>
      <div className="wrap">
        <div className="foot__word">{settings.brand}</div>
        <div className="foot__row">
          <span>{settings.footer_copyright}</span>
          <span>
            {links.map((l, i) => (
              <Fragment key={l.key}>
                {i > 0 && " \u00a0 "}
                <a href={l.href}>{l.label}</a>
              </Fragment>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
