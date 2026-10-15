import { ItemsManager } from "@/components/admin/ItemsManager";
import { PageHead } from "@/components/admin/PageHead";
import { requireAdmin } from "@/lib/auth";
import { getAdminContent } from "@/lib/content";

export default async function StackAdmin() {
  const { stack } = await getAdminContent(await requireAdmin());
  return (
    <>
      <PageHead eyebrow="Section" title="Pita stack">
        Teks berjalan berwarna kuning di bawah hero.
      </PageHead>
      <ItemsManager table="stack_items" items={stack} titleKey="label" noun="item" />
    </>
  );
}
