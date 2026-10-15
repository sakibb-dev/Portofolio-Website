import "server-only";

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Env ${name} belum diisi (lihat .env.example).`);
  return v;
}

export const env = {
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseKey: () => required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  supabaseSecret: () => required("SUPABASE_SECRET_KEY"),
  adminEmail: () => required("ADMIN_EMAIL").trim().toLowerCase(),
  hasSupabase: () =>
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
};
