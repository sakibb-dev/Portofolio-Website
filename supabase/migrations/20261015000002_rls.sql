-- RLS: publik hanya membaca konten yang tampil; semua penulisan hanya admin.
-- messages tidak bisa dibaca publik; insert lewat server (secret key, melewati RLS).

alter table public.admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.hero enable row level security;
alter table public.sections enable row level security;
alter table public.stack_items enable row level security;
alter table public.services enable row level security;
alter table public.journey_steps enable row level security;
alter table public.projects enable row level security;
alter table public.social_links enable row level security;
alter table public.messages enable row level security;

-- Hak dasar (RLS tetap menyaring baris).
revoke all on public.admins from anon, authenticated;
revoke all on public.messages from anon;
grant select on public.site_settings, public.hero, public.sections,
  public.stack_items, public.services, public.journey_steps, public.projects, public.social_links
  to anon, authenticated;
grant insert, update, delete on public.site_settings, public.hero, public.sections,
  public.stack_items, public.services, public.journey_steps, public.projects, public.social_links
  to authenticated;
grant select, update, delete on public.messages to authenticated;
revoke execute on function public.reorder_items(text, uuid[]) from public, anon;
grant execute on function public.reorder_items(text, uuid[]) to authenticated;

-- Tabel satu baris + sections: selalu terbaca.
create policy "publik baca" on public.site_settings for select to anon, authenticated using (true);
create policy "publik baca" on public.hero for select to anon, authenticated using (true);
create policy "publik baca" on public.sections for select to anon, authenticated using (true);

create policy "admin ubah" on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin ubah" on public.hero for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin ubah" on public.sections for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Item berulang: publik hanya yang visible; admin semuanya.
do $$
declare t text;
begin
  foreach t in array array['stack_items', 'services', 'journey_steps', 'projects', 'social_links'] loop
    execute format('create policy "publik baca yang tampil" on public.%I for select to anon, authenticated using (visible)', t);
    execute format('create policy "admin baca" on public.%I for select to authenticated using (public.is_admin())', t);
    execute format('create policy "admin tambah" on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy "admin ubah" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admin hapus" on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

-- Pesan: hanya admin yang bisa baca / tandai / hapus.
create policy "admin baca" on public.messages for select to authenticated using (public.is_admin());
create policy "admin ubah" on public.messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin hapus" on public.messages for delete to authenticated using (public.is_admin());

-- ---------- Storage: CV (PDF) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cv', 'cv', true, 5242880, array['application/pdf'])
on conflict (id) do nothing;

create policy "admin unggah cv" on storage.objects for insert to authenticated
  with check (bucket_id = 'cv' and public.is_admin());
create policy "admin ubah cv" on storage.objects for update to authenticated
  using (bucket_id = 'cv' and public.is_admin());
create policy "admin hapus cv" on storage.objects for delete to authenticated
  using (bucket_id = 'cv' and public.is_admin());
create policy "admin lihat cv" on storage.objects for select to authenticated
  using (bucket_id = 'cv' and public.is_admin());
