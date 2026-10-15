import { saveSingleton } from "@/app/admin/actions";
import { FieldsForm } from "@/components/admin/FieldsForm";
import { PageHead } from "@/components/admin/PageHead";
import { requireAdmin } from "@/lib/auth";
import { getAdminContent } from "@/lib/content";
import { HERO_FIELDS } from "@/lib/fields";

export default async function HeroAdmin() {
  const { hero } = await getAdminContent(await requireAdmin());
  return (
    <>
      <PageHead eyebrow="Section" title="Hero">
        Bagian teratas halaman: tag status, judul dengan kata sorotan, paragraf, dua tombol, dan teks ilustrasi.
      </PageHead>
      <div className="nb-card">
        <FieldsForm fields={HERO_FIELDS} values={hero} action={saveSingleton.bind(null, "hero")} />
      </div>
    </>
  );
}
