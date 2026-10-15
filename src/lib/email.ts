import "server-only";
import { Resend } from "resend";
import { env } from "./env";

type NewMessage = { name: string; contact: string; body: string; id: string };

/** Notifikasi pesan baru ke ADMIN_EMAIL. Tidak pernah melempar: kegagalan hanya dicatat. */
export async function notifyNewMessage(m: NewMessage) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[email] RESEND_API_KEY belum diisi; notifikasi dilewati untuk pesan", m.id);
    return;
  }
  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const { error } = await new Resend(key).emails.send({
      from: process.env.RESEND_FROM || "Portofolio <onboarding@resend.dev>",
      to: env.adminEmail(),
      subject: `Pesan baru dari ${m.name}`,
      replyTo: m.contact.includes("@") ? m.contact : undefined,
      text: [
        `Nama: ${m.name}`,
        `Kontak: ${m.contact}`,
        "",
        m.body,
        "",
        site ? `Buka di admin: ${site}/admin/inbox/${m.id}` : "",
      ].join("\n"),
    });
    if (error) console.error("[email] Resend menolak notifikasi untuk pesan", m.id, error);
  } catch (err) {
    console.error("[email] Gagal mengirim notifikasi untuk pesan", m.id, err);
  }
}
