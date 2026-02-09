import { db } from "@/lib/db";
import { dbEscape } from "@/lib/db-utils";

import { getSubscriptionClientSecret } from "@/lib/affiliate-payment-service";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const affiliate_id = body?.affiliate_id;

  if (!affiliate_id) {
    return Response.json({ message: "affiliate_id is required" }, { status: 400 });
  }

  const result = await getSubscriptionClientSecret(affiliate_id);

  if (result.affiliate_status === "not_found") {
    return Response.json({ message: "Affiliate not found" }, { status: 404 });
  }

  if (result.affiliate_status === "paid") {
    return Response.json({ affiliate_status: "paid" });
  }

  if (result.affiliate_status === "error") {
    return Response.json({ message: result.message || "Payment init failed" }, { status: 500 });
  }

  return Response.json({
    affiliate_status: "ready",
    clientSecret: result.clientSecret,
  });
}

/**
 * ✅ GET (NEW)
 * Used by success page to show affiliate + last payment info
 *
 * Example:
 * /api/affiliate/payment-intent?affiliate_id=123
 */
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const affiliate_id = Number(url.searchParams.get("affiliate_id") || 0);

    if (!affiliate_id) {
      return Response.json({ message: "affiliate_id is required" }, { status: 400 });
    }

    // Affiliate info
    const [affRows] = await db.query(`SELECT * FROM affiliate WHERE affiliate_id=${affiliate_id}`);

    const affiliate = affRows?.[0] || null;

    if (!affiliate) {
      return Response.json({ message: "Affiliate not found" }, { status: 404 });
    }

    // Latest payment row (for UI)
    const [payRows] = await db.query(`SELECT affiliate_payment_id, payment_charge_id, invoice_number, amount, start_date, end_date, payment_status, date_added FROM affiliate_payment WHERE affiliate_id=${affiliate_id} ORDER BY affiliate_payment_id DESC LIMIT 1`);

    const latest_payment = payRows?.[0] || null;

    // Stage helper (first vs renewal)
    const [firstPaidRows] = await db.query(`SELECT affiliate_payment_id FROM affiliate_payment WHERE affiliate_id=${affiliate_id} AND payment_status=1 ORDER BY affiliate_payment_id ASC LIMIT 1`);

    const payment_stage = firstPaidRows?.length ? "renewal" : "first";

    return Response.json({
      success: true,
      affiliate,
      latest_payment,
      payment_stage,
    });
  } catch (e) {
    return Response.json({ message: e?.message || "Server error" }, { status: 500 });
  }
}