-- Status proyek: "public" (Open source, wajib URL GitHub) atau "private" (tanpa URL GitHub),
-- plus catatan status opsional. Batas panjang = src/lib/fields.ts.

create type public.project_status as enum ('public', 'private');

alter table public.projects
  add column status public.project_status not null default 'private',
  add column catatan_status text not null default ''
    check (char_length(catatan_status) <= 120 and catatan_status !~ '[\n\r]');

-- Data lama: proyek yang sudah punya URL GitHub dianggap open source agar lolos aturan di bawah.
update public.projects set status = 'public' where github_url <> '';

alter table public.projects
  add constraint projects_status_github_url check (
    (status = 'public' and github_url <> '') or (status = 'private' and github_url = '')
  );
