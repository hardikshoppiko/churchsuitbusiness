export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const TABLE_NAME = "affiliate_mailchimp_campaign_cron_lead";

function clean(value) {
  return String(value || "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim());
}

function safeRedirect(url, fallback) {
  const raw = clean(url);
  if (!raw) return fallback;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch (e) {}

  return fallback;
}

export async function GET(req) {
  const fallbackRedirect = process.env.APP_URL
    ? `${process.env.APP_URL}/register`
    : "http://localhost:3000/register";

  try {
    const { searchParams } = new URL(req.url);

    const campaign_id = clean(searchParams.get("campaign_id"));
    const audience_id = clean(searchParams.get("audience_id"));
    const name = clean(searchParams.get("name"));
    const email = clean(searchParams.get("email")).toLowerCase();
    const telephone = clean(searchParams.get("telephone"));
    const redirectRaw = clean(searchParams.get("redirect"));

    const redirectUrl = safeRedirect(redirectRaw, fallbackRedirect);

    if (!campaign_id || !audience_id || !email || !isValidEmail(email)) {
      return NextResponse.redirect(redirectUrl);
    }

    const [existingRows] = await db.query(
      `
      SELECT affiliate_mailchimp_campaign_cron_lead_id
      FROM ${TABLE_NAME}
      WHERE campaign_id = ?
        AND audience_id = ?
        AND email = ?
      LIMIT 1
      `,
      [campaign_id, audience_id, email]
    );

    const existing = existingRows?.[0];

    if (existing?.affiliate_mailchimp_campaign_cron_lead_id) {
      await db.query(
        `
        UPDATE ${TABLE_NAME}
        SET
          name = ?,
          telephone = ?,
          status = 1,
          is_delete = 0
        WHERE affiliate_mailchimp_campaign_cron_lead_id = ?
        `,
        [
          name,
          telephone,
          Number(existing.affiliate_mailchimp_campaign_cron_lead_id),
        ]
      );
    } else {
      await db.query(
        `
        INSERT INTO ${TABLE_NAME}
        (
          campaign_id,
          audience_id,
          name,
          email,
          telephone,
          is_lead_convert_to_affiliate_store,
          converted_affiliate_id,
          status,
          date_added,
          is_delete
        )
        VALUES
        (?, ?, ?, ?, ?, 0, 0, 1, NOW(), 0)
        `,
        [campaign_id, audience_id, name, email, telephone]
      );
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    return NextResponse.redirect(fallbackRedirect);
  }
}