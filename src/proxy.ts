import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  console.log("[proxy]", request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|svg|jpg|jpeg|ico|webp|json|js|css)$).*)"],
};
