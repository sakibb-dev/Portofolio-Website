import { saveSingleton } from "@/app/admin/actions";
import { CvManager } from "@/components/admin/CvManager";
import { FieldsForm } from "@/components/admin/FieldsForm";
import { PageHead } from "@/components/admin/PageHead";
import { requireAdmin } from "@/lib/auth";
import { cvPublicUrl, getAdminContent } from "@/lib/content";
import { SETTINGS_FIELDS } from "@/lib/fields";

export default async function SettingsAdmin() {
  const { settings } = await getAdminContent(await requireAdmin());
  return (
    <>
      <PageHead eyebrow="Situs" title="Pengaturan situs" />
      <div className="nb-card">
        <FieldsForm fields={SETTINGS_FIELDS} values={settings} action={saveSingleton.bind(null, "settings")} />
      </div>
      <div className="nb-card adm-block">
        <h2>CV (PDF)</h2>
        <CvManager currentUrl={settings.cv_path ? cvPublicUrl(settings.cv_path) : null} />
      </div>
    </>
  );
}
