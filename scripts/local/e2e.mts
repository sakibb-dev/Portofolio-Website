/** Uji end-to-end admin + kontak. Butuh: npm run build && npm start, lalu npm run db:reset:local. */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const BASE = "http://localhost:3000";
let fail = 0;
const check = (n: string, ok: boolean, info: unknown = "") => { console.log(`${ok ? "✓" : "✗"} ${n}`, ok ? "" : String(info).slice(0, 300)); if (!ok) fail++; };
const pub = async () => (await fetch(BASE + "/")).text();
const rows = (html: string) => [...html.matchAll(/class="row"[^>]*>.*?<h3>([^<]+)<\/h3>/g)].map((m) => m[1]);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on("dialog", (d) => d.accept());

// --- Auth
await page.goto(BASE + "/admin/hero");
check("tanpa sesi → /admin/login", page.url().endsWith("/admin/login"), page.url());
await page.fill("#email", "bukan-admin@example.com"); await page.fill("#password", "rahasia-lokal-123");
await page.click("button[type=submit]"); await page.waitForSelector(".nb-error");
check("user bukan admin ditolak", page.url().endsWith("/admin/login"));
await page.fill("#email", "admin@example.com"); await page.fill("#password", "rahasia-lokal-123");
await page.click("button[type=submit]"); await page.waitForURL("**/admin/inbox");
check("admin login → kotak masuk", true);

// --- Hero
await page.goto(BASE + "/admin/hero");
const title = page.getByLabel("Judul", { exact: true });
await title.fill("Halo, saya *Tsaqib.*");
await page.click("text=Simpan"); await page.waitForSelector("text=Tersimpan.");
let html = await pub();
check("hero tersimpan & publik langsung berubah", html.includes('<span class="mark">Tsaqib.</span>'), html.match(/<h1>.*?<\/h1>/)?.[0]);
await title.evaluate((el) => el.removeAttribute("maxlength"));
await title.fill("x".repeat(61)); await page.click("text=Simpan");
await page.waitForSelector(".nb-error");
check("validasi server: judul >60 ditolak", (await page.textContent(".nb-error"))!.includes("60"));
await title.fill("Halo, saya *Sakippp.*"); await page.click("text=Simpan"); await page.waitForSelector("text=Tersimpan.");

// --- Proyek
await page.goto(BASE + "/admin/proyek");
const items = page.locator(".adm-list > li");
await items.nth(0).getByRole("button", { name: "Edit" }).click();
await items.nth(0).getByLabel(/URL GitHub/).fill("https://github.com/sakibb-dev/Portofolio-Website");
await items.nth(0).getByRole("button", { name: "Simpan" }).click(); await page.waitForSelector("text=Tersimpan.");
html = await pub();
check("proyek ber-URL jadi tautan tab baru + noopener", /<a class="row" data-reveal="true" href="https:\/\/github.com\/sakibb-dev\/Portofolio-Website" target="_blank" rel="noopener noreferrer">/.test(html));
check("proyek tanpa URL tetap div", (html.match(/<div class="row" data-reveal="true">/g) ?? []).length === 4);

const before = rows(await pub());
await items.nth(0).getByRole("button", { name: /Turunkan/ }).click(); await wait(800);
let after = rows(await pub());
check("urutkan (↓) tercermin di publik", after[0] === before[1] && after[1] === before[0], after.join(" | "));
await items.nth(1).getByRole("button", { name: /Naikkan/ }).click(); await wait(1500);
await page.reload();

// drag & drop: item terakhir ke posisi pertama
await items.nth(4).dragTo(items.nth(0)); await wait(1500);
after = rows(await pub());
check("urutkan (geser) tercermin di publik", after[0] === before[4], after.join(" | "));
await page.reload(); await items.nth(0).dragTo(items.nth(4)); await wait(1500);
check("urutan dikembalikan", rows(await pub()).join() === before.join(), rows(await pub()).join(" | "));

await items.nth(1).getByRole("button", { name: "Sembunyikan" }).click(); await wait(800);
check("sembunyikan proyek → publik 4 baris", rows(await pub()).length === 4);
await items.nth(1).getByRole("button", { name: "Tampilkan" }).click(); await wait(800);

const add = page.locator(".nb-card").filter({ hasText: "Tambah proyek" });
await add.getByLabel("Nama proyek").fill("Proyek Uji"); await add.getByLabel("Deskripsi").fill("Deskripsi uji.");
await add.getByLabel("Tag", { exact: true }).fill("Uji"); await add.getByLabel("Warna tag").selectOption("cobalt");
await add.getByRole("button", { name: "Tambah" }).click(); await page.waitForSelector("text=Ditambahkan.");
html = await pub();
check("tambah proyek muncul di akhir dengan tag kobalt", rows(html).at(-1) === "Proyek Uji" && html.includes('nb-tag nb-tag--cobalt">Uji<'));
check("form tambah dikosongkan", (await add.getByLabel("Nama proyek").inputValue()) === "");
await items.nth(5).getByRole("button", { name: "Hapus" }).click(); await wait(800);
check("hapus proyek", rows(await pub()).length === 5);

// --- Perjalanan: minimal 2 tampil
await page.goto(BASE + "/admin/perjalanan");
const steps = page.locator(".adm-list > li");
await steps.nth(0).getByRole("button", { name: "Sembunyikan" }).click(); await wait(600);
await steps.nth(1).getByRole("button", { name: "Sembunyikan" }).click(); await wait(600);
await steps.nth(2).getByRole("button", { name: "Sembunyikan" }).click(); await wait(800);
check("tidak bisa < 2 langkah tampil", (await page.locator(".adm-block > .adm-status").textContent())!.includes("Minimal 2"));
html = await pub();
check("publik 2 langkah", (html.match(/class="step"/g) ?? []).length === 2);
await page.goto(BASE + "/?shot"); await page.setViewportSize({ width: 1280, height: 900 });
await page.locator("#perjalanan").screenshot({ path: ".visual-diff/steps-2.png" });
await page.goto(BASE + "/admin/perjalanan");
await steps.nth(0).getByRole("button", { name: "Tampilkan" }).click(); await wait(600);
await steps.nth(1).getByRole("button", { name: "Tampilkan" }).click(); await wait(800);

// --- Kontak publik
await page.goto(BASE + "/#kontak");
await page.click("text=Kirim pesan"); await page.waitForSelector("#n-err"); await wait(500);
check("form kosong → galat per field", await page.isVisible("#k-err") && await page.isVisible("#b-err"));
await page.fill("#n", "Budi Uji"); await page.fill("#k", "bukan kontak"); await page.fill("#b", "Halo, ada proyek.");
await page.click("text=Kirim pesan"); await page.waitForSelector("#k-err");
await wait(500);
check("kontak tidak valid ditolak, isian lain dipertahankan", (await page.inputValue("#n")) === "Budi Uji");
await page.fill("#k", "budi@contoh.com"); await page.click("text=Kirim pesan");
await page.waitForSelector("text=Terima kasih");
check("pesan valid terkirim & form dikosongkan", (await page.inputValue("#n")) === "");
await page.evaluate(() => { (document.getElementById("website") as HTMLInputElement).value = "spam"; });
await page.fill("#n", "Bot"); await page.fill("#k", "bot@spam.com"); await page.fill("#b", "spam spam spam");
await page.click("text=Kirim pesan"); await wait(1000);

// --- Kotak masuk
await page.goto(BASE + "/admin/inbox");
check("honeypot tidak tersimpan, 1 pesan", (await page.locator(".adm-msg").count()) === 1);
check("badge belum dibaca = 1", (await page.locator(".adm-menu .nb-tag").textContent()) === "1");
await page.click(".adm-msg"); await page.waitForSelector("text=Tandai dibaca");
check("detail pesan", (await page.textContent(".adm-body")) === "Halo, ada proyek.");
await page.click("text=Tandai dibaca"); await page.waitForSelector("text=Tandai belum dibaca");
check("badge hilang setelah dibaca", (await page.locator(".adm-menu .nb-tag").count()) === 0);
await page.click("text=Hapus"); await page.waitForURL("**/admin/inbox");
check("pesan terhapus", (await page.locator(".adm-msg").count()) === 0);

// --- Rate limit (pesan yang dihapus tidak dihitung; kirim 4, yang ke-4 ditolak)
let last = "";
for (let i = 0; i < 4; i++) {
  await page.goto(`${BASE}/?r=${i}#kontak`);
  await page.fill("#n", "Rate " + i); await page.fill("#k", "rate@contoh.com"); await page.fill("#b", "Uji rate limit.");
  await Promise.all([page.waitForResponse((r) => r.request().method() === "POST"), page.click("text=Kirim pesan")]);
  await page.waitForSelector("[role=status]");
  last = (await page.textContent("[role=status]"))!;
}
check("pesan ke-4 dalam 10 menit ditolak", last.includes("Terlalu banyak"), last);

// --- CV
const pdf = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 300]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF";
writeFileSync(".visual-diff/cv.pdf", pdf);
await page.goto(BASE + "/admin/pengaturan");
await page.setInputFiles("#cv-file", ".visual-diff/cv.pdf");
await page.getByRole("button", { name: "Unggah", exact: true }).click(); await page.waitForSelector("text=CV diperbarui.");
html = await pub();
check("tautan CV muncul di footer", html.includes('<a href="/cv">CV</a>'));
const cv = await (await fetch(BASE + "/cv")).text();
const m = cv.match(/<object data="([^"]+)"/);
check("/cv menampilkan PDF", !!m && (await fetch(m[1].replace(/&amp;/g, "&"))).status === 200, cv.slice(0, 200));
await page.goto(BASE + "/admin/pengaturan");
await page.click("text=Hapus CV"); await page.waitForSelector("text=CV dihapus.");
check("hapus CV → tautan hilang", !(await pub()).includes('href="/cv"'));
check("/cv 404 setelah dihapus", (await fetch(BASE + "/cv")).status === 404);

// --- Logout
await page.click("text=Keluar"); await page.waitForURL("**/admin/login");
await page.goto(BASE + "/admin/inbox");
check("setelah keluar, admin terkunci", page.url().endsWith("/admin/login"));

await b.close();
process.exitCode = fail ? 1 : 0;
