import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server"; // Force HMR

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPath = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register";

  // 1. If logged in and on auth path, redirect to dashboard
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Protected Routes - General (Dashboard)
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // 3. Protected Routes - Instructor
  if (request.nextUrl.pathname.startsWith("/instructor")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    // Check role from JWT app_metadata (Synced from profiles table)
    const role = user.app_metadata?.user_role;

    if (role !== "instructor" && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 4. Protected Routes - Admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    // Check role from JWT app_metadata (Synced from profiles table)
    const role = user.app_metadata?.user_role;

    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 5. Protected Routes - Exams
  const isExamPath = 
    request.nextUrl.pathname.match(/^\/exams\/[^\/]+$/) ||
    request.nextUrl.pathname.match(/^\/tutorials\/[^\/]+\/exam$/) ||
    request.nextUrl.pathname.match(/^\/learn\/[^\/]+\/[^\/]+\/exam$/);
    
  if (isExamPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
