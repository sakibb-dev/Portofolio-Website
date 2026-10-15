-- DIBUAT OTOMATIS oleh scripts/gen-seed-sql.ts dari src/content/seed.ts. Jangan edit manual.

insert into public.site_settings (site_title, site_description, brand, nav_cta_label, nav_cta_href, footer_copyright, cv_label) values
  ('Sakippp — Fullstack Developer', 'Portofolio Muhammad Tsaqib Hidayat (Sakippp), fullstack developer Laravel, React, PostgreSQL.', 'Sakippp', 'Ajak kerja sama', '#kontak', '© 2026 Muhammad Tsaqib Hidayat', 'CV');

insert into public.hero (tag_text, tag_color, title, lead, note, btn1_label, btn1_href, btn2_label, btn2_href, sticker_text, window_title, window_button) values
  ('Terbuka untuk magang & freelance', 'mint', 'Halo, saya *Sakippp.*', 'Muhammad Tsaqib Hidayat, fullstack developer dengan Laravel, React, dan PostgreSQL. Saya membangun sistem untuk sekolah, UMKM, dan instansi: tampilannya tegas, kodenya rapi.', 'Mahasiswa D3 Rekayasa Perangkat Lunak Aplikasi, Telkom University.', 'Lihat proyek', '#proyek', 'Hubungi saya', '#kontak', 'Fullstack dev', 'Halo, dunia.', 'git push');

insert into public.sections (key, nav_label, eyebrow, heading, intro, note) values
  ('about', 'Tentang', '01 / Tentang', 'Yang saya
kerjakan', 'Anggota fullstack di Stematel Dev, komunitas developer mahasiswa di bawah Telkom School Purwokerto. Selain itu saya menerima proyek klien lepas.', ''),
  ('journey', 'Perjalanan', '02 / Perjalanan', 'Dari kelas
ke proyek nyata', '', ''),
  ('projects', 'Proyek', '03 / Proyek', 'Pilihan karya', '', 'Sebagian klien dirahasiakan.'),
  ('contact', 'Kontak', '04 / Kontak', 'Ada proyek?
Ada magang?
Kirim saja.', 'Saya terbuka untuk magang, freelance, dan kerja paruh waktu. Ceritakan singkat, saya balas dengan pertanyaan.', '');

insert into public.stack_items (position, visible, label) values
  (1, true, 'Laravel'),
  (2, true, 'React'),
  (3, true, 'PostgreSQL'),
  (4, true, 'MySQL'),
  (5, true, 'Vue'),
  (6, true, 'AI & RAG');

insert into public.services (position, visible, color, title, body) values
  (1, true, 'yellow', 'Antarmuka', 'React dan Vue untuk tampilan yang jelas dan cepat dipakai, dari redesign platform layanan publik sampai website profil sekolah.'),
  (2, true, 'netral', 'Backend & data', 'Laravel dengan PostgreSQL atau MySQL: autentikasi, alur data, dan panel pengelolaan yang bisa dipegang orang non-teknis.'),
  (3, true, 'mint', 'AI & platform UMKM', 'Sistem berbasis AI/RAG dan platform untuk usaha kecil, dikerjakan sebagai proyek freelance dan klien.');

insert into public.journey_steps (position, visible, tag_label, tag_color, title, body) values
  (1, true, 'SMK', 'yellow', 'SMK Telkom Purwokerto', 'Jurusan Pengembangan Perangkat Lunak dan Gim. Lulus uji kompetensi dengan sertifikasi BNSP Novice Programmer.'),
  (2, true, 'Magang', 'tomato', 'Diginet Media', 'Magang frontend dan UI/UX, lalu berlanjut sebagai freelance di proyek instansi.'),
  (3, true, 'Komunitas', 'mint', 'Stematel Dev', 'Fullstack developer di komunitas mahasiswa Telkom School Purwokerto.'),
  (4, true, 'Kuliah', 'netral', 'Telkom University', 'D3 Rekayasa Perangkat Lunak Aplikasi, mulai September 2026.');

insert into public.projects (position, visible, title, description, tag_label, tag_color, github_url) values
  (1, true, 'Digital Library MTsN 1 Banyumas', 'Platform perpustakaan digital sekolah. Laravel Blade, MySQL. Sudah live.', 'Fullstack', 'yellow', ''),
  (2, true, 'Platform Mal Pelayanan Publik', 'Redesign frontend dengan React, dikerjakan lewat Diginet Media.', 'Frontend', 'mint', ''),
  (3, true, 'Platform UMKM bagi hasil', 'Platform pendanaan mikro untuk usaha kecil, dari prototipe sampai sistem desain.', 'UMKM', 'tomato', ''),
  (4, true, 'Website profil sekolah Situwangi', 'Digitalisasi sekolah sekaligus kanal pemasarannya. Laravel dan React.', 'Frontend', 'cobalt', ''),
  (5, true, 'Aplikasi instansi daerah', 'Agenda pemerintah daerah (Yii2, lalu Laravel + React), antrean multi-instansi (Vue), dan sistem DLH (Laravel + Vue).', 'Magang', 'netral', '');

insert into public.social_links (position, visible, label, url) values
  (1, true, 'GitHub', '#'),
  (2, true, 'LinkedIn', '#'),
  (3, true, 'Email', '#kontak');
