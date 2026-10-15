import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "../env";

/** Klien secret key: melewati RLS. Hanya untuk insert pesan & rate limit di server. */
export function createServiceClient() {
  return createClient(env.supabaseUrl(), env.supabaseSecret(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
