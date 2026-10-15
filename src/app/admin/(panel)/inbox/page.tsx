import Link from "next/link";
import { PageHead } from "@/components/admin/PageHead";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export default async function InboxPage() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("messages")
    .select("id, name, contact, body, created_at, read_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);

  const unread = data.filter((m) => !m.read_at).length;
  return (
    <>
      <PageHead eyebrow="Pesan" title="Kotak masuk">
        {data.length} pesan, {unread} belum dibaca.
      </PageHead>
      {data.length === 0 ? (
        <p className="nb-hint">Belum ada pesan.</p>
      ) : (
        <ul className="adm-inbox">
          {data.map((m) => (
            <li key={m.id}>
              <Link className="adm-msg" href={`/admin/inbox/${m.id}`} data-unread={!m.read_at}>
                <span className="adm-dot" data-on={!m.read_at} aria-label={m.read_at ? "Dibaca" : "Belum dibaca"} />
                <span style={{ minWidth: 0 }}>
                  <span className="adm-msg__name">{m.name}</span>
                  <span className="adm-msg__snip" style={{ display: "block" }}>
                    {m.contact} · {m.body}
                  </span>
                </span>
                <time className="adm-msg__time" dateTime={m.created_at}>
                  {formatDateTime(m.created_at)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
