import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  AUTH_ROUTES,
  PROFILE_ROUTE,
  ROLE_HOME,
  VERIFICATION_ROUTE,
} from "@/lib/config";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";
import type { Database } from "@/types/database.types";

type UserRole = Database["public"]["Enums"]["user_role"];

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

function findProtectedRole(pathname: string): UserRole | null {
  const entries = Object.entries(ROLE_HOME) as Array<[UserRole, string]>;
  const match = entries.find(([, home]) => pathname.startsWith(home));
  return match ? match[0] : null;
}

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const requiredRole = findProtectedRole(pathname);

  if (!user) {
    if (requiredRole) {
      return redirectTo(request, "/login");
    }
    return response;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, verification_status")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    if (requiredRole) {
      return redirectTo(request, "/login");
    }
    return response;
  }

  const home = ROLE_HOME[profile.role];
  const isVerified = profile.verification_status === "verified";

  if (isAuthRoute(pathname)) {
    return redirectTo(request, isVerified ? home : VERIFICATION_ROUTE);
  }

  if (pathname.startsWith(VERIFICATION_ROUTE)) {
    return isVerified ? redirectTo(request, home) : response;
  }

  if (!requiredRole) {
    return response;
  }

  if (requiredRole !== profile.role) {
    return redirectTo(request, home);
  }

  if (isVerified) {
    return response;
  }

  const profileRoute =
    profile.role === "admin" ? null : PROFILE_ROUTE[profile.role];

  if (profileRoute && pathname === profileRoute) {
    return response;
  }

  return redirectTo(request, VERIFICATION_ROUTE);
}
