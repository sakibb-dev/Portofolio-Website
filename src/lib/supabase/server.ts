import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "../env";

/** Klien dengan sesi admin dari cookie (RLS berlaku sebagai pengguna login). */
export async function createSessionClient() {
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl(), env.supabaseKey(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Dipanggil dari Server Component: cookie diperbarui oleh proxy.
        }
      },
    },
  });
}
