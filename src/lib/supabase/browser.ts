"use client";
import { createBrowserClient } from "@supabase/ssr";

/** Klien browser dengan sesi admin (dipakai untuk unggah CV langsung ke Storage). */
export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
