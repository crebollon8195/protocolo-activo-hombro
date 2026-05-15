import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tracker.drcarlosrebollon.com";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    console.error("[auth/callback] No code parameter received");
    return NextResponse.redirect(new URL("/auth/login?error=missing_code", APP_URL));
  }

  const supabase = createServerClient();

  // Exchange the auth code for a session (PKCE flow)
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("[auth/callback] Code exchange failed:", error?.message);
    return NextResponse.redirect(new URL("/auth/login?error=exchange_failed", APP_URL));
  }

  // Determine destination based on role (use admin client to bypass RLS)
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const dest = profile?.role === "admin" ? "/admin" : next;

  return NextResponse.redirect(new URL(dest, APP_URL));
}
