import { requireAdmin } from "@/lib/auth";

export async function UnreadBadge() {
  const supabase = await requireAdmin();
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);
  if (!count) return null;
  return (
    <span className="nb-tag nb-tag--tomato" aria-label={`${count} belum dibaca`}>
      {count}
    </span>
  );
}
