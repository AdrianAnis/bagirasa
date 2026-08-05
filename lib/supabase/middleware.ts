import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { AUTH_ROUTES, ROLE_HOME } from "@/lib/config";
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
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    if (requiredRole) {
      return redirectTo(request, "/login");
    }
    return response;
  }

  const home = ROLE_HOME[profile.role];

  if (isAuthRoute(pathname)) {
    return redirectTo(request, home);
  }

  if (requiredRole && requiredRole !== profile.role) {
    return redirectTo(request, home);
  }

  return response;
}
