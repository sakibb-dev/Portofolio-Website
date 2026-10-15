import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { env } from "./env";
import { createSessionClient } from "./supabase/server";

export function isAdminEmail(email: unknown) {
  return typeof email === "string" && email.trim().toLowerCase() === env.adminEmail();
}

/** Wajib dipanggil di setiap halaman & server action admin. Mengembalikan klien bersesi. */
export async function requireAdmin() {
  // Selalu saat request: klien Supabase membaca waktu & sesi, jadi jangan ikut prerender.
  await connection();
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims || !isAdminEmail(data.claims.email)) redirect("/admin/login");
  return supabase;
}
