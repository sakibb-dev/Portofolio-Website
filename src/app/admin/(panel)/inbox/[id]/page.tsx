import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { MessageActions } from "@/components/admin/MessageActions";
import { PageHead } from "@/components/admin/PageHead";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export default async function MessagePage({ params }: PageProps<"/admin/inbox/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await requireAdmin();
  const { data: m } = await supabase
    .from("messages")
    .select("id, name, contact, body, created_at, read_at")
    .eq("id", id)
    .maybeSingle();
  if (!m) notFound();

  const replyHref = m.contact.includes("@")
    ? `mailto:${m.contact}`
    : `https://wa.me/${m.contact.replace(/\D/g, "").replace(/^0/, "62")}`;

  return (
    <>
      <p>
        <Link href="/admin/inbox" className="nb-btn nb-btn--sm nb-btn--plain">
          ← Kotak masuk
        </Link>
      </p>
      <PageHead eyebrow={m.read_at ? "Sudah dibaca" : "Belum dibaca"} title={m.name} />
      <div className="nb-card adm-block">
        <dl className="adm-meta">
          <dt>Kontak</dt>
          <dd>
            {m.contact} ·{" "}
            <a href={replyHref} target="_blank" rel="noopener noreferrer">
              balas
            </a>
          </dd>
          <dt>Waktu</dt>
          <dd>
            <time dateTime={m.created_at}>{formatDateTime(m.created_at)}</time>
          </dd>
        </dl>
        <p className="adm-body">{m.body}</p>
      </div>
      <MessageActions id={m.id} read={!!m.read_at} />
    </>
  );
}
