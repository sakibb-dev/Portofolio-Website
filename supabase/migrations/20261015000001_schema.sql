-- Skema konten portofolio. Batas panjang di sini = batas di src/lib/schemas.ts.

create type public.nb_color as enum ('yellow', 'mint', 'tomato', 'cobalt', 'netral');

-- Admin tunggal. Diisi manual (lihat README), harus sama dengan ADMIN_EMAIL.
create table public.admins (
  email text primary key check (email = lower(email))
);

create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------- Satu baris ----------

create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  site_title text not null check (char_length(site_title) between 1 and 70),
  site_description text not null check (char_length(site_description) between 1 and 160),
  brand text not null check (char_length(brand) between 1 and 16),
  nav_cta_label text not null check (char_length(nav_cta_label) between 1 and 24),
  nav_cta_href text not null check (char_length(nav_cta_href) between 1 and 200),
  footer_copyright text not null check (char_length(footer_copyright) between 1 and 80),
  cv_label text not null default 'CV' check (char_length(cv_label) between 1 and 20),
  cv_path text check (char_length(cv_path) <= 200),
  updated_at timestamptz not null default now()
);

create table public.hero (
  id smallint primary key default 1 check (id = 1),
  tag_text text not null check (char_length(tag_text) between 1 and 40),
  tag_color public.nb_color not null default 'mint',
  title text not null check (char_length(title) between 1 and 60),
  lead text not null check (char_length(lead) between 1 and 280),
  note text not null default '' check (char_length(note) <= 140),
  btn1_label text not null check (char_length(btn1_label) between 1 and 24),
  btn1_href text not null check (char_length(btn1_href) between 1 and 200),
  btn2_label text not null check (char_length(btn2_label) between 1 and 24),
  btn2_href text not null check (char_length(btn2_href) between 1 and 200),
  sticker_text text not null check (char_length(sticker_text) between 1 and 24),
  window_title text not null check (char_length(window_title) between 1 and 20),
  window_button text not null check (char_length(window_button) between 1 and 16),
  updated_at timestamptz not null default now()
);

create table public.sections (
  key text primary key check (key in ('about', 'journey', 'projects', 'contact')),
  nav_label text not null check (char_length(nav_label) between 1 and 16),
  eyebrow text not null check (char_length(eyebrow) between 1 and 32),
  heading text not null check (char_length(heading) between 1 and 64),
  intro text not null default '' check (char_length(intro) <= 240),
  note text not null default '' check (char_length(note) <= 160),
  updated_at timestamptz not null default now()
);

-- ---------- Item berulang (urutan + tampil/sembunyi) ----------

create table public.stack_items (
  id uuid primary key default gen_random_uuid(),
  position integer not null default 0,
  visible boolean not null default true,
  label text not null check (char_length(label) between 1 and 24),
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  position integer not null default 0,
  visible boolean not null default true,
  title text not null check (char_length(title) between 1 and 40),
  body text not null check (char_length(body) between 1 and 220),
  color public.nb_color not null default 'netral',
  created_at timestamptz not null default now()
);

create table public.journey_steps (
  id uuid primary key default gen_random_uuid(),
  position integer not null default 0,
  visible boolean not null default true,
  tag_label text not null check (char_length(tag_label) between 1 and 16),
  tag_color public.nb_color not null default 'netral',
  title text not null check (char_length(title) between 1 and 40),
  body text not null check (char_length(body) between 1 and 180),
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  position integer not null default 0,
  visible boolean not null default true,
  title text not null check (char_length(title) between 1 and 64),
  description text not null check (char_length(description) between 1 and 220),
  tag_label text not null check (char_length(tag_label) between 1 and 16),
  tag_color public.nb_color not null default 'netral',
  github_url text not null default '' check (github_url = '' or github_url ~ '^https://'),
  created_at timestamptz not null default now()
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  position integer not null default 0,
  visible boolean not null default true,
  label text not null check (char_length(label) between 1 and 20),
  url text not null check (char_length(url) between 1 and 300),
  created_at timestamptz not null default now()
);

-- ---------- Pesan masuk ----------

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  contact text not null check (char_length(contact) between 3 and 120),
  body text not null check (char_length(body) between 1 and 2000),
  ip_hash text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index messages_created_at_idx on public.messages (created_at desc);
create index messages_rate_idx on public.messages (ip_hash, created_at desc);

-- ---------- Urutkan item (atomik, tunduk pada RLS pemanggil) ----------

create function public.reorder_items(tbl text, ids uuid[]) returns void
language plpgsql security invoker set search_path = ''
as $$
begin
  if tbl not in ('stack_items', 'services', 'journey_steps', 'projects', 'social_links') then
    raise exception 'tabel tidak dikenal: %', tbl;
  end if;
  execute format(
    'update public.%I as t set position = o.ord from unnest($1) with ordinality as o(id, ord) where t.id = o.id',
    tbl
  ) using ids;
end;
$$;
