import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function GET(req) {
  try {
    // 1) session
    const session = await getSession();
    const affiliate_id = Number(session?.affiliate_id || 0);

    if (!affiliate_id) {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    // 2) affiliate -> stripe_customer_id
    const [rows] = await db.query(`SELECT stripe_customer_id FROM affiliate WHERE affiliate_id=? LIMIT 1`, [affiliate_id]);

    const stripe_customer_id = String(rows?.[0]?.stripe_customer_id || "").trim();

    if (!stripe_customer_id) {
      return Response.json({ ok: true, invoices: [], has_more: false });
    }

    // 3) pagination params (optional)
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 10), 1), 100);
    const starting_after = searchParams.get("starting_after") || undefined;

    // 4) stripe list invoices
    const invoices = await stripe.invoices.list({
      customer: stripe_customer_id,
      limit,
      starting_after,
    });

    // 5) return safe response
    const result = (invoices.data || []).map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      currency: inv.currency,
      total: inv.total,
      amount_due: inv.amount_due,
      amount_paid: inv.amount_paid,
      created: inv.created,
      hosted_invoice_url: inv.hosted_invoice_url,
      invoice_pdf: inv.invoice_pdf,
    }));

    return Response.json({
      ok: true,
      invoices: result,
      has_more: invoices.has_more,
      next_starting_after: result.length ? result[result.length - 1].id : null,
    });
  } catch (err) {
    console.error("Invoice API error:", err);
    return Response.json({ ok: false, message: err.message || "Server error" }, { status: 500 });
  }
}