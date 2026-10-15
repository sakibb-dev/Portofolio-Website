import type { Section } from "@/lib/types";
import { withBreaks } from "@/lib/text";
import { SECTION_ANCHORS } from "./anchors";
import { ContactForm } from "./ContactForm";

export function Contact({ section }: { section: Section }) {
  return (
    <section id={SECTION_ANCHORS.contact} className="sec">
      <div className="wrap contact">
        <div className="nb-card nb-card--yellow" data-reveal>
          <p className="nb-eyebrow">{section.eyebrow}</p>
          <h2>{withBreaks(section.heading)}</h2>
          {section.intro && (
            <p className="lead" style={{ margin: "var(--space-4) 0 0" }}>
              {section.intro}
            </p>
          )}
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
