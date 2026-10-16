/** Uji validasi zod (dipakai di form browser dan server action). Tanpa server: npm run test:fields */
import { parseItem } from "../../src/lib/fields";

let fail = 0;
const check = (n: string, ok: boolean, info: unknown = "") => {
  console.log(`${ok ? "✓" : "✗"} ${n}`, ok ? "" : JSON.stringify(info));
  if (!ok) fail++;
};
const form = (o: Record<string, string>) => {
  const d = new FormData();
  for (const [k, v] of Object.entries(o)) d.set(k, v);
  return d;
};
const base = { title: "Proyek", description: "Deskripsi.", tag_label: "Web", tag_color: "netral", catatan_status: "" };
const errorsOf = (o: Record<string, string>) => {
  const r = parseItem("projects", form({ ...base, ...o }));
  return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
};

check("private tanpa URL lolos", Object.keys(errorsOf({ status: "private", github_url: "" })).length === 0);
check("public + URL https lolos", Object.keys(errorsOf({ status: "public", github_url: "https://github.com/a/b" })).length === 0);
check("public tanpa URL ditolak di github_url", /wajib/.test(errorsOf({ status: "public", github_url: "" }).github_url ?? ""));
check("private + URL ditolak di github_url", /tidak boleh/.test(errorsOf({ status: "private", github_url: "https://github.com/a/b" }).github_url ?? ""));
check("status di luar pilihan ditolak", "status" in errorsOf({ status: "draft", github_url: "" }));
check("URL non-https ditolak", "github_url" in errorsOf({ status: "public", github_url: "http://github.com/a/b" }));
check("catatan 120 karakter lolos", Object.keys(errorsOf({ status: "private", github_url: "", catatan_status: "x".repeat(120) })).length === 0);
check("catatan 121 karakter ditolak", "catatan_status" in errorsOf({ status: "private", github_url: "", catatan_status: "x".repeat(121) }));
check("catatan multi-baris ditolak", "catatan_status" in errorsOf({ status: "private", github_url: "", catatan_status: "a\nb" }));
const both = errorsOf({ title: "", status: "private", github_url: "https://x.y" });
check("galat field & galat aturan muncul bersamaan", "title" in both && "github_url" in both, both);

process.exitCode = fail ? 1 : 0;
