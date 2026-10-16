# Portofolio Sakippp

Website portofolio pribadi dengan panel admin untuk mengelola semua kontennya.

- **Next.js 16** (App Router, TypeScript, Cache Components) di **Vercel**
- **Supabase**: Postgres + RLS, Auth (satu admin), Storage (CV PDF)
- **Resend** untuk email notifikasi pesan baru
- **zod** untuk validasi. Tanpa library CSS: tampilan memakai CSS dari `design/index.html` apa adanya (kelas `nb-*`).

## Fitur

- Halaman publik identik dengan `design/index.html` (diverifikasi piksel per piksel, lihat [Uji](#uji)).
- Admin di `/admin`: Hero, Pita stack, Yang saya kerjakan, Perjalanan, Proyek, Kontak, Footer & sosial, Pengaturan situs (termasuk unggah CV PDF), dan Kotak masuk dengan badge belum dibaca.
- Item berulang bisa diurutkan (geser, atau tombol ↑↓ lewat keyboard), disembunyikan, diedit, dan dihapus.
- Proyek punya status **Open source** atau **Private** (tag di tiap baris) dan catatan status opsional. Baris Open source menjadi tautan GitHub, dengan label "Click me" yang mengikuti kursor.
- Warna hanya dari token: kuning, mint, tomat, kobalt, netral. Semua teks plain text dengan batas panjang; batas yang sama dicek di form, di server (zod), dan di database (check constraint).
- Form kontak: validasi server, honeypot, rate limit (3 pesan / 10 menit per IP yang di-hash). Pesan disimpan dulu, email dikirim setelahnya; kalau email gagal, pesan tetap tersimpan dan galat dicatat di log.
- Setiap simpan di admin langsung memperbarui halaman publik (`updateTag`).

### Cara menulis konten

| Yang ingin dibuat | Cara |
| --- | --- |
| Kata disorot kuning di judul hero | Apit dengan bintang: `Halo, saya *Sakippp.*` |
| Pindah baris di judul bagian | Tekan Enter di kolom Judul (maks 3 baris) |
| Baris proyek jadi tautan | Status **Open source** + isi URL GitHub (`https://…`) |
| Proyek tanpa kode publik | Status **Private**, URL GitHub dikosongkan |
| Keterangan status | Isi Catatan status (maks 120 karakter), tampil di bawah deskripsi |

Aturan status: **Open source wajib punya URL GitHub, Private tidak boleh punya.** Aturan ini dicek di form, di server (zod), dan oleh constraint database.
| Tautan tombol / sosial | `#kontak`, `/cv`, `https://…`, atau `mailto:…` |

Nomor urut kartu dan proyek (01, 02, …), pola zigzag kartu, dan jumlah kolom Perjalanan diatur otomatis oleh CSS. Perjalanan harus punya 2–8 langkah yang tampil.

---

## Setup

### 1. Buat project Supabase

1. Buat project baru di [supabase.com](https://supabase.com/dashboard).
2. **Authentication → Sign In / Providers**: matikan **Allow new users to sign up**, tapi biarkan provider **Email** tetap aktif.
3. **Authentication → Users → Add user → Create new user**: isi email dan kata sandi admin, lalu centang **Auto Confirm User**.
4. **Authentication → URL Configuration**: isi **Site URL** dengan domain situs (misalnya `https://domainmu.vercel.app`).

### 2. Jalankan migrasi (tabel + RLS + storage + seed)

Pilih salah satu cara:

**A. Supabase CLI** (sudah terpasang sebagai devDependency)

```bash
npm install
npx supabase login
npx supabase link --project-ref <ref-project-kamu>
npx supabase db push
```

**B. SQL Editor di dashboard**: jalankan isi file berikut sesuai urutan:

1. `supabase/migrations/20261015000001_schema.sql`
2. `supabase/migrations/20261015000002_rls.sql`
3. `supabase/migrations/20261015000003_seed.sql`
4. `supabase/migrations/20261016000001_project_status.sql`

Lalu daftarkan email admin (harus sama dengan user di langkah 1.3 dan dengan `ADMIN_EMAIL`):

```sql
insert into public.admins (email) values ('emailadmin@contoh.com');
```

### 3. Siapkan Resend

1. Buat API key di [resend.com](https://resend.com/api-keys).
2. Untuk produksi, verifikasi domain lalu pakai pengirim dari domain itu di `RESEND_FROM`. Tanpa domain, `onboarding@resend.dev` hanya bisa mengirim ke email pemilik akun Resend.

### 4. Isi environment variable

Salin `.env.example` menjadi `.env.local` lalu isi:

| Variabel | Sumber |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_…`) atau anon key |
| `SUPABASE_SECRET_KEY` | Secret key (`sb_secret_…`) atau service_role key. **Rahasia**, hanya di server |
| `ADMIN_EMAIL` | Email admin (sama dengan baris di tabel `admins`) |
| `RESEND_API_KEY`, `RESEND_FROM` | Resend |
| `NEXT_PUBLIC_SITE_URL` | URL publik situs, untuk Open Graph |

### 5. Deploy ke Vercel

1. Push repo ke GitHub, lalu di Vercel pilih **Add New → Project → Import** repo ini.
2. Masukkan semua environment variable dari langkah 4 (Production, dan Preview bila perlu).
3. Klik **Deploy**. Build membutuhkan Supabase yang bisa dijangkau, karena halaman publik dirender saat build.
4. Buka `https://domainmu/admin`, lalu login dengan akun admin.

---

## Pengembangan lokal

Butuh Docker untuk Supabase lokal.

```bash
npm install
npx supabase start          # Postgres, Auth, Storage lokal + menjalankan migrasi
npm run db:reset:local      # reset ke seed + akun uji admin@example.com / rahasia-lokal-123
cp .env.example .env.local  # isi dengan nilai dari `npx supabase status`, ADMIN_EMAIL=admin@example.com
npm run dev
```

Tanpa env Supabase, halaman publik tetap tampil memakai isi `src/content/seed.ts`. Admin tidak bisa dipakai dalam mode itu.

Isi seed hanya punya satu sumber: `src/content/seed.ts`. Setelah mengubahnya, jalankan `npm run gen:seed` untuk membuat ulang file migrasi seed. Kolom yang ditambahkan migrasi yang lebih baru (`status`, `catatan_status`) tidak masuk ke file seed lama; nilainya di seed harus sama dengan default kolom (generator menolak bila tidak).

Tampilan publik bersumber dari `design/index.html`. Bila desain diubah, salin ulang isi `<style>`-nya ke blok pertama `src/app/globals.css`; `npm run visual-diff` gagal bila keduanya tidak sinkron.

## Uji

Satu perintah untuk semuanya (butuh `npx supabase start` dan port 3000 kosong):

```bash
npm run test:all
```

Isinya, dengan urutan yang benar:

| Perintah | Yang dicek |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run test:fields` | 10 cek validasi zod (aturan status ↔ URL GitHub, batas catatan) tanpa server |
| `npm run visual-diff` | Halaman vs `design/index.html` di 1280 & 390 px, tanpa & dengan animasi. Juga mengecek CSS desain dan `globals.css` sinkron |
| `npm run test:reveal` | 8 cek animasi muncul bertahap; mati saat reduced-motion / tanpa JS |
| `npm run test:rls` | 28 cek RLS, storage, dan constraint database |
| `npm run test:e2e` | 38 cek alur admin (termasuk status proyek), kontak, rate limit, CV, logout |
| `npm run test:cursor` | 21 cek label "Click me" |

`visual-diff` harus jalan pada build yang segar dari seed. `db:reset:local` mengubah database tanpa merevalidasi cache halaman, jadi setelah reset, build ulang dulu (atau pakai `test:all`). Hasil diff visual disimpan di `.visual-diff/`.

### Menguji label "Click me"

Label ini hanya muncul saat kursor bergerak di atas baris proyek bertautan, jadi tidak terekam oleh `visual-diff` (screenshot tanpa gerakan kursor; label tersembunyi `opacity:0`). Diuji oleh `npm run test:cursor`, yang:

- menjadikan proyek pertama Open source lewat admin, lalu menggerakkan mouse sungguhan dengan Playwright;
- mengecek posisi (+16, +22 px dari kursor), easing, clamp di tepi kanan dan bawah layar, hilang di baris tanpa URL, `pointer-events: none`, dan kursor asli tetap `pointer`;
- mengecek bahwa mousemove tidak mengubah DOM (tanpa re-render React) lewat MutationObserver;
- mengecek mode `prefers-reduced-motion` (tanpa transisi, tanpa easing), layar sentuh (tanpa label), dan navigasi Tab (label tetap di dalam baris, `aria-hidden`).

Cara melihatnya sendiri: `npm run dev`, login ke `/admin/proyek`, ubah satu proyek ke Open source dan isi URL GitHub, lalu arahkan mouse ke baris itu di halaman utama. Untuk mode keyboard, tekan Tab sampai baris itu terfokus.

## Struktur

```
design/index.html            desain final (sumber kebenaran tampilan)
src/app/globals.css          CSS desain apa adanya + blok tambahan di bawahnya
src/app/page.tsx             halaman publik
src/app/cv/                  penampil CV (PDF)
src/app/contact-action.ts    kirim pesan (validasi, honeypot, rate limit, email)
src/app/admin/               login, panel, server actions
src/components/site/         komponen halaman publik (kelas nb-*)
src/components/admin/        form & daftar item admin
src/lib/fields.ts            definisi field: label, batas panjang, validasi zod
src/lib/content.ts           baca konten (cache + tag)
src/proxy.ts                 lindungi /admin/*
supabase/migrations/         skema, RLS, storage, seed
scripts/                     diff visual, generator seed, uji lokal
```
