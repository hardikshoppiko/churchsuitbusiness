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

/**
 * If Mailchimp merge tags were not replaced,
 * treat them as blank values.
 */
function normalizeMailchimpValue(value) {
  const v = clean(value);

  if (!v) {
    return "";
  }

  // exact placeholder like *|EMAIL|*
  if (/^\*\|[A-Z0-9_]+\|\*$/i.test(v)) {
    return "";
  }

  // combined unresolved placeholders like "*|FNAME|* *|LNAME|*"
  const removed = v.replace(/\*\|[A-Z0-9_]+\|\*/gi, "").trim();

  if (!removed) {
    return "";
  }

  return v;
}

function normalizeTelephone(value) {
  let phone = normalizeMailchimpValue(value).replace(/\D/g, "");

  if (!phone) {
    return "";
  }

  if (phone.length > 10) {
    phone = phone.slice(-10);
  }

  return phone;
}

/**
 * Find telephone by email from old/new system tables
 * Order:
 * 1) affiliate
 * 2) customer
 * 3) order
 * 4) shopify_order
 */
async function getTelephoneByEmail(email) {
  const safeEmail = clean(email).toLowerCase();

  if (!safeEmail) {
    return "";
  }

  let [rows] = await db.query(
    `
    SELECT telephone
    FROM affiliate
    WHERE LOWER(email) = ?
      AND telephone IS NOT NULL
      AND telephone != ''
    ORDER BY affiliate_id DESC
    LIMIT 1
    `,
    [safeEmail]
  );

  if (rows?.[0]?.telephone) {
    return normalizeTelephone(rows[0].telephone);
  }

  [rows] = await db.query(
    `
    SELECT telephone
    FROM customer
    WHERE LOWER(email) = ?
      AND telephone IS NOT NULL
      AND telephone != ''
    ORDER BY customer_id DESC
    LIMIT 1
    `,
    [safeEmail]
  );

  if (rows?.[0]?.telephone) {
    return normalizeTelephone(rows[0].telephone);
  }

  [rows] = await db.query(
    `
    SELECT telephone
    FROM \`order\`
    WHERE LOWER(email) = ?
      AND telephone IS NOT NULL
      AND telephone != ''
    ORDER BY order_id DESC
    LIMIT 1
    `,
    [safeEmail]
  );

  if (rows?.[0]?.telephone) {
    return normalizeTelephone(rows[0].telephone);
  }

  [rows] = await db.query(
    `
    SELECT telephone
    FROM shopify_order
    WHERE LOWER(email) = ?
      AND telephone IS NOT NULL
      AND telephone != ''
    ORDER BY shopify_order_id DESC
    LIMIT 1
    `,
    [safeEmail]
  );

  if (rows?.[0]?.telephone) {
    return normalizeTelephone(rows[0].telephone);
  }

  return "";
}

/**
 * live affiliate means affiliate_status_id = 100
 */
async function getLiveAffiliateByEmail(email) {
  const safeEmail = clean(email).toLowerCase();

  if (!safeEmail) {
    return null;
  }

  const [rows] = await db.query(
    `
    SELECT affiliate_id, date_added, status, approved, is_delete, affiliate_status_id
    FROM affiliate
    WHERE LOWER(email) = ?
      AND IFNULL(is_delete, 0) = 0
    ORDER BY affiliate_id DESC
    LIMIT 1
    `,
    [safeEmail]
  );

  const row = rows?.[0];
  if (!row) {
    return null;
  }

  const isLive =
    Number(row.is_delete || 0) === 0 &&
    Number(row.affiliate_status_id || 0) === 100;

  if (!isLive) {
    return null;
  }

  return {
    affiliate_id: Number(row.affiliate_id || 0),
    date_added: row.date_added || null,
  };
}

async function addOrUpdateAffiliateNewsletter(data = {}) {
  const name = toTitleCase(normalizeMailchimpValue(data.name));
  const email = clean(normalizeMailchimpValue(data.email)).toLowerCase();
  let telephone = normalizeTelephone(data.telephone);
  const ip = clean(data.ip);
  const user_agent = clean(data.user_agent);

  let source_url = normalizeMailchimpValue(data.source_url);
  source_url = source_url || DEFAULT_SOURCE_URL;

  if (!email) {
    return false;
  }

  // if telephone blank, try to fetch from system by email
  if (!telephone) {
    telephone = await getTelephoneByEmail(email);
  }

  const liveAffiliate = await getLiveAffiliateByEmail(email);

  const is_registered = liveAffiliate ? 1 : 0;
  const converted_affiliate_id = liveAffiliate
    ? Number(liveAffiliate.affiliate_id || 0)
    : 0;
  const converted_at = liveAffiliate ? liveAffiliate.date_added || null : null;

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
        is_registered = ?,
        converted_affiliate_id = ?,
        converted_at = ?,
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
        is_registered,
        converted_affiliate_id,
        converted_at,
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
      is_registered,
      converted_affiliate_id,
      converted_at,
      status,
      is_delete,
      date_added
    )
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW())
    `,
    [
      name,
      email,
      telephone,
      ip,
      user_agent,
      source_url,
      is_registered,
      converted_affiliate_id,
      converted_at,
    ]
  );

  return result?.insertId || true;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const email = clean(normalizeMailchimpValue(searchParams.get("email")));
    const telephone = normalizeTelephone(searchParams.get("telephone"));
    const source_url =
      normalizeMailchimpValue(searchParams.get("source_url")) ||
      DEFAULT_SOURCE_URL;

    const firstName = normalizeMailchimpValue(searchParams.get("name"));
    const name = clean(firstName);

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