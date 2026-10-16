import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { seed } from "@/content/seed";
import { env } from "./env";
import { createPublicClient } from "./supabase/public";
import type { Section, SectionKey, SiteContent } from "./types";

export const CONTENT_TAG = "content";

const COLS = {
  site_settings:
    "site_title, site_description, brand, nav_cta_label, nav_cta_href, footer_copyright, cv_label, cv_path",
  hero: "tag_text, tag_color, title, lead, note, btn1_label, btn1_href, btn2_label, btn2_href, sticker_text, window_title, window_button",
  sections: "key, nav_label, eyebrow, heading, intro, note",
  stack_items: "id, position, visible, label",
  services: "id, position, visible, title, body, color",
  journey_steps: "id, position, visible, tag_label, tag_color, title, body",
  projects: "id, position, visible, title, description, tag_label, tag_color, github_url, status, catatan_status",
  social_links: "id, position, visible, label, url",
} as const;

/** Konten publik: hanya item tampil, terurut. Di-cache sampai admin menyimpan (updateTag). */
export async function getContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);

  if (!env.hasSupabase()) {
    console.warn("[content] Supabase belum dikonfigurasi, memakai isi seed.");
    return seed;
  }
  const c = await loadContent(createPublicClient());
  // RLS sudah menyaring untuk peran anon; filter ulang agar jalur publik tidak bergantung padanya saja.
  const shown = <T extends { visible: boolean }>(xs: T[]) => xs.filter((x) => x.visible);
  return {
    ...c,
    stack: shown(c.stack),
    services: shown(c.services),
    journey: shown(c.journey),
    projects: shown(c.projects),
    socials: shown(c.socials),
  };
}

/** Semua konten termasuk yang disembunyikan (RLS admin). */
export function getAdminContent(supabase: SupabaseClient) {
  return loadContent(supabase);
}

async function loadContent(db: SupabaseClient): Promise<SiteContent> {
  const list = (table: keyof typeof COLS) =>
    db.from(table).select(COLS[table]).order("position").order("created_at");

  const [settings, hero, sections, stack, services, journey, projects, socials] = await Promise.all([
    db.from("site_settings").select(COLS.site_settings).single(),
    db.from("hero").select(COLS.hero).single(),
    db.from("sections").select(COLS.sections),
    list("stack_items"),
    list("services"),
    list("journey_steps"),
    list("projects"),
    list("social_links"),
  ]);

  for (const r of [settings, hero, sections, stack, services, journey, projects, socials]) {
    if (r.error) throw new Error(`Gagal memuat konten: ${r.error.message}`);
  }

  const sectionMap = Object.fromEntries(
    (sections.data as unknown as Section[]).map((s) => [s.key, s]),
  ) as Record<SectionKey, Section>;

  return {
    settings: settings.data,
    hero: hero.data,
    sections: sectionMap,
    stack: stack.data,
    services: services.data,
    journey: journey.data,
    projects: projects.data,
    socials: socials.data,
  } as unknown as SiteContent;
}

export function cvPublicUrl(path: string) {
  return `${env.supabaseUrl()}/storage/v1/object/public/cv/${encodeURIComponent(path)}`;
}
