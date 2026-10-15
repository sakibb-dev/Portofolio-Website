#!/bin/sh
# Reset DB lokal ke seed + buat akun uji (admin@example.com / bukan-admin@example.com, sandi rahasia-lokal-123).
# Kunci dibaca dari `supabase status`, tidak ditulis di repo.
set -e
eval "$(npx supabase status -o env 2>/dev/null | grep -E '^(API_URL|DB_URL|SECRET_KEY)=')"
npx supabase db reset >/dev/null 2>&1
for e in admin@example.com bukan-admin@example.com; do
  curl -s -o /dev/null -X POST "$API_URL/auth/v1/admin/users" -H "apikey: $SECRET_KEY" -H "Authorization: Bearer $SECRET_KEY" \
    -H 'Content-Type: application/json' -d "{\"email\":\"$e\",\"password\":\"rahasia-lokal-123\",\"email_confirm\":true}"
done
psql -q "$DB_URL" -c "insert into public.admins(email) values ('admin@example.com')"
echo reset-ok
