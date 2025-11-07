import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "./types";
import {
  isPublicRoute,
  isAuthRoute,
  isProtectedRoute,
  DEFAULT_LOGIN_REDIRECT,
  DEFAULT_AUTH_REDIRECT,
} from "@/lib/config/routes";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ============================================================================
  // ROUTE PROTECTION LOGIC
  // ============================================================================

  const { pathname } = request.nextUrl;

  // 1. Check if route is public (allow everyone)
  if (isPublicRoute(pathname)) {
    return supabaseResponse;
  }

  // 2. Check if user is trying to access auth routes (login, signup, etc.)
  if (isAuthRoute(pathname)) {
    // If user is already logged in, redirect to dashboard
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = DEFAULT_LOGIN_REDIRECT;
      return NextResponse.redirect(url);
    }
    // If not logged in, allow access to auth routes
    return supabaseResponse;
  }

  // 3. Check if route is protected (requires authentication)
  if (isProtectedRoute(pathname)) {
    // If user is not logged in, redirect to login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = DEFAULT_AUTH_REDIRECT;
      // Optional: Add callbackUrl to redirect back after login
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    // If logged in, allow access
    return supabaseResponse;
  }

  // 4. For any other route, allow access (fail-safe)
  return supabaseResponse;
}
