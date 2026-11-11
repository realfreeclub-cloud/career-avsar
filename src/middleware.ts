import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // Transparently rewrite /teaching-jobs-in-{slug} to /teaching-jobs/{slug}
  const match = pathname.match(/^\/teaching-jobs-in-([a-zA-Z0-9_-]+)\/?$/);
  if (match) {
    const slug = match[1].toLowerCase();
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/teaching-jobs/${slug}`;
    return NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/teaching-jobs-in-:slug*",
    "/admin/:path*",
    "/teacher/:path*",
    "/school/:path*",
  ],
};
