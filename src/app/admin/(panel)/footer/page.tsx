import { saveSingleton } from "@/app/admin/actions";
import { FieldsForm } from "@/components/admin/FieldsForm";
import { ItemsManager } from "@/components/admin/ItemsManager";
import { PageHead } from "@/components/admin/PageHead";
import { requireAdmin } from "@/lib/auth";
import { getAdminContent } from "@/lib/content";
import { FOOTER_FIELDS } from "@/lib/fields";

export default async function FooterAdmin() {
  const { settings, socials } = await getAdminContent(await requireAdmin());
  return (
    <>
      <PageHead eyebrow="Footer" title="Footer & sosial">
        Kata besar di footer memakai nama logo dari Pengaturan situs. Tautan CV muncul otomatis bila CV diunggah.
      </PageHead>
      <div className="nb-card">
        <FieldsForm fields={FOOTER_FIELDS} values={settings} action={saveSingleton.bind(null, "footer")} />
      </div>
      <h2>Tautan sosial</h2>
      <ItemsManager table="social_links" items={socials} titleKey="label" noun="tautan" />
    </>
  );
}
