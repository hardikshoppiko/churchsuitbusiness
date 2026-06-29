export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function clean(v) {
  return String(v || "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim());
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
  const name = clean(data.name);
  const email = clean(data.email).toLowerCase();
  const telephone = clean(data.telephone);
  const ip = clean(data.ip);
  const user_agent = clean(data.user_agent);
  const source_url = clean(data.source_url);

  if (!email) {
    return false;
  }

  let existingRows;

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
  const redirect = "https://churchsuitsbusiness.com/register";

  try {
    const { searchParams } = new URL(req.url);

    const email = clean(searchParams.get("email"));
    const telephone = clean(searchParams.get("telephone"));
    const source_url = clean(searchParams.get("source_url")) || redirect;
    const name = clean(searchParams.get("name"));

    if (!email || !isValidEmail(email)) {
      return NextResponse.redirect(redirect);
    }

    let ip = getClientIp(req);

    if (
      ip === "::1" ||
      ip === "127.0.0.1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.")
    ) {
      ip = "127.0.0.1";
    }

    const user_agent = clean(req.headers.get("user-agent"));

    const newsletter_data = {
      name: name
        ? name
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : "",
      email: email.toLowerCase(),
      telephone,
      ip,
      user_agent,
      source_url,
    };

    await addOrUpdateAffiliateNewsletter(newsletter_data);

    return NextResponse.redirect(redirect);
  } catch (error) {
    return NextResponse.redirect("https://churchsuitsbusiness.com/register");
  }
}