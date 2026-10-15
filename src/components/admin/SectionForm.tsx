import { saveSingleton } from "@/app/admin/actions";
import { SECTION_FIELDS } from "@/lib/fields";
import type { Section, SectionKey } from "@/lib/types";
import { FieldsForm } from "./FieldsForm";

/** Judul bagian (eyebrow, heading, teks) — dipakai di halaman tiap section. */
export function SectionForm({ sectionKey, section }: { sectionKey: SectionKey; section: Section }) {
  return (
    <div className="nb-card adm-block">
      <h2>Judul bagian</h2>
      <FieldsForm
        fields={SECTION_FIELDS[sectionKey]}
        values={section}
        action={saveSingleton.bind(null, `section:${sectionKey}`)}
      />
    </div>
  );
}
