import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Lindungi /admin/*: segarkan sesi Supabase, alihkan yang bukan admin ke halaman login. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const email = String(data?.claims?.email ?? "").toLowerCase();
  const isAdmin = Boolean(email) && email === process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const onLogin = request.nextUrl.pathname === "/admin/login";

  if (!isAdmin && !onLogin) {
    return redirectWithCookies(new URL("/admin/login", request.url), response);
  }
  if (isAdmin && onLogin) {
    return redirectWithCookies(new URL("/admin", request.url), response);
  }
  return response;
}

function redirectWithCookies(url: URL, from: NextResponse) {
  const res = NextResponse.redirect(url);
  from.cookies.getAll().forEach((c) => res.cookies.set(c));
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
