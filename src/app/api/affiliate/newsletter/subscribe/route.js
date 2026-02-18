export const runtime = "nodejs";

import { db } from "@/lib/db";
import { dbEscape, isEmail } from "@/lib/db-utils";

function digitsOnly(v) {
  return String(v || "").replace(/\D/g, "");
}

function getClientIp(req) {

  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0].trim();
  }

  const cf = req.headers.get("cf-connecting-ip");
  if (cf) {
    return cf.trim();
  }

  return "127.0.0.1";
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = String(body?.email || "").trim().toLowerCase();
    const telephone = digitsOnly(body?.telephone || "");
    const source_url = String(body?.source_url || "").trim().slice(0, 255);

    if (!email || !isEmail(email)) {
      return Response.json({ ok: false, message: "Valid email is required." }, { status: 400 });
    }

    // phone still required (your popup requirement)
    if (!telephone || telephone.length < 10 || telephone.length > 15) {
      return Response.json({ ok: false, message: "Valid mobile number is required." }, { status: 400 });
    }

    // Check if email already exists
    const [existsRows] = await db.query(`SELECT affiliate_newsletter_id FROM affiliate_newsletter WHERE LOWER(email)=LOWER(?) LIMIT 1`, [email]);

    if (existsRows?.length) {
      // already subscribed by email -> don't insert again
      return Response.json({
        ok: true,
        message: "Already subscribed.",
        already: true,
      });
    }

    const ip = getClientIp(req);
    
    const user_agent = String(req.headers.get("user-agent") || "").slice(0, 255);

    // Insert only if not exists
    await db.query(`INSERT INTO affiliate_newsletter (email, telephone, ip, user_agent, source_url, status, date_added) VALUES ('${dbEscape(email)}','${dbEscape(telephone)}','${dbEscape(ip)}','${dbEscape(user_agent)}','${dbEscape(source_url)}',1,NOW())`);

    return Response.json({ ok: true, message: "Subscribed successfully." });
  } catch (e) {
    console.log("affiliate newsletter subscribe error:", e?.message || e);
    return Response.json({ ok: false, message: "Failed to subscribe. Please try again." }, { status: 500 });
  }
}