/** Cek animasi reveal: aktif saat gerak diizinkan, mati saat reduced-motion / tanpa JS. */
import { chromium } from "playwright";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const b = await chromium.launch();
let fail = 0;
const check = (n: string, ok: boolean, info: unknown = "") => { console.log(`${ok ? "✓" : "✗"} ${n}`, ok ? "" : JSON.stringify(info)); if (!ok) fail++; };

let p = await (await b.newContext({ reducedMotion: "no-preference" })).newPage();
await p.goto(BASE, { waitUntil: "networkidle" });
const cls = await p.evaluate(() => document.documentElement.className);
check("mode reveal aktif", cls.includes("js-reveal") && cls.includes("reveal-ready"), cls);
check("proyek di bawah layar masih tersembunyi", (await p.$eval(".row", (e) => getComputedStyle(e).opacity)) === "0");
await p.locator("#proyek .work").scrollIntoViewIfNeeded(); await p.waitForTimeout(120);
const mid = await p.$$eval(".row", (els) => els.map((e) => Number(getComputedStyle(e).opacity).toFixed(2)));
check("muncul bertahap (opacity berjenjang di tengah animasi)", new Set(mid).size > 1, mid);
await p.screenshot({ path: ".visual-diff/d/reveal-mid.png" });
await p.waitForTimeout(1500);
const end = await p.$$eval(".row", (els) => els.map((e) => getComputedStyle(e).opacity));
check("akhirnya semua tampil penuh", end.every((o) => o === "1"), end);
await p.locator("#kontak").scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
check("scrollspy menandai Kontak", (await p.getAttribute('a[aria-current="location"]', "href")) === "#kontak");

p = await (await b.newContext({ reducedMotion: "reduce" })).newPage();
await p.goto(BASE, { waitUntil: "networkidle" });
check("reduced-motion: tanpa mode reveal", !(await p.evaluate(() => document.documentElement.classList.contains("js-reveal"))));
check("reduced-motion: konten langsung tampil", (await p.$eval(".row", (e) => getComputedStyle(e).opacity)) === "1");

p = await (await b.newContext({ javaScriptEnabled: false })).newPage();
await p.goto(BASE, { waitUntil: "networkidle" });
check("tanpa JS: konten langsung tampil", (await p.$eval(".row", (e) => getComputedStyle(e).opacity)) === "1");

await b.close();
process.exitCode = fail ? 1 : 0;
