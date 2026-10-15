import { ItemsManager } from "@/components/admin/ItemsManager";
import { PageHead } from "@/components/admin/PageHead";
import { SectionForm } from "@/components/admin/SectionForm";
import { requireAdmin } from "@/lib/auth";
import { getAdminContent } from "@/lib/content";

export default async function ServicesAdmin() {
  const { sections, services } = await getAdminContent(await requireAdmin());
  return (
    <>
      <PageHead eyebrow="Section 01" title="Yang saya kerjakan">
        Nomor kartu (01, 02, …) dan pola zigzag diatur otomatis dari urutan.
      </PageHead>
      <SectionForm sectionKey="about" section={sections.about} />
      <h2>Kartu</h2>
      <ItemsManager table="services" items={services} titleKey="title" noun="kartu" />
    </>
  );
}
