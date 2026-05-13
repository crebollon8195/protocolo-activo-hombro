import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Auth pages — redirect to dashboard if already logged in
  if (pathname.startsWith("/auth/")) {
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      const dest = profile?.role === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return res;
  }

  // Protected patient routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/tracking") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/report") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/onboarding")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return res;
  }

  // Protected admin routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return res;
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tracking/:path*",
    "/analytics/:path*",
    "/report/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
};
