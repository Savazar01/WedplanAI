import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Better Auth uses 'better-auth.session_token' (useSecureCookies: false)
  // so we check that name only. The __secure- variant is disabled because
  // Coolify terminates SSL at the proxy layer and forwards HTTP internally.
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__secure-better-auth.session_token")?.value;

  const { pathname } = request.nextUrl;

  const isProtectedPath =
    pathname.startsWith("/wizard") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/kanban") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/guests") ||
    pathname.startsWith("/vendors");

  const isAuthPath = pathname === "/login";

  if (isProtectedPath && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && sessionToken) {
    if (request.nextUrl.searchParams.has("unauthenticated")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/wizard/:path*",
    "/dashboard/:path*",
    "/kanban/:path*",
    "/calendar/:path*",
    "/guests/:path*",
    "/vendors/:path*",
    "/login",
    "/signup",
  ],
};
