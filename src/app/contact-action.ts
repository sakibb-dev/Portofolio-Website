"use server";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";
import { notifyNewMessage } from "@/lib/email";
import { env } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/service";

export type ContactValues = { nama: string; kontak: string; pesan: string };
export type ContactState = {
  ok?: boolean;
  message?: string;
  errors?: Partial<Record<keyof ContactValues, string>>;
  values?: ContactValues;
};

const RATE_LIMIT = { max: 3, windowMinutes: 10 };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s().-]{8,20}$/;

const schema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi.").max(80, "Nama maksimal 80 karakter."),
  kontak: z
    .string()
    .trim()
    .min(1, "Isi nomor WhatsApp atau email.")
    .max(120, "Maksimal 120 karakter.")
    .refine((v) => EMAIL_RE.test(v) || PHONE_RE.test(v), "Tulis nomor WhatsApp atau email yang valid."),
  pesan: z.string().trim().min(5, "Pesan terlalu pendek.").max(2000, "Pesan maksimal 2000 karakter."),
});

async function clientIpHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return createHmac("sha256", env.supabaseSecret()).update(ip).digest("hex");
}

export async function sendMessage(_: ContactState, form: FormData): Promise<ContactState> {
  const values: ContactValues = {
    nama: String(form.get("nama") ?? ""),
    kontak: String(form.get("kontak") ?? ""),
    pesan: String(form.get("pesan") ?? ""),
  };

  // Honeypot: manusia tidak melihat field ini. Bot yang mengisinya dianggap "berhasil" tanpa disimpan.
  if (String(form.get("website") ?? "") !== "") return { ok: true, message: "Terima kasih! Pesan terkirim." };

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const errors: ContactState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof ContactValues;
      errors[k] ??= issue.message;
    }
    return { errors, values };
  }

  const db = createServiceClient();
  const ipHash = await clientIpHash();
  const since = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60_000).toISOString();
  const { count, error: countError } = await db
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if (countError) {
    console.error("[contact] Gagal memeriksa rate limit", countError);
    return { message: "Pesan gagal dikirim. Coba lagi sebentar lagi.", values };
  }
  if ((count ?? 0) >= RATE_LIMIT.max) {
    return { message: "Terlalu banyak pesan. Coba lagi dalam beberapa menit.", values };
  }

  const { nama, kontak, pesan } = parsed.data;
  const { data, error } = await db
    .from("messages")
    .insert({ name: nama, contact: kontak, body: pesan, ip_hash: ipHash })
    .select("id")
    .single();
  if (error) {
    console.error("[contact] Gagal menyimpan pesan", error);
    return { message: "Pesan gagal dikirim. Coba lagi sebentar lagi.", values };
  }

  // Email dikirim setelah respons; gagal kirim tidak memengaruhi pesan yang sudah tersimpan.
  after(() => notifyNewMessage({ id: data.id, name: nama, contact: kontak, body: pesan }));

  return { ok: true, message: "Terima kasih! Pesan terkirim, saya akan segera membalas." };
}
