/**
 * Buat supabase/migrations/…_seed.sql dari src/content/seed.ts (satu sumber isi).
 *   npm run gen:seed
 */
import { writeFileSync } from "node:fs";
import { seed } from "../src/content/seed";

const q = (v: string | null) => (v === null ? "null" : `'${v.replace(/'/g, "''")}'`);
const lit = (v: unknown) =>
  typeof v === "boolean" || typeof v === "number" ? String(v) : q(v as string | null);

function insert(table: string, rows: Record<string, unknown>[]) {
  const cols = Object.keys(rows[0]);
  const values = rows.map((r) => `  (${cols.map((c) => lit(r[c])).join(", ")})`).join(",\n");
  return `insert into public.${table} (${cols.join(", ")}) values\n${values};\n`;
}

const omitId = <T extends { id: string }>(row: T) => {
  const rest: Partial<T> = { ...row };
  delete rest.id;
  return rest as Record<string, unknown>;
};

const s = seed.settings;
const sql = [
  "-- DIBUAT OTOMATIS oleh scripts/gen-seed-sql.ts dari src/content/seed.ts. Jangan edit manual.\n",
  insert("site_settings", [
    {
      site_title: s.site_title,
      site_description: s.site_description,
      brand: s.brand,
      nav_cta_label: s.nav_cta_label,
      nav_cta_href: s.nav_cta_href,
      footer_copyright: s.footer_copyright,
      cv_label: s.cv_label,
    },
  ]),
  insert("hero", [{ ...seed.hero }]),
  insert("sections", Object.values(seed.sections)),
  insert("stack_items", seed.stack.map(omitId)),
  insert("services", seed.services.map(omitId)),
  insert("journey_steps", seed.journey.map(omitId)),
  insert("projects", seed.projects.map(omitId)),
  insert("social_links", seed.socials.map(omitId)),
].join("\n");

writeFileSync("supabase/migrations/20261015000003_seed.sql", sql);
console.log("seed SQL ditulis.");
