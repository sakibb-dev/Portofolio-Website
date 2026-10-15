import type { Section, Service } from "@/lib/types";
import { colorClass, pad2, withBreaks } from "@/lib/text";
import { SECTION_ANCHORS } from "./anchors";

export function Services({ section, items }: { section: Section; items: Service[] }) {
  return (
    <section id={SECTION_ANCHORS.about} className="sec" style={{ borderTop: 0 }}>
      <div className="wrap">
        <div className="sec-head">
          <div>
            <p className="nb-eyebrow">{section.eyebrow}</p>
            <h2>{withBreaks(section.heading)}</h2>
          </div>
          {section.intro && <p style={{ maxWidth: "28em" }}>{section.intro}</p>}
        </div>
        <div className="cards">
          {items.map((item, i) => (
            <article key={item.id} className={colorClass("nb-card", item.color)} data-reveal>
              <p className="nb-card__index">{pad2(i + 1)}</p>
              <h3 className="nb-card__title">{item.title}</h3>
              <p className="nb-card__text">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
