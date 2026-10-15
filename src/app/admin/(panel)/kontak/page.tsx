import { PageHead } from "@/components/admin/PageHead";
import { SectionForm } from "@/components/admin/SectionForm";
import { requireAdmin } from "@/lib/auth";
import { getAdminContent } from "@/lib/content";

export default async function ContactAdmin() {
  const { sections } = await getAdminContent(await requireAdmin());
  return (
    <>
      <PageHead eyebrow="Section 04" title="Kontak">
        Teks kartu kuning di sebelah kiri form. Pesan yang masuk ada di Kotak masuk.
      </PageHead>
      <SectionForm sectionKey="contact" section={sections.contact} />
    </>
  );
}
