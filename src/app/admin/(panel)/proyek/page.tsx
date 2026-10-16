import { ItemsManager } from "@/components/admin/ItemsManager";
import { PageHead } from "@/components/admin/PageHead";
import { SectionForm } from "@/components/admin/SectionForm";
import { requireAdmin } from "@/lib/auth";
import { getAdminContent } from "@/lib/content";

export default async function ProjectsAdmin() {
  const { sections, projects } = await getAdminContent(await requireAdmin());
  return (
    <>
      <PageHead eyebrow="Section 03" title="Proyek">
        Open source wajib punya URL GitHub dan barisnya jadi tautan (tab baru). Private tidak boleh punya URL GitHub.
      </PageHead>
      <SectionForm sectionKey="projects" section={sections.projects} />
      <h2>Daftar proyek</h2>
      <ItemsManager table="projects" items={projects} titleKey="title" noun="proyek" />
    </>
  );
}
