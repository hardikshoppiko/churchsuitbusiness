import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
// import { createSession } from "@/lib/auth";

function base64urlDecode(input) {
  const normalized = String(input || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const pad = normalized.length % 4;
  const padded = pad ? normalized + "=".repeat(4 - pad) : normalized;

  return Buffer.from(padded, "base64").toString("utf8");
}

function base64urlEncodeBuffer(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function verifyAdminSsoToken(token, secret) {
  if (!token || !secret) {
    return { ok: false, message: "Missing token or secret" };
  }

  const parts = String(token).split(".");
  if (parts.length !== 2) {
    return { ok: false, message: "Invalid token format" };
  }

  const [payloadEncoded, signatureEncoded] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadEncoded)
    .digest();

  const expectedSignatureEncoded = base64urlEncodeBuffer(expectedSignature);

  const sigA = Buffer.from(signatureEncoded);
  const sigB = Buffer.from(expectedSignatureEncoded);

  if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
    return { ok: false, message: "Invalid token signature" };
  }

  let payload;
  try {
    payload = JSON.parse(base64urlDecode(payloadEncoded));
  } catch {
    return { ok: false, message: "Invalid token payload" };
  }

  const now = Math.floor(Date.now() / 1000);

  if (!payload?.affiliate_id || !payload?.email) {
    return { ok: false, message: "Missing token data" };
  }

  if (!payload?.exp || now > Number(payload.exp)) {
    return { ok: false, message: "Token expired" };
  }

  return { ok: true, payload };
}

function buildRedirect(path) {
  const appUrl = process.env.APP_URL || "https://churchsuitsbusiness.com";
  return new URL(path, appUrl);
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || "";
    const secret = process.env.ADMIN_SSO_SECRET || "";

    const verified = verifyAdminSsoToken(token, secret);

    if (!verified.ok) {
      return NextResponse.redirect(
        buildRedirect(`/account/login?msg=${encodeURIComponent(verified.message)}`)
      );
    }

    const affiliateId = Number(verified.payload.affiliate_id);
    const email = String(verified.payload.email || "").trim();

    const [userRows] = await db.query(
      "SELECT * FROM affiliate_user WHERE affiliate_id = ? AND LOWER(email) = LOWER(?) LIMIT 1",
      [affiliateId, email]
    );

    const user = userRows?.[0];

    if (!user) {
      return NextResponse.redirect(
        buildRedirect(`/account/login?msg=${encodeURIComponent("Affiliate user not found")}`)
      );
    }

    if (Number(user.status) !== 1) {
      return NextResponse.redirect(
        buildRedirect(`/account/login?msg=${encodeURIComponent("Affiliate account is inactive")}`)
      );
    }

    const [affiliateRows] = await db.query("SELECT * FROM affiliate WHERE affiliate_id = ? LIMIT 1", [affiliateId]);

    const affiliateData = affiliateRows?.[0];

    if (!affiliateData) {
      return NextResponse.redirect(
        buildRedirect(`/account/login?msg=${encodeURIComponent("Affiliate record not found")}`)
      );
    }

    const affiliateUserName = user.username || user.email || "";

    // await createSession({
    //   affiliate_user_id: Number(user.affiliate_user_id),
    //   affiliate_id: Number(user.affiliate_id),
    //   username: String(affiliateUserName || ""),
    //   email: String(user.email || ""),
    //   telephone: String(user.telephone || ""),
    //   firstname: String(user.firstname || ""),
    //   lastname: String(user.lastname || ""),
    //   store_name: String(affiliateData?.store_name || ""),
    //   website: String(affiliateData?.website || ""),
    //   start_date: String(affiliateData?.start_date || ""),
    //   end_date: String(affiliateData?.end_date || ""),
    //   login_type: "admin_auto_login",
    // });

    return NextResponse.redirect(buildRedirect("/account"));
  } catch (e) {
    console.error("Admin auto login failed:", e);

    return NextResponse.redirect(
      buildRedirect(`/account/login?msg=${encodeURIComponent("Auto login failed")}`)
    );
  }
}