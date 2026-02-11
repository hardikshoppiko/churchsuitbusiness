// src/app/api/account/forgot-password/route.js
export const runtime = "nodejs";

import crypto from "crypto";

import { db } from "@/lib/db";
import { normalizeLogin, isTenDigitPhone, getClientIp } from "@/lib/db-utils";

import { sendForgotPasswordEmail } from "@/lib/email";

function makeCode() {
  // sha1(uniqid(mt_rand(), true)) style (safe random)
  return crypto.createHash("sha1").update(crypto.randomBytes(32)).digest("hex");
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    // console.log("Forgot password request body:", body);

    const login = normalizeLogin(body?.email || body?.username || body?.login);

    if (!login) {
      return Response.json(
        { ok: false, message: "Email or phone is required" },
        { status: 400 }
      );
    }

    const isPhone = isTenDigitPhone(login);
    const phoneDigits = String(login).replace(/\D/g, "");

    // Find user by email OR phone (like your PHP)
    const [rows] = await db.query(
      isPhone
        ? "SELECT affiliate_user_id, affiliate_id, email, status, firstname, lastname FROM affiliate_user WHERE REPLACE(REPLACE(REPLACE(telephone,' ',''),'-',''),'(','') LIKE ? LIMIT 1"
        : "SELECT affiliate_user_id, affiliate_id, email, status, firstname, lastname FROM affiliate_user WHERE LOWER(email)=LOWER(?) LIMIT 1",
      [isPhone ? `%${phoneDigits}%` : login]
    );

    const user = rows?.[0] || null;

    // ✅ Recommended: do NOT reveal if user exists (prevents email enumeration)
    // If you want strict OpenCart behavior, change this to: return 400 with error message.
    if (!user) {
      return Response.json({
        ok: true,
        message: "If this account exists, a reset link has been sent.",
      });
    }

    if (Number(user.status) !== 1) {
      return Response.json(
        { ok: false, message: "Your account is inactive. Please contact support." },
        { status: 403 }
      );
    }

    const code = makeCode();

    // Save code in DB (same as editCode)
    await db.query(
      "UPDATE affiliate_user SET code=? WHERE affiliate_user_id=? LIMIT 1",
      [code, Number(user.affiliate_user_id)]
    );

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const storeName = process.env.STORE_NAME || "Affiliate Program";

    const resetUrl = `${appUrl}/account/reset?code=${encodeURIComponent(code)}`;
    const ip = getClientIp?.(req) || "";

    const to = String(user.email || "").trim();

    if (to) {
      await sendForgotPasswordEmail({
        to,
        name: `${String(user.firstname || "").trim()} ${String(user.lastname || "").trim()}`.trim(),
        storeName,
        resetUrl,
        ip,
      });
    }

    return Response.json({
      ok: true,
      message: "If this account exists, a reset link has been sent.",
    });
  } catch (e) {
    console.error("Forgot password failed:", e);
    return Response.json(
      { ok: false, message: "Failed to send reset link" },
      { status: 500 }
    );
  }
}