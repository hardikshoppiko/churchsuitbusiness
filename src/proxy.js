import { NextResponse } from "next/server";

const COOKIE_NAME = process.env.LOGIN_COOKIE_NAME || "wsf_session";

export function proxy(req) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isLoggedIn = !!token;

  // ✅ Public routes (NO login required)
  // NOTE: /account/reset?code=XXXXX must be allowed publicly.
  const isPublicAccountRoute =
    pathname === "/account/login" ||
    pathname === "/account/forgot-password" ||
    pathname === "/account/reset" || // ✅ /account/reset?code=XXXXX
    pathname.startsWith("/account/reset-password");

  // ✅ If logged-in user visits /register -> go to /account
  if (isLoggedIn && pathname.startsWith("/register")) {
    const url = req.nextUrl.clone();
    url.pathname = "/account";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // ✅ If logged-in user visits /account/login or /account/forgot-password -> go to /account
  // IMPORTANT: Do NOT redirect /account/reset because user might be resetting password via emailed link.
  if (
    isLoggedIn &&
    (pathname === "/account/login" || pathname === "/account/forgot-password" || pathname === "/account/reset")
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/account";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // ✅ Allow public account routes
  if (isPublicAccountRoute) {
    return NextResponse.next();
  }

  // ✅ Protect rest of /account/*
  if (pathname.startsWith("/account") && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/account/login";

    const redirectTo = pathname + (req.nextUrl.search || "");
    url.searchParams.set("redirect", redirectTo);

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/register/:path*"],
};