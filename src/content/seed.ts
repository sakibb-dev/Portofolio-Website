import type { SiteContent } from "@/lib/types";

// Isi persis dari design/index.html. Sumber yang sama dipakai supabase/migrations/0003_seed.sql.
const ids = (prefix: string, n: number) =>
  Array.from({ length: n }, (_, i) => `${prefix}-${i + 1}`);

const [s1, s2, s3, s4, s5, s6] = ids("stack", 6);
const [c1, c2, c3] = ids("service", 3);
const [j1, j2, j3, j4] = ids("step", 4);
const [p1, p2, p3, p4, p5] = ids("project", 5);
const [l1, l2, l3] = ids("social", 3);

export const seed: SiteContent = {
  settings: {
    site_title: "Sakippp — Fullstack Developer",
    site_description:
      "Portofolio Muhammad Tsaqib Hidayat (Sakippp), fullstack developer Laravel, React, PostgreSQL.",
    brand: "Sakippp",
    nav_cta_label: "Ajak kerja sama",
    nav_cta_href: "#kontak",
    footer_copyright: "© 2026 Muhammad Tsaqib Hidayat",
    cv_path: null,
    cv_label: "CV",
  },
  hero: {
    tag_text: "Terbuka untuk magang & freelance",
    tag_color: "mint",
    title: "Halo, saya *Sakippp.*",
    lead: "Muhammad Tsaqib Hidayat, fullstack developer dengan Laravel, React, dan PostgreSQL. Saya membangun sistem untuk sekolah, UMKM, dan instansi: tampilannya tegas, kodenya rapi.",
    note: "Mahasiswa D3 Rekayasa Perangkat Lunak Aplikasi, Telkom University.",
    btn1_label: "Lihat proyek",
    btn1_href: "#proyek",
    btn2_label: "Hubungi saya",
    btn2_href: "#kontak",
    sticker_text: "Fullstack dev",
    window_title: "Halo, dunia.",
    window_button: "git push",
  },
  sections: {
    about: {
      key: "about",
      nav_label: "Tentang",
      eyebrow: "01 / Tentang",
      heading: "Yang saya\nkerjakan",
      intro:
        "Anggota fullstack di Stematel Dev, komunitas developer mahasiswa di bawah Telkom School Purwokerto. Selain itu saya menerima proyek klien lepas.",
      note: "",
    },
    journey: {
      key: "journey",
      nav_label: "Perjalanan",
      eyebrow: "02 / Perjalanan",
      heading: "Dari kelas\nke proyek nyata",
      intro: "",
      note: "",
    },
    projects: {
      key: "projects",
      nav_label: "Proyek",
      eyebrow: "03 / Proyek",
      heading: "Pilihan karya",
      intro: "",
      note: "Sebagian klien dirahasiakan.",
    },
    contact: {
      key: "contact",
      nav_label: "Kontak",
      eyebrow: "04 / Kontak",
      heading: "Ada proyek?\nAda magang?\nKirim saja.",
      intro:
        "Saya terbuka untuk magang, freelance, dan kerja paruh waktu. Ceritakan singkat, saya balas dengan pertanyaan.",
      note: "",
    },
  },
  stack: [
    { id: s1, position: 1, visible: true, label: "Laravel" },
    { id: s2, position: 2, visible: true, label: "React" },
    { id: s3, position: 3, visible: true, label: "PostgreSQL" },
    { id: s4, position: 4, visible: true, label: "MySQL" },
    { id: s5, position: 5, visible: true, label: "Vue" },
    { id: s6, position: 6, visible: true, label: "AI & RAG" },
  ],
  services: [
    {
      id: c1,
      position: 1,
      visible: true,
      color: "yellow",
      title: "Antarmuka",
      body: "React dan Vue untuk tampilan yang jelas dan cepat dipakai, dari redesign platform layanan publik sampai website profil sekolah.",
    },
    {
      id: c2,
      position: 2,
      visible: true,
      color: "netral",
      title: "Backend & data",
      body: "Laravel dengan PostgreSQL atau MySQL: autentikasi, alur data, dan panel pengelolaan yang bisa dipegang orang non-teknis.",
    },
    {
      id: c3,
      position: 3,
      visible: true,
      color: "mint",
      title: "AI & platform UMKM",
      body: "Sistem berbasis AI/RAG dan platform untuk usaha kecil, dikerjakan sebagai proyek freelance dan klien.",
    },
  ],
  journey: [
    {
      id: j1,
      position: 1,
      visible: true,
      tag_label: "SMK",
      tag_color: "yellow",
      title: "SMK Telkom Purwokerto",
      body: "Jurusan Pengembangan Perangkat Lunak dan Gim. Lulus uji kompetensi dengan sertifikasi BNSP Novice Programmer.",
    },
    {
      id: j2,
      position: 2,
      visible: true,
      tag_label: "Magang",
      tag_color: "tomato",
      title: "Diginet Media",
      body: "Magang frontend dan UI/UX, lalu berlanjut sebagai freelance di proyek instansi.",
    },
    {
      id: j3,
      position: 3,
      visible: true,
      tag_label: "Komunitas",
      tag_color: "mint",
      title: "Stematel Dev",
      body: "Fullstack developer di komunitas mahasiswa Telkom School Purwokerto.",
    },
    {
      id: j4,
      position: 4,
      visible: true,
      tag_label: "Kuliah",
      tag_color: "netral",
      title: "Telkom University",
      body: "D3 Rekayasa Perangkat Lunak Aplikasi, mulai September 2026.",
    },
  ],
  projects: [
    {
      id: p1,
      position: 1,
      visible: true,
      title: "Digital Library MTsN 1 Banyumas",
      description: "Platform perpustakaan digital sekolah. Laravel Blade, MySQL. Sudah live.",
      tag_label: "Fullstack",
      tag_color: "yellow",
      github_url: "",
      status: "private",
      catatan_status: "",
    },
    {
      id: p2,
      position: 2,
      visible: true,
      title: "Platform Mal Pelayanan Publik",
      description: "Redesign frontend dengan React, dikerjakan lewat Diginet Media.",
      tag_label: "Frontend",
      tag_color: "mint",
      github_url: "",
      status: "private",
      catatan_status: "",
    },
    {
      id: p3,
      position: 3,
      visible: true,
      title: "Platform UMKM bagi hasil",
      description:
        "Platform pendanaan mikro untuk usaha kecil, dari prototipe sampai sistem desain.",
      tag_label: "UMKM",
      tag_color: "tomato",
      github_url: "",
      status: "private",
      catatan_status: "",
    },
    {
      id: p4,
      position: 4,
      visible: true,
      title: "Website profil sekolah Situwangi",
      description: "Digitalisasi sekolah sekaligus kanal pemasarannya. Laravel dan React.",
      tag_label: "Frontend",
      tag_color: "cobalt",
      github_url: "",
      status: "private",
      catatan_status: "",
    },
    {
      id: p5,
      position: 5,
      visible: true,
      title: "Aplikasi instansi daerah",
      description:
        "Agenda pemerintah daerah (Yii2, lalu Laravel + React), antrean multi-instansi (Vue), dan sistem DLH (Laravel + Vue).",
      tag_label: "Magang",
      tag_color: "netral",
      github_url: "",
      status: "private",
      catatan_status: "",
    },
  ],
  socials: [
    { id: l1, position: 1, visible: true, label: "GitHub", url: "#" },
    { id: l2, position: 2, visible: true, label: "LinkedIn", url: "#" },
    { id: l3, position: 3, visible: true, label: "Email", url: "#kontak" },
  ],
};
