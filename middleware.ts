import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasSession = Boolean(
    request.cookies.get("credentialchain_session")?.value
  );
  const dashboardRoute = pathname.startsWith("/dashboard");
  const credentialCollection = pathname === "/api/credentials";
  const ledgerRoute = pathname === "/api/ledger";
  const mutationRoute =
    request.method !== "GET" && pathname.startsWith("/api/credentials/");
  const authRoute = pathname === "/login" || pathname === "/signup";

  if ((dashboardRoute || credentialCollection || ledgerRoute || mutationRoute) && !hasSession) {
    if (dashboardRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 }
    );
  }

  if (authRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/credentials",
    "/api/credentials/:path*",
    "/api/ledger",
    "/login",
    "/signup",
  ],
};