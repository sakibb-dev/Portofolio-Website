/**
 * Bandingkan halaman publik dengan design/index.html, piksel per piksel.
 *   npm run build && npm start   (terminal lain)
 *   npm run visual-diff           → hasil di .visual-diff/
 * Env: BASE_URL (default http://localhost:3000)
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, type Page } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = resolve(".visual-diff");
const WIDTHS = [1280, 390];

// Perubahan isi yang sudah disetujui; diterapkan ke desain agar diff hanya menangkap selisih tak disengaja.
const APPROVED_TEXT_CHANGES: [string, string][] = [
  [
    "Sebagian klien dirahasiakan. Tautan setiap proyek bisa kamu isi di atribut href.",
    "Sebagian klien dirahasiakan.",
  ],
];

const FREEZE = "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}";

async function settle(page: Page) {
  await page.addStyleTag({ content: FREEZE });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  let design = readFileSync(resolve("design/index.html"), "utf8");
  for (const [from, to] of APPROVED_TEXT_CHANGES) design = design.replace(from, to);

  const browser = await chromium.launch();
  let failed = false;

  for (const width of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();

    await page.setContent(design, { waitUntil: "networkidle" });
    await settle(page);
    const a = PNG.sync.read(await page.screenshot({ fullPage: true }));

    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await settle(page);
    const b = PNG.sync.read(await page.screenshot({ fullPage: true }));

    const w = Math.min(a.width, b.width);
    const h = Math.min(a.height, b.height);
    const crop = (img: PNG) => {
      const out = new PNG({ width: w, height: h });
      PNG.bitblt(img, out, 0, 0, w, h, 0, 0);
      return out;
    };
    const ca = crop(a);
    const cb = crop(b);
    const diff = new PNG({ width: w, height: h });
    const n = pixelmatch(ca.data, cb.data, diff.data, w, h, { threshold: 0.1 });

    writeFileSync(`${OUT}/${width}-design.png`, PNG.sync.write(a));
    writeFileSync(`${OUT}/${width}-app.png`, PNG.sync.write(b));
    writeFileSync(`${OUT}/${width}-diff.png`, PNG.sync.write(diff));

    const sizeNote =
      a.height !== b.height || a.width !== b.width
        ? ` UKURAN BEDA: desain ${a.width}x${a.height}, app ${b.width}x${b.height}`
        : "";
    console.log(`${width}px: ${n} piksel berbeda dari ${w * h}.${sizeNote}`);
    if (n > 0 || sizeNote) failed = true;
    await ctx.close();
  }

  await browser.close();
  process.exitCode = failed ? 1 : 0;
}

main();
