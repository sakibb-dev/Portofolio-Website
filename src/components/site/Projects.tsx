import type { Project, Section } from "@/lib/types";
import { colorClass, pad2, withBreaks } from "@/lib/text";
import { SECTION_ANCHORS } from "./anchors";

export function Projects({ section, projects }: { section: Section; projects: Project[] }) {
  return (
    <section id={SECTION_ANCHORS.projects} className="sec">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <p className="nb-eyebrow">{section.eyebrow}</p>
            <h2>{withBreaks(section.heading)}</h2>
          </div>
          {section.intro && <p style={{ maxWidth: "28em" }}>{section.intro}</p>}
        </div>
        <div className="work">
          {projects.map((p, i) => {
            const inner = (
              <>
                <span className="row__n">{pad2(i + 1)}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                </div>
                <span className={colorClass("nb-tag", p.tag_color)}>{p.tag_label}</span>
              </>
            );
            return p.github_url ? (
              <a
                key={p.id}
                className="row"
                href={p.github_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
              </a>
            ) : (
              <div key={p.id} className="row">
                {inner}
              </div>
            );
          })}
        </div>
        {section.note && <p className="note work-note">{section.note}</p>}
      </div>
    </section>
  );
}
