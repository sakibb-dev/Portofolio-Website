import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "../env";

/** Klien tanpa sesi (peran anon) untuk konten publik yang di-cache. */
export function createPublicClient() {
  return createClient(env.supabaseUrl(), env.supabaseKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
