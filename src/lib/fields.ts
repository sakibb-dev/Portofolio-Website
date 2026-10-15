import { z } from "zod";
import { NB_COLORS } from "./types";

/**
 * Satu definisi field → form admin (label, maxLength, petunjuk) dan validasi zod di server.
 * Batas panjang harus sama dengan check constraint di supabase/migrations/*_schema.sql.
 */
export type FieldKind =
  | "line" // teks satu baris
  | "lines" // teks dengan baris baru (maks `rows` baris)
  | "paragraph" // teks panjang satu paragraf (baris baru dibuang)
  | "href" // #anchor, /path, https://, mailto:
  | "https" // URL https:// opsional
  | "color";

export type Field = {
  name: string;
  label: string;
  kind: FieldKind;
  max?: number;
  optional?: boolean;
  rows?: number;
  hint?: string;
};

const HREF_RE = /^(#[\w-]*|\/[^\s]*|https?:\/\/[^\s]+|mailto:[^\s]+)$/i;

function fieldSchema(f: Field) {
  if (f.kind === "color") return z.enum(NB_COLORS, { error: "Pilih warna dari daftar." });

  const normalize = (v: string) => {
    const t = v.replace(/\r\n?/g, "\n").trim();
    if (f.kind === "paragraph") return t.replace(/\s*\n+\s*/g, " ");
    if (f.kind === "lines") return t.split("\n").map((l) => l.trim()).join("\n");
    return t;
  };

  let out = z
    .string()
    .transform(normalize)
    .refine((v) => f.optional || v.length > 0, "Wajib diisi.")
    .refine((v) => v.length <= (f.max ?? 300), `Maksimal ${f.max ?? 300} karakter.`)
    .refine((v) => !/[\u0000-\u0008\u000b-\u001f\u007f]/.test(v), "Karakter tidak valid.");

  if (f.kind !== "lines" && f.kind !== "paragraph")
    out = out.refine((v) => !v.includes("\n"), "Harus satu baris.");
  if (f.kind === "lines")
    out = out.refine((v) => v.split("\n").length <= (f.rows ?? 3), `Maksimal ${f.rows ?? 3} baris.`);
  if (f.kind === "href")
    out = out.refine((v) => v === "" || HREF_RE.test(v), "Pakai #bagian, /halaman, https://… atau mailto:…");
  if (f.kind === "https")
    out = out.refine((v) => v === "" || /^https:\/\/[^\s]+$/i.test(v), "Harus diawali https://");
  return out;
}

export function schemaFor(fields: Field[]) {
  return z.object(Object.fromEntries(fields.map((f) => [f.name, fieldSchema(f)])));
}

export function parseForm(fields: Field[], form: FormData) {
  const raw = Object.fromEntries(fields.map((f) => [f.name, String(form.get(f.name) ?? "")]));
  return schemaFor(fields).safeParse(raw);
}

export type FieldErrors = Record<string, string>;

export function flatErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    out[key] ??= issue.message;
  }
  return out;
}

// ---------- Definisi per bagian ----------

export const SETTINGS_FIELDS: Field[] = [
  { name: "site_title", label: "Judul situs (tab & SEO)", kind: "line", max: 70 },
  { name: "site_description", label: "Deskripsi (SEO & Open Graph)", kind: "paragraph", max: 160 },
  { name: "brand", label: "Nama logo & kata besar footer", kind: "line", max: 16 },
  { name: "nav_cta_label", label: "Tombol navigasi: teks", kind: "line", max: 24 },
  { name: "nav_cta_href", label: "Tombol navigasi: tautan", kind: "href", max: 200 },
  { name: "cv_label", label: "Teks tautan CV di footer", kind: "line", max: 20 },
];

export const FOOTER_FIELDS: Field[] = [
  { name: "footer_copyright", label: "Teks hak cipta", kind: "line", max: 80 },
];

export const HERO_FIELDS: Field[] = [
  { name: "tag_text", label: "Tag status", kind: "line", max: 40 },
  { name: "tag_color", label: "Warna tag status", kind: "color" },
  {
    name: "title",
    label: "Judul",
    kind: "line",
    max: 60,
    hint: "Apit kata yang disorot dengan bintang, misal: Halo, saya *Sakippp.*",
  },
  { name: "lead", label: "Paragraf pembuka", kind: "paragraph", max: 280 },
  { name: "note", label: "Catatan kecil di bawah tombol", kind: "line", max: 140, optional: true },
  { name: "btn1_label", label: "Tombol 1: teks", kind: "line", max: 24 },
  { name: "btn1_href", label: "Tombol 1: tautan", kind: "href", max: 200 },
  { name: "btn2_label", label: "Tombol 2: teks", kind: "line", max: 24 },
  { name: "btn2_href", label: "Tombol 2: tautan", kind: "href", max: 200 },
  { name: "sticker_text", label: "Ilustrasi: stiker", kind: "line", max: 24 },
  { name: "window_title", label: "Ilustrasi: judul jendela", kind: "line", max: 20 },
  { name: "window_button", label: "Ilustrasi: tombol jendela", kind: "line", max: 16 },
];

const SECTION_BASE: Field[] = [
  { name: "nav_label", label: "Label di navigasi", kind: "line", max: 16 },
  { name: "eyebrow", label: "Label kecil (eyebrow)", kind: "line", max: 32 },
  {
    name: "heading",
    label: "Judul",
    kind: "lines",
    max: 64,
    rows: 3,
    hint: "Tekan Enter untuk pindah baris (maks 3 baris).",
  },
];

export const SECTION_FIELDS = {
  about: [...SECTION_BASE, { name: "intro", label: "Teks samping judul", kind: "paragraph", max: 240, optional: true }],
  journey: [...SECTION_BASE, { name: "intro", label: "Teks samping judul", kind: "paragraph", max: 240, optional: true }],
  projects: [
    ...SECTION_BASE,
    { name: "intro", label: "Teks samping judul", kind: "paragraph", max: 240, optional: true },
    { name: "note", label: "Catatan di bawah daftar", kind: "line", max: 160, optional: true },
  ],
  contact: [...SECTION_BASE, { name: "intro", label: "Paragraf", kind: "paragraph", max: 240, optional: true }],
} satisfies Record<string, Field[]>;

export const ITEM_FIELDS = {
  stack_items: [{ name: "label", label: "Teks", kind: "line", max: 24 }],
  services: [
    { name: "title", label: "Judul kartu", kind: "line", max: 40 },
    { name: "body", label: "Isi", kind: "paragraph", max: 220 },
    { name: "color", label: "Warna kartu", kind: "color" },
  ],
  journey_steps: [
    { name: "tag_label", label: "Tag", kind: "line", max: 16 },
    { name: "tag_color", label: "Warna tag", kind: "color" },
    { name: "title", label: "Judul", kind: "line", max: 40 },
    { name: "body", label: "Isi", kind: "paragraph", max: 180 },
  ],
  projects: [
    { name: "title", label: "Nama proyek", kind: "line", max: 64 },
    { name: "description", label: "Deskripsi", kind: "paragraph", max: 220 },
    { name: "tag_label", label: "Tag", kind: "line", max: 16 },
    { name: "tag_color", label: "Warna tag", kind: "color" },
    {
      name: "github_url",
      label: "URL GitHub",
      kind: "https",
      max: 300,
      optional: true,
      hint: "Kosongkan jika tidak ada; baris tidak akan jadi tautan.",
    },
  ],
  social_links: [
    { name: "label", label: "Teks", kind: "line", max: 20 },
    { name: "url", label: "Tautan", kind: "href", max: 300, hint: "https://…, mailto:… atau #kontak" },
  ],
} satisfies Record<string, Field[]>;

export type ItemTable = keyof typeof ITEM_FIELDS;
export const ITEM_TABLES = Object.keys(ITEM_FIELDS) as ItemTable[];

/** Batas jumlah item yang tampil agar layout tetap rapi. */
export const VISIBLE_LIMITS: Partial<Record<ItemTable, { min: number; max: number }>> = {
  journey_steps: { min: 2, max: 8 },
};

export const COLOR_LABELS: Record<(typeof NB_COLORS)[number], string> = {
  yellow: "Kuning",
  mint: "Mint",
  tomato: "Tomat",
  cobalt: "Kobalt",
  netral: "Netral (putih)",
};
