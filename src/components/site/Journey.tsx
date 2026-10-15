import type { JourneyStep, Section } from "@/lib/types";
import { colorClass, withBreaks } from "@/lib/text";
import { SECTION_ANCHORS } from "./anchors";

export function Journey({ section, steps }: { section: Section; steps: JourneyStep[] }) {
  return (
    <section id={SECTION_ANCHORS.journey} className="sec proses">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <p className="nb-eyebrow">{section.eyebrow}</p>
            <h2>{withBreaks(section.heading)}</h2>
          </div>
          {section.intro && <p style={{ maxWidth: "28em" }}>{section.intro}</p>}
        </div>
        <div className="steps">
          {steps.map((step) => (
            <div key={step.id} className="step">
              <span className={colorClass("nb-tag", step.tag_color)}>{step.tag_label}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
