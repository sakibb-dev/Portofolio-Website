import { ImageResponse } from "next/og";
import { getContent } from "@/lib/content";

export const alt = "Portofolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Warna dari token desain.
const C = { paper: "#f4efe6", ink: "#111111", yellow: "#ffd60a", tomato: "#ff4d2e", cobalt: "#2f4bff" };

/** Bricolage Grotesque 800 (TTF) dari Google Fonts; null bila gagal → fon bawaan. */
async function displayFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800")
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OgImage() {
  const [{ settings, hero }, font] = await Promise.all([getContent(), displayFont()]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: C.paper,
          color: C.ink,
          border: `12px solid ${C.ink}`,
          fontFamily: "Bricolage Grotesque",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 56, height: 56, background: C.tomato, border: `6px solid ${C.ink}`, boxShadow: `6px 6px 0 ${C.ink}` }} />
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2 }}>{settings.brand}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>{settings.site_title}</div>
          <div style={{ display: "flex" }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                padding: "8px 24px",
                background: C.yellow,
                border: `4px solid ${C.ink}`,
                borderRadius: 999,
                textTransform: "uppercase",
              }}
            >
              {hero.tag_text}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Bricolage Grotesque", data: font, weight: 800, style: "normal" }] : undefined,
    },
  );
}
