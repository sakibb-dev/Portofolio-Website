import { PROJECT_STATUS_LABEL, type Project, type Section } from "@/lib/types";
import { colorClass, pad2, withBreaks } from "@/lib/text";
import { SECTION_ANCHORS } from "./anchors";
import { CursorLabel } from "./CursorLabel";

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
                  {p.catatan_status && <p className="row__note">{p.catatan_status}</p>}
                </div>
                <div className="row__tags">
                  <span className={colorClass("nb-tag", p.tag_color)}>{p.tag_label}</span>
                  <span className={colorClass("nb-tag", p.status === "public" ? "mint" : "netral")}>
                    {PROJECT_STATUS_LABEL[p.status]}
                  </span>
                </div>
              </>
            );
            // Hanya proyek Open source yang punya URL GitHub (dijaga juga oleh constraint DB).
            return p.status === "public" && p.github_url ? (
              <a
                key={p.id}
                className="row"
                data-reveal
                href={p.github_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
                <span className="nb-tag nb-tag--tomato row__focus" aria-hidden="true">
                  Click me
                </span>
              </a>
            ) : (
              <div key={p.id} className="row" data-reveal>
                {inner}
              </div>
            );
          })}
        </div>
        <CursorLabel />
        {section.note && <p className="note work-note">{section.note}</p>}
      </div>
    </section>
  );
}
