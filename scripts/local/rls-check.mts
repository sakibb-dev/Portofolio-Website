/** Uji RLS & storage terhadap Supabase lokal. Jalankan: npm run db:reset:local && npm run test:rls */
import { createClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";
const status = Object.fromEntries(
  execSync("npx supabase status -o env", { encoding: "utf8" })
    .split("\n")
    .map((l) => l.match(/^(\w+)="?([^"]*)"?$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => [m[1], m[2]]),
);
const URL = status.API_URL, KEY = status.PUBLISHABLE_KEY;
const mk = () => createClient(URL, KEY, { auth: { persistSession: false } });
let fail = 0;
const check = (name: string, ok: boolean, info: unknown = "") => { console.log(`${ok ? "✓" : "✗"} ${name}`, ok ? "" : JSON.stringify(info)); if (!ok) fail++; };

async function main() {
  const anon = mk();
  const user = mk(); const su = await user.auth.signInWithPassword({ email: "bukan-admin@example.com", password: "rahasia-lokal-123" });
  const admin = mk(); const sa = await admin.auth.signInWithPassword({ email: "admin@example.com", password: "rahasia-lokal-123" });
  if (su.error || sa.error) throw new Error(`login gagal: ${su.error?.message} ${sa.error?.message}`);
  check("is_admin() benar untuk admin", (await admin.rpc("is_admin")).data === true);
  check("is_admin() salah untuk non-admin", (await user.rpc("is_admin")).data === false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let r: any = await anon.from("projects").select("id,title,visible").order("position");
  check("anon baca 5 proyek", r.data?.length === 5, r);
  const firstId = r.data[0].id;

  r = await anon.from("messages").select("*"); check("anon tidak bisa baca messages", !!r.error || r.data.length === 0, r);
  r = await anon.from("messages").insert({ name: "x", contact: "x@x.co", body: "hello", ip_hash: "h" }); check("anon tidak bisa insert messages", !!r.error, r);
  r = await anon.from("admins").select("*"); check("anon tidak bisa baca admins", !!r.error || r.data.length === 0, r);
  r = await anon.from("hero").update({ title: "hacked" }).eq("id", 1).select(); check("anon tidak bisa ubah hero", !!r.error || r.data.length === 0, r);
  r = await user.from("hero").update({ title: "hacked" }).eq("id", 1).select(); check("user non-admin tidak bisa ubah hero", !!r.error || r.data.length === 0, r);
  r = await user.from("projects").insert({ title: "x", description: "x", tag_label: "x" }); check("user non-admin tidak bisa tambah proyek", !!r.error, r);
  r = await user.from("messages").select("*"); check("user non-admin tidak bisa baca messages", !!r.error || r.data.length === 0, r);
  r = await user.rpc("reorder_items", { tbl: "projects", ids: [firstId] });
  r = await anon.from("projects").select("id").order("position"); check("reorder oleh non-admin tidak berefek", r.data[0].id === firstId, r);

  r = await admin.from("projects").update({ visible: false }).eq("id", firstId).select(); check("admin bisa sembunyikan proyek", r.data?.length === 1, r);
  r = await anon.from("projects").select("id"); check("anon kini hanya lihat 4 proyek", r.data?.length === 4, r);
  r = await admin.from("projects").select("id"); check("admin tetap lihat 5 proyek", r.data?.length === 5, r);
  await admin.from("projects").update({ visible: true }).eq("id", firstId);

  r = await admin.from("hero").update({ tag_color: "ungu" }).eq("id", 1); check("warna di luar enum ditolak", !!r.error, r);
  r = await admin.from("services").update({ title: "x".repeat(41) }).neq("id", "00000000-0000-0000-0000-000000000000"); check("teks melebihi batas ditolak DB", !!r.error, r);
  r = await admin.from("projects").update({ github_url: "javascript:alert(1)" }).eq("id", firstId); check("github_url non-https ditolak DB", !!r.error, r);

  // Status proyek ↔ URL GitHub (migrasi …_project_status.sql)
  r = await anon.from("projects").select("status, catatan_status").order("position");
  check("anon baca status & catatan proyek (seed: semua private)", r.data?.every((p: { status: string }) => p.status === "private"), r);
  r = await admin.from("projects").update({ status: "public" }).eq("id", firstId); check("public tanpa URL GitHub ditolak DB", !!r.error, r);
  r = await admin.from("projects").update({ github_url: "https://github.com/a/b" }).eq("id", firstId); check("private dengan URL GitHub ditolak DB", !!r.error, r);
  r = await admin.from("projects").update({ status: "public", github_url: "https://github.com/a/b" }).eq("id", firstId).select(); check("public + URL GitHub diterima", r.data?.length === 1, r);
  r = await admin.from("projects").update({ status: "ungu" }).eq("id", firstId); check("status di luar enum ditolak", !!r.error, r);
  r = await admin.from("projects").update({ catatan_status: "x".repeat(121) }).eq("id", firstId); check("catatan status >120 ditolak DB", !!r.error, r);
  r = await admin.from("projects").update({ catatan_status: "baris\nbaru" }).eq("id", firstId); check("catatan status multi-baris ditolak DB", !!r.error, r);
  await admin.from("projects").update({ status: "private", github_url: "" }).eq("id", firstId);

  const pdf = new Blob(["%PDF-1.4\n%%EOF"], { type: "application/pdf" });
  r = await user.storage.from("cv").upload("cv-1.pdf", pdf, { contentType: "application/pdf" }); check("non-admin tidak bisa unggah CV", !!r.error, r);
  r = await admin.storage.from("cv").upload("cv-test.pdf", pdf, { contentType: "application/pdf" }); check("admin bisa unggah CV", !r.error, r);
  r = await admin.storage.from("cv").upload("x.png", new Blob(["x"], { type: "image/png" }), { contentType: "image/png" }); check("bucket cv menolak non-PDF", !!r.error, r);
  const res = await fetch(`${URL}/storage/v1/object/public/cv/cv-test.pdf`); check("CV bisa dibaca publik", res.status === 200, res.status);
  await admin.storage.from("cv").remove(["cv-test.pdf"]);
  process.exitCode = fail ? 1 : 0;
}
main();
