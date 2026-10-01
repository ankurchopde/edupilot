import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { isSafeNextPath } from "../../../lib/supabase/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const origin = url.origin;
  if (!code) return NextResponse.redirect(new URL(`/login?error=missing_code`, origin));
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.redirect(new URL(`/login?error=auth_not_configured`, origin));
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL(`/login?error=callback_failed`, origin));
  return NextResponse.redirect(new URL(isSafeNextPath(next) ? next! : "/", origin));
}
