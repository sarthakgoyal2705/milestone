import { NextResponse } from "next/server";
import { auth } from "@/auth";

const AUTH_ROUTES = ["/login", "/forgot-password", "/reset-password"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthed = !!req.auth?.user;
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isDashboardRoute = pathname.startsWith("/dashboard") || isProtectedRoute(pathname);

  if (isAuthRoute && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (isDashboardRoute && !isAuthed) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isDashboardRoute && isAuthed) {
    const role = req.auth?.user.role;
    if (isAdminOnlyRoute(pathname) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    if (isManagerUpRoute(pathname) && role === "EMPLOYEE") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  return NextResponse.next();
});

const DASHBOARD_PREFIXES = [
  "/directory",
  "/org-chart",
  "/goals",
  "/leave",
  "/attendance",
  "/payroll",
  "/recruitment",
  "/onboarding",
  "/documents",
  "/notifications",
  "/reports",
  "/admin",
];

function isProtectedRoute(pathname: string) {
  return DASHBOARD_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAdminOnlyRoute(pathname: string) {
  return pathname.startsWith("/admin");
}

function isManagerUpRoute(pathname: string) {
  return (
    pathname.startsWith("/leave/approvals") ||
    pathname.startsWith("/attendance/timesheets") ||
    pathname.startsWith("/payroll/admin") ||
    pathname.startsWith("/recruitment/new") ||
    pathname.startsWith("/onboarding/admin")
  );
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|svg|jpg|jpeg|ico)$).*)"],
};
