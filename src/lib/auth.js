import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = process.env.LOGIN_COOKIE_NAME || "wsf_session";

// safe parse (env can be undefined or invalid)
const MAX_AGE_SEC = (() => {
  const raw = process.env.LOGIN_COOKIE_MAX_AGE;
  const n = parseInt(String(raw || ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 60 * 60 * 24 * 7; // fallback 7 days
})();

function getSecret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is missing in .env.local");
  return new TextEncoder().encode(s);
}

export async function createSession(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(getSecret());

  // ✅ cookies() is async in Route Handlers
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });

  return token;
}

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}