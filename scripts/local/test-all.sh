#!/bin/sh
# Semua uji lokal dengan urutan yang benar. Butuh Supabase lokal (npx supabase start) dan port 3000 kosong.
# visual-diff harus jalan pada build segar dari seed: db:reset mengubah DB tanpa merevalidasi cache halaman.
set -e
if curl -s -o /dev/null http://localhost:3000; then
  echo "Port 3000 dipakai. Hentikan server lain dulu."; exit 1
fi
npm run -s lint
npm run -s test:fields
sh scripts/local/reset.sh
npm run -s build >/dev/null
npx next start -p 3000 >/dev/null 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null' EXIT
until curl -s -o /dev/null http://localhost:3000; do sleep 0.5; done
npm run -s visual-diff
npm run -s test:reveal
sh scripts/local/reset.sh && npm run -s test:rls
sh scripts/local/reset.sh && npm run -s test:e2e
sh scripts/local/reset.sh && npm run -s test:cursor
sh scripts/local/reset.sh
echo "SEMUA UJI LULUS"
