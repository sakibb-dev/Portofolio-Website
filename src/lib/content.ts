import { cacheLife, cacheTag } from "next/cache";
import { seed } from "@/content/seed";
import type { SiteContent } from "./types";

export const CONTENT_TAG = "content";

/** Konten publik (hanya item yang tampil, terurut). Tahap (a): dari seed. */
export async function getContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  return publicView(seed);
}

function publicView(c: SiteContent): SiteContent {
  const shown = <T extends { visible: boolean; position: number }>(xs: T[]) =>
    xs.filter((x) => x.visible).sort((a, b) => a.position - b.position);
  return {
    ...c,
    stack: shown(c.stack),
    services: shown(c.services),
    journey: shown(c.journey),
    projects: shown(c.projects),
    socials: shown(c.socials),
  };
}
