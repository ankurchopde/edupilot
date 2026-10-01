import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig, isSafeNextPath } from "./lib/supabase/config";

export async function middleware(request: NextRequest) {
  const config = getSupabaseConfig();
  if (!config) return NextResponse.next();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname === "/login" || pathname.startsWith("/auth/");
  if (!user && !isAuthPage) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ available: false, error: "Authentication required." }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone(); loginUrl.pathname = "/login";
    const nextPath = `${pathname}${request.nextUrl.search}`;
    if (isSafeNextPath(nextPath)) loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }
  if (user && pathname === "/login") {
    const nextPath = request.nextUrl.searchParams.get("next");
    return NextResponse.redirect(new URL(isSafeNextPath(nextPath) ? nextPath! : "/", request.url));
  }
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
