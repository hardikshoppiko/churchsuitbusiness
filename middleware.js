import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname, searchParams } = req.nextUrl;

  // ✅ allow public account routes
  if (
    pathname === "/account/login" ||
    pathname === "/account/forgot-password" ||
    pathname.startsWith("/account/reset-password")
  ) {
    return NextResponse.next();
  }

  // ✅ protect rest of /account/*
  if (pathname.startsWith("/account")) {
    const token = req.cookies.get(process.env.LOGIN_COOKIE_NAME || "wsf_session")?.value;

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/account/login";
      url.searchParams.set("redirect", pathname + (searchParams.toString() ? `?${searchParams}` : ""));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*"],
};