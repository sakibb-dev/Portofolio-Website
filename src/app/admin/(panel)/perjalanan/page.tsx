import { ItemsManager } from "@/components/admin/ItemsManager";
import { PageHead } from "@/components/admin/PageHead";
import { SectionForm } from "@/components/admin/SectionForm";
import { requireAdmin } from "@/lib/auth";
import { getAdminContent } from "@/lib/content";

export default async function JourneyAdmin() {
  const { sections, journey } = await getAdminContent(await requireAdmin());
  return (
    <>
      <PageHead eyebrow="Section 02" title="Perjalanan" />
      <SectionForm sectionKey="journey" section={sections.journey} />
      <h2>Langkah</h2>
      <ItemsManager table="journey_steps" items={journey} titleKey="title" noun="langkah" />
    </>
  );
}
