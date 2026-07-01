export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const REDIRECT_URL = "https://churchsuitsbusiness.com/register";
const DEFAULT_SOURCE_URL = "https://churchsuitsbusiness.com";

function clean(v) {
  return String(v || "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean(email));
}

function toTitleCase(value) {
  return clean(value)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isDevelopmentEnv() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.APP_ENV === "local" ||
    process.env.IS_LOCALHOST === "1"
  );
}

function getClientIp(req) {
  const forwarded = clean(req.headers.get("x-forwarded-for"));
  const realIp = clean(req.headers.get("x-real-ip"));

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return realIp || "";
}

async function addOrUpdateAffiliateNewsletter(data = {}) {
  const name = toTitleCase(data.name);
  const email = clean(data.email).toLowerCase();
  const telephone = clean(data.telephone);
  const ip = clean(data.ip);
  const user_agent = clean(data.user_agent);
  const source_url = clean(data.source_url);

  if (!email) {
    return false;
  }

  let existingRows = [];

  if (telephone) {
    [existingRows] = await db.query(
      `
      SELECT affiliate_newsletter_id
      FROM affiliate_newsletter
      WHERE email = ?
        AND telephone = ?
      LIMIT 1
      `,
      [email, telephone]
    );
  } else {
    [existingRows] = await db.query(
      `
      SELECT affiliate_newsletter_id
      FROM affiliate_newsletter
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );
  }

  const existing = existingRows?.[0];

  if (existing?.affiliate_newsletter_id) {
    await db.query(
      `
      UPDATE affiliate_newsletter
      SET
        name = ?,
        telephone = ?,
        ip = ?,
        user_agent = ?,
        source_url = ?,
        status = 1,
        is_delete = 0
      WHERE affiliate_newsletter_id = ?
      `,
      [
        name,
        telephone,
        ip,
        user_agent,
        source_url,
        Number(existing.affiliate_newsletter_id),
      ]
    );

    return Number(existing.affiliate_newsletter_id);
  }

  const [result] = await db.query(
    `
    INSERT INTO affiliate_newsletter
    (
      name,
      email,
      telephone,
      ip,
      user_agent,
      source_url,
      status,
      is_delete,
      date_added
    )
    VALUES
    (?, ?, ?, ?, ?, ?, 1, 0, NOW())
    `,
    [name, email, telephone, ip, user_agent, source_url]
  );

  return result?.insertId || true;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const email = clean(searchParams.get("email"));
    const telephone = clean(searchParams.get("telephone"));
    const source_url = clean(searchParams.get("source_url")) || DEFAULT_SOURCE_URL;
    const name = clean(searchParams.get("name"));

    if (!email || !isValidEmail(email)) {
      return NextResponse.redirect(REDIRECT_URL);
    }

    let ip = getClientIp(req);

    if (isDevelopmentEnv()) {
      ip = "127.0.0.1";
    }

    const user_agent = clean(req.headers.get("user-agent"));

    const newsletterData = {
      name,
      email: email.toLowerCase(),
      telephone,
      ip,
      user_agent,
      source_url,
    };

    await addOrUpdateAffiliateNewsletter(newsletterData);

    return NextResponse.redirect(REDIRECT_URL);
  } catch (error) {
    console.error("lead-tracking error:", error);

    return NextResponse.redirect(REDIRECT_URL);
  }
}