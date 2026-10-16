/**
 * Uji label "Click me" di baris proyek (tidak terekam visual-diff karena butuh gerakan kursor).
 * Butuh: npm run build && npm start, lalu npm run db:reset:local. Menjadikan proyek pertama Open source lewat admin.
 */
import { chromium, type Browser, type Page } from "playwright";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
let fail = 0;
const check = (n: string, ok: boolean, info: unknown = "") => {
  console.log(`${ok ? "✓" : "✗"} ${n}`, ok ? "" : JSON.stringify(info));
  if (!ok) fail++;
};
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const b: Browser = await chromium.launch();

// --- Siapkan satu proyek Open source lewat admin (sekalian merevalidasi halaman publik)
{
  const p = await b.newPage();
  await p.goto(BASE + "/admin/login");
  await p.fill("#email", "admin@example.com");
  await p.fill("#password", "rahasia-lokal-123");
  await p.click("button[type=submit]");
  await p.waitForURL("**/admin/inbox");
  await p.goto(BASE + "/admin/proyek");
  const first = p.locator(".adm-list > li").nth(0);
  await first.getByRole("button", { name: "Edit" }).click();
  await first.getByLabel("Status", { exact: true }).selectOption("public");
  await first.getByLabel(/URL GitHub/).fill("https://github.com/sakibb-dev/Portofolio-Website");
  await first.getByRole("button", { name: "Simpan" }).click();
  await p.waitForSelector("text=Tersimpan.");
  await p.close();
}

const label = (p: Page) =>
  p.$eval(".cursor-label", (el) => {
    const r = el.getBoundingClientRect();
    return { on: el.classList.contains("is-on"), x: r.left, y: r.top, right: r.right, bottom: r.bottom };
  });
async function open(p: Page) {
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.locator("a.row").scrollIntoViewIfNeeded();
  await wait(1200); // animasi reveal selesai
  return (await p.locator("a.row").boundingBox())!;
}

// --- Desktop, gerak diizinkan
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "no-preference" });
  const p = await ctx.newPage();
  ctx.on("page", (pg) => void pg.close()); // tab baru dari klik tautan
  const box = await open(p);
  check("hanya satu elemen label di halaman", (await p.locator(".cursor-label").count()) === 1);
  check("label pointer-events: none", (await p.$eval(".cursor-label", (e) => getComputedStyle(e).pointerEvents)) === "none");
  check("kursor asli pointer di baris bertautan", (await p.$eval("a.row", (e) => getComputedStyle(e).cursor)) === "pointer");
  check("kursor biasa di baris tanpa URL", (await p.$eval("div.row", (e) => getComputedStyle(e).cursor)) === "auto");
  check("awalnya tersembunyi", !(await label(p)).on);

  // Hitung perubahan DOM selama mousemove: re-render React akan mengganti/menambah node.
  await p.evaluate(() => {
    const w = window as unknown as { __m: number };
    w.__m = 0;
    new MutationObserver((ms) => {
      for (const m of ms) if (m.type !== "attributes" || !(m.target as Element).classList?.contains("cursor-label")) w.__m++;
    }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true });
  });

  const mx = box.x + 200, my = box.y + box.height / 2;
  await p.mouse.move(mx, my, { steps: 8 });
  await wait(500);
  let l = await label(p);
  check("muncul saat hover baris bertautan", l.on);
  check("posisi kanan-bawah kursor (+16, +22)", Math.abs(l.x - (mx + 16)) < 1.5 && Math.abs(l.y - (my + 22)) < 1.5, { l, mx, my });

  await p.mouse.move(mx + 300, my);
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  l = await label(p);
  check("mengejar kursor dengan easing (belum sampai di frame berikutnya)", l.x > mx + 16 && l.x < mx + 300 + 16 - 5, l);
  await wait(600);
  l = await label(p);
  check("akhirnya tepat di target", Math.abs(l.x - (mx + 316)) < 1.5, l);

  for (let i = 0; i < 30; i++) await p.mouse.move(mx + i * 10, my + (i % 5));
  await wait(300);
  check("mousemove tidak mengubah DOM (tanpa re-render React)", (await p.evaluate(() => (window as unknown as { __m: number }).__m)) === 0);

  await p.mouse.move(1278, my);
  await wait(600);
  l = await label(p);
  check("tidak keluar tepi kanan layar", l.right <= 1280 - 8 + 0.5, l);
  check("label tidak menangkap klik", await p.evaluate(([x, y]) => !document.elementFromPoint(x, y)?.closest(".cursor-label"), [l.x + 10, l.y + 5]));

  // Tepi bawah: geser baris ke dasar layar, kursor di dekat tepi bawah.
  await p.evaluate(() => {
    const r = document.querySelector("a.row")!.getBoundingClientRect();
    window.scrollBy(0, r.bottom - window.innerHeight + 2);
  });
  await p.mouse.move(mx, 896);
  await wait(600);
  l = await label(p);
  check("tidak keluar tepi bawah layar", l.on && l.bottom <= 900 - 8 + 0.5, l);

  const divBox = (await p.locator("div.row").first().boundingBox())!;
  await p.mouse.move(divBox.x + 200, divBox.y + divBox.height / 2, { steps: 4 });
  await wait(200);
  check("hilang di baris tanpa URL", !(await label(p)).on);

  // Keyboard: label tetap di dalam baris saat :focus-visible.
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  let focused = false;
  for (let i = 0; i < 40 && !focused; i++) {
    await p.keyboard.press("Tab");
    focused = await p.evaluate(() => document.activeElement?.matches("a.row") ?? false);
  }
  const focusLabel = await p.$eval("a.row .row__focus", (e) => ({ display: getComputedStyle(e).display, pos: getComputedStyle(e).position }));
  check("Tab ke baris → label tetap tampil di dalam baris", focused && focusLabel.display !== "none" && focusLabel.pos === "absolute", focusLabel);
  check("label keyboard tidak ikut dibacakan (aria-hidden)", (await p.getAttribute("a.row .row__focus", "aria-hidden")) === "true");
  check("label kursor tidak muncul saat navigasi keyboard", !(await label(p)).on);
  await ctx.close();
}

// --- prefers-reduced-motion: tanpa animasi, tanpa easing
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  const box = await open(p);
  const mx = box.x + 200, my = box.y + box.height / 2;
  check("reduced-motion: tanpa transisi opacity", (await p.$eval(".cursor-label", (e) => getComputedStyle(e).transitionDuration)) === "0s");
  await p.mouse.move(mx, my);
  await p.mouse.move(mx + 300, my);
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const l = await label(p);
  check("reduced-motion: langsung di posisi (tidak mengejar)", l.on && Math.abs(l.x - (mx + 316)) < 1.5, l);
  await ctx.close();
}

// --- Layar sentuh: tidak ada label
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  ctx.on("page", (pg) => void pg.close());
  const box = await open(p);
  check("sentuh: media (hover: hover) and (pointer: fine) tidak cocok", !(await p.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)));
  await p.touchscreen.tap(box.x + 100, box.y + box.height / 2);
  await wait(400);
  check("sentuh: label tidak muncul", !(await label(p)).on);
  await ctx.close();
}

await b.close();
process.exitCode = fail ? 1 : 0;
